# UI Redesign: Visual QA Checklist & Acceptance Criteria

This checklist defines the strict acceptance criteria for every screen before it can be considered complete.

## 1. Global Visual QA Criteria

- [ ] **Contrast**: Text contrast strictly passes WCAG AA (minimum 4.5:1 for body text, 3:1 for large text and icons).
- [ ] **Typography**: Uses Plus Jakarta Sans for UI text and JetBrains Mono for code/numbers. No browser-default sans-serif.
- [ ] **Spacing**: All margins and paddings conform to the 4px/8px scale. No ad-hoc `13px`, `27px`, etc.
- [ ] **No "AI Slop"**: No unneeded multi-color gradients, neon glows, bouncing animations, or floating particles.
- [ ] **Surface Depth**: Depth is communicated via subtle background luminance (2–4% differences) and 1px borders, not giant drop shadows.
- [ ] **Border Radii**: Consistent hierarchy: 8px (controls), 12px (cards/panels), 16px (dialogs), 9999px (pills only).
- [ ] **Interactive States**: Every clickable element has deliberate default, hover, active/pressed, focus, and disabled states.
- [ ] **Loading States**: Skeletons match the exact geometry of final cards/tables. No generic spinners flashing blank content.
- [ ] **Empty States**: Every list or table has an informative empty state explaining what happened and providing a clear next action.
- [ ] **Error States**: Errors provide clear guidance and a retry action. Technical stack traces are never exposed to the user.
- [ ] **Responsive Integrity**: Tested and visually clean on Desktop (1440px), Laptop (1024px), Tablet (768px), and Mobile (375px).
- [ ] **Keyboard Navigation**: Full keyboard navigation supported (`Tab`, `Shift+Tab`, `Enter`, `Esc`, `⌘K`).
- [ ] **Reduced Motion**: All animations immediately settle when `prefers-reduced-motion` is active.

## 2. Phase-by-Phase Verification Matrix
 
| Phase | Target Scope | Key Verification Check | Status |
| :--- | :--- | :--- | :--- |
| **UI-0** | Research & Audit | Complete codebase map, store inventory, API contracts | **PASSED** (2026-09-03) |
| **UI-1** | Tokens & Primitives | CSS tokens compile, primitives render with all variants, tests green | **PASSED** (2026-09-03) |
| **UI-2** | AppShell & Command Palette | `⌘K` opens search instantly, sidebar collapses cleanly, breadcrumbs work | **PASSED** (2026-09-03) |
| **UI-3** | Mission Control Dashboard | Root `/` displays personalized targets, streak pulse, and quick actions | **PASSED** (2026-09-03) |
| **UI-4** | Problem Bank & Table | High density, multi-faceted filtering, fast search, hover preview drawer | **PASSED** (2026-09-03) |
| **UI-5** | Flagship Code Workspace | Split panes resize smoothly, Monaco editor runs code, console displays output | **PASSED** (2026-09-03) |
| **UI-6** | AI Copilot Experience | Progressive hints reveal, solution approaches compare, no polling loops | **PASSED** (2026-09-03) |
| **UI-7** | Spaced Revision Experience | Focused review workflow (Recall $\to$ Reveal $\to$ Self-Rate), SM-2 intervals | **PASSED** (2026-09-03) |
| **UI-8** | Analytics Page | Cohesive Recharts styling, velocity heatmap, mastery radar | **PASSED** (2026-09-03) |
| **UI-9** | Companies Hub | Company cards, readiness scores, single-click navigation | **PASSED** (2026-09-03) |
| **UI-10** | Learn & Curated Sheets | Roadmap sheets, editorial learning content, token alignment | **PASSED** (2026-09-03) |
| **UI-11** | Auth & Settings | Minimalist login, appearance preferences, shortcuts cheatsheet | **PASSED** (2026-09-03) |
| **UI-12** | Responsive & Accessibility | Mobile navigation, ARIA audit, reduced-motion pass | **PASSED** (2026-09-03) |
| **UI-13** | Performance & Polish | Build optimization, chunk verification, zero console warnings | **PASSED** (2026-09-03) |
