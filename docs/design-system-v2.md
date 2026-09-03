# TufTracker 2 — Design System v2 Specification

> **Version**: 2.0.0  
> **Status**: Approved & Active  
> **Design Philosophy**: High-Density, Calm, Obsidian Dark-Mode-First Engineering Workspace.  
> **Core Aesthetic Benchmarks**: Linear, Vercel (Geist), Raycast, Stripe.

---

## 1. Design Philosophy & Visual Principles

1. **Restraint Over Spectacle**: Premium does not mean more animations, glowing blobs, or rainbow gradients. Premium means razor-sharp typography, deliberate spacing, physical micro-interactions, high information density, and semantic color usage.
2. **Native Dark-Mode-First Architecture**: Dark mode is not an inversion of light mode. It is a layered obsidian environment where depth is established via subtle luminance separation (2–4% steps) and 1px semi-transparent borders rather than heavy drop shadows.
3. **Speed & Keyboard-First Ergonomics**: Every primary user action should be accessible via `⌘K` command palette or direct keyboard shortcuts (`Esc`, `↵`, `↑/↓`, `⌘↵`). The UI must respond instantly.
4. **Context-Aware AI Integration**: AI is a quiet, highly disciplined copilot built directly into the problem-solving workspace (progressive hints, approach complexity analysis, edge cases), not an oversized purple promotional banner.
5. **Accessibility as an Invariant**: Every component supports visible focus rings, ARIA roles, minimum 4.5:1 contrast ratios for text, and strict adherence to `prefers-reduced-motion`.

---

## 2. Color System & Semantic Tokens

### Core Neutral Obsidian Hierarchy

```css
:root {
  /* Canvas Backgrounds */
  --background: #08090d;          /* Main canvas */
  --background-subtle: #0b0d13;   /* Secondary background */

  /* Layered Surfaces */
  --surface: #0e111a;             /* Sidebars, topbars, panels */
  --surface-raised: #141824;      /* Cards, tables, secondary containers */
  --surface-elevated: #1b2030;    /* Dialogs, popovers, command palette */
  --surface-hover: #222940;       /* Interactive hover state */
  --surface-active: #28314c;      /* Pressed / selected state */

  /* Text & Foreground */
  --foreground: #f8fafc;          /* High-contrast headings and primary values */
  --foreground-muted: #94a3b8;    /* Body text, descriptions */
  --foreground-subtle: #64748b;   /* Captions, metadata, keyboard shortcuts */

  /* Borders & Dividers */
  --border-subtle: rgba(255, 255, 255, 0.06); /* Quiet table dividers */
  --border: rgba(255, 255, 255, 0.10);        /* Standard card/input borders */
  --border-strong: rgba(255, 255, 255, 0.20); /* Hover/focus border */
  --border-focus: #6366f1;                    /* Brand focus ring */

  /* Primary Brand Accent (Electric Indigo) */
  --primary: #6366f1;
  --primary-hover: #818cf8;
  --primary-active: #4f46e5;
  --primary-subtle: rgba(99, 102, 241, 0.12);
  --primary-border: rgba(99, 102, 241, 0.28);

  /* Gamification & Streaks (Warm Amber) */
  --accent-amber: #f59e0b;
  --accent-amber-subtle: rgba(245, 158, 11, 0.12);
  --accent-amber-border: rgba(245, 158, 11, 0.28);

  /* Semantic Status */
  --difficulty-easy: #10b981;
  --difficulty-easy-subtle: rgba(16, 185, 129, 0.12);
  --difficulty-easy-border: rgba(16, 185, 129, 0.25);

  --difficulty-medium: #f59e0b;
  --difficulty-medium-subtle: rgba(245, 158, 11, 0.12);
  --difficulty-medium-border: rgba(245, 158, 11, 0.25);

  --difficulty-hard: #f43f5e;
  --difficulty-hard-subtle: rgba(244, 63, 94, 0.12);
  --difficulty-hard-border: rgba(244, 63, 94, 0.25);

  --success: #10b981;
  --warning: #f59e0b;
  --danger: #f43f5e;
  --info: #38bdf8;
}
```

