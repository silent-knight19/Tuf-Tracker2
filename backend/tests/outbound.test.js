/**
 * S13 — outbound/SSRF tests. No external network: deny-lists are unit-tested,
 * DNS tricks use numeric/local resolution only, and behavior runs against a
 * loopback server with { allowPrivate: true }.
 */

const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');

const { fetchText, OutboundError, isBlockedIp } = require('../services/outbound');

describe('S13 deny ranges (no network)', () => {
  it('blocks loopback, private, link-local, metadata, special ranges', () => {
    const blocked = [
      '127.0.0.1', '127.1.2.3', '10.0.0.1', '10.255.255.255',
      '172.16.0.1', '172.31.255.255', '192.168.1.1', '169.254.169.254',
      '169.254.0.1', '0.0.0.0', '100.64.0.1', '192.0.2.1', '198.51.100.7',
      '203.0.113.9', '224.0.0.1', '240.0.0.1', '::1', '::', 'fe80::1',
      'fc00::1', '::ffff:127.0.0.1', '::ffff:10.1.2.3',
    ];
    for (const ip of blocked) assert.equal(isBlockedIp(ip), true, ip);
  });

  it('allows ordinary public IPv4', () => {
    for (const ip of ['8.8.8.8', '1.1.1.1', '93.184.216.34', '142.250.72.14']) {
      assert.equal(isBlockedIp(ip), false, ip);
    }
    assert.equal(isBlockedIp('not-an-ip'), true);
  });

  it('refuses non-http(s) protocols and credentialed URLs without network', async () => {
    for (const u of ['ftp://example.com/x', 'file:///etc/passwd', 'gopher://x/', 'dict://x/']) {
      await assert.rejects(fetchText(u, { allowPrivate: true }), /only http\(s\)/);
    }
    await assert.rejects(
      fetchText('http://user:pass@example.com/', { allowPrivate: true }), /credentials/
    );
  });

  it('neutralizes IP-literal obfuscation via resolved addresses', async () => {
    // Decimal / hex IPv4 literals resolve to loopback without external DNS.
    await assert.rejects(fetchText('http://2130706433/', { allowPrivate: false }), /(not a public|does not resolve)/);
    await assert.rejects(fetchText('http://localhost:9/', { allowPrivate: false }), /not a public/);
  });
});

describe('S13 bounded fetch (loopback server, allowPrivate)', () => {
  let base;
  let server;
  before(async () => {
    server = http.createServer((req, res) => {
      if (req.url === '/ok') return res.end('hello lounsbury');
      if (req.url === '/big') return res.end('x'.repeat(4096));
      if (req.url === '/slow') return setTimeout(() => res.end('late'), 300);
      if (req.url === '/redir') {
        res.writeHead(302, { location: '/ok' });
        return res.end();
      }
      if (req.url === '/redir-evil') {
        res.writeHead(302, { location: 'ftp://example.com/x' });
        return res.end();
      }
      res.writeHead(404).end();
    });
    await new Promise((r) => server.listen(0, '127.0.0.1', r));
    base = `http://127.0.0.1:${server.address().port}`;
  });
  after(() => new Promise((r) => server.close(r)));

  it('fetches public-shaped loopback content when explicitly allowed', async () => {
    const r = await fetchText(`${base}/ok`, { allowPrivate: true });
    assert.equal(r.status, 200);
    assert.ok(r.body.includes('hello'));
  });

  it('denies the same server by default (private)', async () => {
    await assert.rejects(fetchText(`${base}/ok`), /not a public/);
  });

  it('enforces body caps and timeouts', async () => {
    await assert.rejects(
      fetchText(`${base}/big`, { allowPrivate: true, maxBytes: 100 }), /exceeds size/
    );
    await assert.rejects(
      fetchText(`${base}/slow`, { allowPrivate: true, timeoutMs: 60 }), /timed out/
    );
  });

  it('never follows redirects by default; re-validates hopped schemes', async () => {
    await assert.rejects(
      fetchText(`${base}/redir`, { allowPrivate: true }), /redirects not followed/
    );
    const followed = await fetchText(`${base}/redir`, { allowPrivate: true, maxRedirects: 1 });
    assert.equal(followed.status, 200);
    await assert.rejects(
      fetchText(`${base}/redir-evil`, { allowPrivate: true, maxRedirects: 1 }), /leaves http/
    );
  });
});

describe('S13 single chokepoint (static)', () => {
  it('no raw HTTP clients outside services/outbound.js; cron uses the helper', () => {
    const offenders = [];
    const walk = (dir) => {
      for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, f.name);
        if (f.isDirectory()) {
          if (!['node_modules', 'tests'].includes(f.name)) walk(p);
        } else if (/\.js$/.test(f.name) && p !== path.join(__dirname, '..', 'services', 'outbound.js')) {
          const src = fs.readFileSync(p, 'utf8');
          if (/require\(['"]https?['"]\)/.test(src)) offenders.push(p);
          if (/(^|[^.\w])fetch\s*\(/.test(src) && !/node-fetch/.test(src)) offenders.push(`${p} (global fetch)`);
        }
      }
    };
    walk(path.join(__dirname, '..'));
    assert.deepEqual(offenders, []);
    const cron = fs.readFileSync(path.join(__dirname, '..', 'cron', 'cron.service.js'), 'utf8');
    assert.ok(cron.includes('services/outbound'));
    assert.ok(!cron.includes('client.get'));
  });
});
