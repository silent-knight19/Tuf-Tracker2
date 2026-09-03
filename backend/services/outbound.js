/**
 * S13 — mandatory chokepoint for ALL backend-originated HTTP(S) fetches.
 *
 * Policy (fail closed):
 *  - protocol allowlist: http/https only (no file:, ftp:, gopher:, …).
 *  - server-side targets must never be loopback / private / link-local /
 *    metadata IPs — checked against DNS-RESOLVED addresses, so decimal/hex/
 *    octal obfuscation (`http://2130706433/`) is neutralized. Hosts that do
 *    not resolve are refused.
 *  - redirects: never followed by default (maxRedirects: 0); each followed
 *    hop is re-validated when enabled.
 *  - response bodies capped (default 256KB), requests time out (default 10s).
 *
 * Non-goals (documented, not ignored): DNS-rebinding TOCTOU between the
 * lookup and connect is accepted for operator-configured URLs (the only
 * consumer today); future webhook-style features taking user URLs must pin
 * the resolved IP (see s13-ssrf.md). A static test bans raw http/https/fetch
 * clients everywhere else in backend/.
 */

const http = require('http');
const https = require('https');
const dns = require('dns').promises;
const net = require('net');

class OutboundError extends Error {
  constructor(code, message) {
    super(message);
    this.name = 'OutboundError';
    this.code = code;
  }
}

function ipToInt(ip) {
  return ip.split('.').reduce((acc, oct) => (acc << 8) + parseInt(oct, 10), 0) >>> 0;
}

function inCidr(ip, base, bits) {
  if (bits === 0) return true;
  const mask = bits === 32 ? 0xffffffff : (~((1 << (32 - bits)) - 1)) >>> 0;
  return (ipToInt(ip) & mask) === (ipToInt(base) & mask);
}

/** True when an IPv4 literal is non-routable / sensitive. */
function isBlockedV4(ip) {
  const deny = [
    ['0.0.0.0', 8], // this-host / unspecified
    ['10.0.0.0', 8], // RFC1918
    ['100.64.0.0', 10], // CGNAT
    ['127.0.0.0', 8], // loopback
    ['169.254.0.0', 16], // link-local incl. cloud metadata
    ['172.16.0.0', 12], // RFC1918
    ['192.0.0.0', 24], // special-use
    ['192.0.2.0', 24], // TEST-NET (never a real target)
    ['192.168.0.0', 16], // RFC1918
    ['198.18.0.0', 15], // benchmarking
    ['198.51.100.0', 24], // TEST-NET
    ['203.0.113.0', 24], // TEST-NET
    ['224.0.0.0', 4], // multicast
    ['240.0.0.0', 4], // reserved
  ];
  return deny.some(([base, bits]) => inCidr(ip, base, bits));
}

/** Normalize IPv4-mapped IPv6 (`::ffff:127.0.0.1`) to its embedded IPv4. */
function unwrapV6(ip) {
  const m = ip.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/i);
  return m ? m[1] : ip;
}

function isBlockedIp(ip) {
  const v4 = unwrapV6(ip);
  if (net.isIP(v4) === 4) return isBlockedV4(v4);
  // Any other IPv6 (loopback ::1, link-local fe80::/10, unique-local fc00::/7,
  // unspecified ::) is denied: server-side fetches have no IPv6 need today.
  if (net.isIP(ip) === 6) return true;
  return true; // not an IP at all → treat as blocked (fail closed)
}

async function resolveAndCheck(hostname, { allowPrivate = false } = {}) {
  if (allowPrivate) return;
  let records;
  try {
    records = await dns.lookup(hostname, { all: true });
  } catch {
    throw new OutboundError('DNS_FAIL', `Outbound refused: host does not resolve (${hostname}).`);
  }
  if (!records || records.length === 0) {
    throw new OutboundError('DNS_FAIL', `Outbound refused: host does not resolve (${hostname}).`);
  }
  for (const r of records) {
    if (isBlockedIp(r.address)) {
      throw new OutboundError('DENIED_HOST', `Outbound refused: target is not a public address (${hostname}).`);
    }
  }
}

function doRequest(url, { timeoutMs, maxBytes, headers }) {
  return new Promise((resolve, reject) => {
    const lib = url.protocol === 'https:' ? https : http;
    const req = lib.get(url, { timeout: timeoutMs, headers }, (res) => {
      const chunks = [];
      let size = 0;
      let done = false;
      const fail = (err) => {
        if (done) return;
        done = true;
        res.destroy();
        reject(err);
      };
      res.on('data', (c) => {
        size += c.length;
        if (size > maxBytes) {
          fail(new OutboundError('TOO_LARGE', 'Outbound refused: response exceeds size budget.'));
          return;
        }
        chunks.push(c);
      });
      res.on('end', () => {
        if (done) return;
        done = true;
        resolve({ status: res.statusCode, headers: res.headers, body: Buffer.concat(chunks).toString('utf8') });
      });
      res.on('error', fail);
    });
    req.on('timeout', () => {
      req.destroy(new OutboundError('TIMEOUT', 'Outbound refused: request timed out.'));
    });
    req.on('error', (e) => {
      reject(e instanceof OutboundError ? e : new OutboundError('HTTP_FAIL', `Outbound failed: ${e.message || 'request error'}`));
    });
  });
}

/**
 * Fetch a URL under the S13 policy. Never throws raw internals beyond the
 * coded OutboundError (messages name the policy, not the target's secrets —
 * note: hostname IS echoed for operator debuggability; values never are).
 */
async function fetchText(rawUrl, {
  timeoutMs = 10000,
  maxBytes = 256 * 1024,
  maxRedirects = 0,
  allowPrivate = false,
  headers = {},
} = {}) {
  let url;
  try {
    url = new URL(String(rawUrl));
  } catch {
    throw new OutboundError('BAD_URL', 'Outbound refused: invalid URL.');
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new OutboundError('BAD_PROTOCOL', 'Outbound refused: only http(s) allowed.');
  }
  if (url.username || url.password) {
    throw new OutboundError('BAD_URL', 'Outbound refused: credentials in URL.');
  }
  await resolveAndCheck(url.hostname, { allowPrivate });

  const requestHeaders = { 'User-Agent': 'TufTracker/2 (+server)', ...headers };
  let hops = 0;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const res = await doRequest(url, { timeoutMs, maxBytes, headers: requestHeaders });
    if (res.status >= 300 && res.status < 400 && res.headers.location && hops < maxRedirects) {
      hops += 1;
      const next = new URL(res.headers.location, url);
      if (next.protocol !== 'http:' && next.protocol !== 'https:') {
        throw new OutboundError('BAD_PROTOCOL', 'Outbound refused: redirect leaves http(s).');
      }
      await resolveAndCheck(next.hostname, { allowPrivate });
      url = next;
      continue;
    }
    if (res.status >= 300 && res.status < 400 && res.headers.location) {
      throw new OutboundError('TOO_MANY_REDIRECTS', 'Outbound refused: redirects not followed.');
    }
    return res;
  }
}

module.exports = { fetchText, OutboundError, isBlockedIp, resolveAndCheck };
