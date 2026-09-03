# S11 — Error / Information Disclosure (COMPLETE 2026-09-03)

## What changed

- **`middleware/errors.js` (new):** `requestId` (UUID per request, `X-Request-Id`
  response header, exposed via CORS), `scrub()` (secret-shaped material →
  `[REDACTED]`, deep + circular-safe, secret-named keys redacted), `publicError`
  (safe message + id), `notFound` (safe 404 + id), `errorMiddleware` (final
  4-arity handler: malformed JSON → clean 400; everything else → generic 500 +
  id; full errors go to scrubbed logs with id/method/URL only).
- **`server.js`:** requestId first (logger carries the id), safe 404s for
  `/api/*` and everything else, raw `err.message` handler deleted.
- **Leak sites closed:** codeRunner `/status` + `/test` catches, POST `/java`
  catch, 3× company catch, practice-session `details`, service error-stage
  reflection (now generic + scrubbed server log). Compiler stderr stays
  (path-stripped user-code diagnostics — intended UX, not internals).
- **Frozen by design:** S2/S4/S8 4xx bodies keep exact shapes (contract
  stability; asserted by their tests). Validation `details` are paths-only.

## Proofs

- 7 tests: scrub classes, 400/500 mapping, id-correlated scrubbed logs,
  headersSent delegation, static guard (zero `err.message`/`details` in any
  route/server response context).
- Live: `/api/nope` → `{"error":"Not found","requestId":…}`; malformed JSON →
  `{"error":"Invalid JSON body","requestId":…}` (no snippet echo);
  `X-Request-Id` on all responses + exposed.
- Suite 140/140.

## Residual / hand-off

- ~20 route-level `console.error(err-object)` calls remain unstructured (no
  secret content found in the error types they log, but no schema either) —
  S18 replaces them with structured security events.
- Compiler stderr is intentionally verbose; S9 neutralizes it at render.
