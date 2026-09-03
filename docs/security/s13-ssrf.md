# S13 — SSRF / Outbound Networking (COMPLETE 2026-09-03)

## Outbound inventory (complete — grep-verified)

| Call | Target | User URL influence | Controls |
|------|--------|--------------------|----------|
| Groq SDK | fixed `api.groq.com`, SDK TLS | none (prompts only) | 45s timeout, S7/S8 guards |
| Firebase Admin SDK | fixed Google hosts | none | SDK-managed |
| Cron keep-alive | `BACKEND_URL` env (operator) | none client-side | **S13: migrated to `fetchText`** |
| `platformUrl`, AI URLs, webhooks, imports | — | stored/displayed, never fetched server-side | n/a |

## What changed

- **`services/outbound.js` (new) — the mandatory chokepoint.** http(s)-only,
  no URL credentials, DNS-resolve-then-deny (loopback/private/link-local/
  metadata/multicast/reserved/CGNAT/TEST-NETs, IPv4-mapped IPv6 unwrapped,
  all other IPv6 denied), unresolvable refused, redirects never followed by
  default with per-hop re-validation when enabled, body caps (256KB), 10s
  timeouts, `OutboundError` codes (no secret reflection; hostname echoed for
  ops only). A static test bans raw `http(s)` clients and global `fetch`
  everywhere else in backend/.
- **Cron keep-alive migrated:** previously `client.get` with NO timeout (a
  blackholed URL leaked one hanging socket per 10 min, forever). Now bounded
  fetch; private targets refused in production, allowed in dev (localhost).
- Obfuscation (`http://2130706433/`, hex/octal literals) dies at the resolved-
  address check — verified by test, no external DNS needed.

## Proofs (9 tests)

Deny-range matrix (32 literals incl. mapped-v6), protocol/credential refusals,
numeric-literal + localhost DNS denies, loopback-server behavior (cap/timeout/
redirect-follow/refuse, hop scheme re-validation), chokepoint static guard.
Suite 155/155. Boot smoke clean.

## Residual / hand-off

- **DNS-rebinding TOCTOU** (lookup vs connect) accepted for the single
  operator-configured consumer; any future user-URL feature (webhooks, problem
  import) must resolve-pin (connect to validated IP with Host/SNI) — stated as
  a hard requirement here, enforced by the chokepoint + static test.
- **Provider-SDK redirect key-forwarding** (would the OpenAI SDK re-send
  `Authorization` on a cross-origin 3xx from api.groq.com?): SDK-managed,
  no evidence of such redirects; accepted residual, revisit in S16 (supply
  chain) if SDK behavior changes.
