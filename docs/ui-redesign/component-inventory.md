# UI Redesign: Component Inventory & Architecture

This document catalogs every reusable UI primitive and feature component in TufTracker 2.

## 1. UI Primitives (`src/components/ui/`)

| Primitive | Props & API | Variants & States |
| :--- | :--- | :--- |
| **`Button`** | `variant`, `size`, `isLoading`, `icon`, `disabled`, `onClick` | `primary`, `secondary`, `ghost`, `outline`, `danger`, `subtle`. Sizes: `sm`, `md`, `lg`. Active press scale. |
| **`Input`** | `value`, `onChange`, `placeholder`, `icon`, `shortcut`, `error`, `onClear` | Left search icon, right keyboard badge (`⌘K`), active focus ring, clear button. |
| **`Badge`** | `variant`, `size`, `dot`, `children` | `easy`, `medium`, `hard`, `platform`, `company`, `status`, `accent`. Micro 11px font. |
| **`Card`** | `children`, `className`, `interactive`, `onClick` | Obsidian dark surface, 1px border, inner rim highlight. Hover lift on interactive. |
| **`Tabs`** | `tabs` (`id`, `label`, `count`, `icon`), `activeTab`, `onChange` | Segmented sliding pill tabs with Framer Motion `layoutId="activeTabPill"`. |
| **`Dialog`** | `isOpen`, `onClose`, `title`, `description`, `children`, `footer` | Focus trap, ESC listener, backdrop blur (`bg-black/70`), scale+fade animation. |
| **`Drawer`** | `isOpen`, `onClose`, `title`, `children`, `width` | Right-side slide-over panel with smooth spring physics. |
| **`Tooltip`** | `content`, `children`, `side` | 11px micro popover with 200ms delay. |
| **`Select`** | `options`, `value`, `onChange`, `placeholder` | Custom accessible select with search filter. |
| **`Table`** | `columns`, `data`, `onRowClick`, `sortColumn`, `sortDirection` | Sticky header, compact 44px rows, hover highlight, keyboard focus. |
| **`CommandPalette`** | `isOpen`, `onClose` | Raycast-style instant search across problems, sheets, companies, actions. |
| **`Skeleton`** | `variant` (`text`, `card`, `row`, `editor`), `count` | Shimmer-free subtle pulse matching final content geometry. |
| **`Toast`** | `message`, `type` (`info`, `success`, `warning`, `error`), `onClose`, `action` | Floating notification with progress bar and retry action. |
| **`SafeMarkdown`** | `content`, `className` | XSS-hardened markdown with syntax highlighting (retained). |

## 2. Layout Components (`src/components/layout/`)

- **`AppShell`**: Master authenticated wrapper providing responsive container, sidebar state, topbar, and command palette.
- **`Sidebar`**: Collapsible slim sidebar (`64px` icon-only $\leftrightarrow$ `240px` expanded) with group sections, active indicator, and profile footer.
- **`Topbar`**: Header with breadcrumbs, command bar trigger, streak counter, solved count, and user actions.
- **`PageHeader`**: Standardized page title, description, and action button toolbar.

## 3. Flagship Workspace Components (`src/components/workspace/`)

- **`WorkspaceLayout`**: Unified split-pane container replacing duplicate code in `SolveUserProblemPage`, `AIInterviewPage`, and `ProblemViewPage`.
- **`MonacoWorkspace`**: Monaco editor wrapper with language selector, format code, reset, and run CTA.
- **`RunnerConsole`**: Execution terminal displaying stdout, stderr, run time, memory, and status badges (Passed, Failed, Timeout, Compilation Error).
- **`AICopilotPanel`**: Progressive hint reveal, approach complexity analysis (Time & Space), and edge case runner.
