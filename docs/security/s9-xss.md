# S9 — XSS / Markdown / User Content (COMPLETE 2026-09-03)

## What changed (frontend only, one focused dep)

- **New dep: `rehype-sanitize`** (the standard react-markdown sanitizer; not a
  grab-bag — single purpose, established). Tightened schema: href protocols
  http/https only (drops `irc/xmpp/mailto` the default allows), `input` tag
  removed, script/iframe/svg/object/embed never in tag set, event handlers and
  `style`/extra attrs stripped by allowlist.
- **`SafeMarkdown` (`components/ui/SafeMarkdown.jsx`) — the only sanctioned
  renderer.** All 7 former raw-`ReactMarkdown` sites + the `aiSections.raw`
  `dangerouslySetInnerHTML` branch now render through it. `a`/`img` components
  are forced AFTER caller overrides (a caller cannot re-enable hijack links);
  non-string children render empty; GFM preserved via prop passthrough.
- **Dynamic href gates:** user/AI-controlled URLs (`platformUrl` ×3,
  `problemLink` ×2) render as links only when `isSafeHttpUrl()` passes —
  otherwise no anchor at all. Static bundled links untouched. AI
  `relatedProblems[].url` was already ignored (titles render as text) ✓.
- **Favicon URL:** company-derived domain part `encodeURIComponent`d (×2) so a
  hostile company name cannot break out of the query param.
- Safe by default elsewhere: error/API strings render as React text (escaped);
  Monaco/Recharts render text, not HTML (audited, unchanged).

## Proofs (31 vitest tests, `renderToString`, no DOM needed)

- `isSafeHttpUrl` matrix (14): http(s) pass; `javascript:`/`data:`/`vbscript:`/
  protocol-relative/relative/empty/non-string blocked (incl. mixed case).
- XSS corpus (11 shapes): script/svg/img-onerror/iframe/handlers/style/form —
  all inert; link text preserved (`[click](javascript:…)` → inert `<span>click</span>`).
- Legit Markdown survives: bold/code/tables/lists, http(s) links (forced
  `target=_blank` + `rel=noopener noreferrer`), http(s) images; data-URI images vanish.
- Override-lock: caller-supplied `a` component cannot reinstate evil hrefs.
- `vite build` clean; backend suite 127/127 unaffected.

## Deliberately added (not "blind")

- `rehype-sanitize`: single-purpose, pinned in lockfile, exercised by 31 tests.
- `vitest` (dev only): frontend had zero test infrastructure; server-render
  tests need no browser/jsdom — one devDep total.

## Residual / hand-off

- No CSP headers yet (frontend served by Vercel static; backend Helmet doesn't
  cover it) → S10 must add `Content-Security-Policy` + `frame-ancestors` as the
  backstop. Sanitizer is the primary control, CSP the seatbelt.
- Stored hostile strings remain in Firestore (bounded by S4, delimited for AI
  by S7) — now inert at every render sink.