---

## 3. Typography System

### Typefaces
- **Primary UI Sans**: `Plus Jakarta Sans`, `-apple-system`, `BlinkMacSystemFont`, `Inter`, `sans-serif`.
- **Code & Numerical Mono**: `JetBrains Mono`, `monospace`. (Always use `font-mono tabular-nums` for timers, counts, and metrics).

### Scale & Hierarchy

| Token | Size | Line Height | Weight | Letter Spacing | Purpose |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `font-display` | `32px` | `40px` | 800 (Bold) | `-0.03em` | Primary KPI metrics, hero numbers |
| `font-h1` | `24px` | `32px` | 700 (Bold) | `-0.025em` | Page titles (Dashboard, Problems) |
| `font-h2` | `18px` | `24px` | 600 (Semibold) | `-0.02em` | Section headers, modal titles |
| `font-h3` | `14px` | `20px` | 600 (Semibold) | `-0.01em` | Card titles, group headings |
| `font-body` | `14px` | `22px` | 400 (Regular) | `0` | Problem statements, notes |
| `font-body-sm` | `13px` | `18px` | 400 (Regular) | `0` | Dense table cells, secondary notes |
| `font-caption` | `12px` | `16px` | 500 (Medium) | `0` | Metadata, table headers, breadcrumbs |
| `font-micro` | `11px` | `14px` | 600 (Semibold) | `0.02em` | Badges, tags, shortcut keys (`kbd`) |
| `font-code` | `13px` | `20px` | 400 / 500 | `0` | Monaco code editor, test stdin/stdout |

---

## 4. Spacing Scale & Grid

- **Base Unit**: `4px` grid.
- **Scale**:
  - `space-1`: `4px` (`0.25rem`) — Micro gap between tag dot and text
  - `space-2`: `8px` (`0.5rem`) — Standard button padding-y, icon spacing
  - `space-3`: `12px` (`0.75rem`) — Dense card padding, toolbar gap
  - `space-4`: `16px` (`1rem`) — Standard card padding, input padding-x
  - `space-5`: `20px` (`1.25rem`) — Large card padding
  - `space-6`: `24px` (`1.5rem`) — Section vertical spacing
  - `space-8`: `32px` (`2rem`) — Container padding, major section gaps
  - `space-12`: `48px` (`3rem`) — Page header to content gap
- **Layout Grid**: 12-column responsive layout system (`grid-cols-1 md:grid-cols-2 lg:grid-cols-12`).

---

## 5. Border Radius & Elevation Hierarchy

### Radius Hierarchy
- **Control Radius** (`8px` / `rounded-lg`): Buttons, inputs, search bars, badges, keyboard keys (`kbd`).
- **Surface Radius** (`12px` / `rounded-xl`): Problem cards, analytics panels, data tables, split panes.
- **Overlay Radius** (`16px` / `rounded-2xl`): Modals, drawers, command palette.
- **Semantic Pills** (`9999px` / `rounded-full`): Difficulty badges, status dots, avatar status rings.

### Elevation (No Heavy Drop Shadows)
- Rely on **1px semi-transparent borders** (`rgba(255, 255, 255, 0.08)`) and **inner rim lighting**:
  ```css
  box-shadow: inset 0 1px 0 0 rgba(255, 255, 255, 0.06);
  ```
- Floating modals use subtle dark backdrops: `rgba(0, 0, 0, 0.7)` with `backdrop-blur-md`.

---

## 6. Motion System

- **Curves**:
  - Snappy Spring: `cubic-bezier(0.16, 1, 0.3, 1)`
  - Standard Ease: `cubic-bezier(0.25, 1, 0.5, 1)`
- **Durations**:
  - `instant`: `100ms` (active button press, checkbox check)
  - `fast`: `150ms` (hover background shift, border transition)
  - `normal`: `200ms` (dropdown popover, tooltip, command menu)
  - `modal`: `240ms` (modal zoom-in & backdrop fade)
  - `page`: `250ms` (page layout opacity and subtle slide)
- **Reduced Motion**:
  ```css
  @media (prefers-reduced-motion: reduce) {
    * {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
  ```

---

## 7. Component Library Primitives

| Component | Responsibility & Interaction States |
| :--- | :--- |
| **`Button`** | Primary, Secondary, Ghost, Outline, Danger, Subtle. States: Default, Hover, Active, Disabled, Loading (spinner replaces icon). |
| **`Input`** | Integrated search, clear button (`X`), shortcut badge (`⌘K`). States: Default, Hover, Focus (indigo ring), Error (rose border). |
| **`Badge`** | Semantic variants: `easy`, `medium`, `hard`, `platform`, `company`, `status`. Consistent 11px font with glowing status dot. |
| **`Card`** | Standardized obsidian container with subtle border and inner top rim. Optional `interactive` prop for hover lift. |
| **`Tabs`** | Segmented sliding pill tabs with Framer Motion `layoutId="activeTab"` for fluid active transitions. |
| **`Dialog`** | Accessible modal container with focus trap, ESC key dismissal, smooth zoom-in entrance, and backdrop blur. |
| **`Drawer`** | Slide-over panel (right side) for detailed problem inspection without navigating away. |
| **`Table`** | Dense data table with sticky header, compact rows, keyboard row focus, sorting indicators, and hover actions. |
| **`CommandPalette`**| Global `⌘K` overlay with instant fuzzy search across Problems, Curated Sheets, Revision, Companies, and Actions. |
| **`Skeleton`** | Geometric placeholder matching table rows, cards, and code editor dimensions. |
| **`Toast`** | Notification system handling backend rate limits (429), review confirmations, and copy actions with auto-dismiss and action buttons. |

---

## 8. Flagship Coding Workspace Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│ Problem Title & Tags ── Difficulty ── Status ── [Run Code ⌘↵] [Submit] │
├───────────────────────────────────┬────────────────────────────────────┤
│ Problem Statement Pane (50%)      │ Monaco Editor Pane (50%)           │
│ ┌───────────────────────────────┐ │ ┌────────────────────────────────┐ │
│ │ Description (SafeMarkdown)    │ │ │ Monaco Editor (Java / C++ / Py)│ │
│ │ Examples (Input / Output)     │ │ │ Format Code / Reset            │ │
│ │ Constraints                   │ │ ├────────────────────────────────┤ │
│ ├───────────────────────────────┤ │ │ Execution Console & Test Cases │ │
│ │ AI Copilot Panel (Collapsible)│ │ │ [Console] [Test Cases] [Edge]  │ │
│ │ • Step 1: Intuition           │ │ │ Stdout / Stderr / Run Metrics  │ │
│ │ • Step 2: Algorithmic Approach│ │ └────────────────────────────────┘ │
│ │ • Step 3: Optimal Solution    │ │                                    │
│ └───────────────────────────────┘ └────────────────────────────────────┘
└────────────────────────────────────────────────────────────────────────┘
```

---

## 9. Accessibility (a11y) Standards

- **Focus Ring**: Uniform 2px offset ring in `--primary` (`rgba(99, 102, 241, 0.6)`).
- **Keyboard Navigation**:
  - `⌘K` / `Ctrl+K`: Global command palette.
  - `⌘B` / `[`: Toggle sidebar collapse.
  - `⌘↵` / `Ctrl+Enter`: Run code in workspace.
  - `Esc`: Close open modal, drawer, or search palette.
  - `↑` / `↓` / `Enter`: Command palette and table navigation.
- **Screen Readers**: Appropriate `aria-label`, `role="dialog"`, `role="tablist"`, `aria-selected`, and `aria-expanded` attributes across all interactive primitives.
