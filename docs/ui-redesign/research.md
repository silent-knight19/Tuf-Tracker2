# UI-0: Research & Audit — TufTracker 2 Redesign

> **Document Status**: Complete (UI-0 Gate)  
> **Target Audience**: Product Design, Frontend Engineering, System Architecture  
> **Objective**: Transform TufTracker 2 from an ad-hoc dashboard into a cohesive, premium, high-density developer productivity and learning environment comparable to Linear, Vercel, Raycast, and Stripe.

---

## A. Current UI Audit

### 1. Complete Route & Page Inventory

| Route | Component | Purpose & Render Context |
| :--- | :--- | :--- |
| `/login` | `LoginPage.jsx` | Google OAuth authentication page with ambient lights and card container. |
| `/` | `DashboardPage.jsx` $\to$ `ProblemsPage.jsx` | **Architectural Gap**: Root `/` does *not* render a dedicated dashboard; it delegates directly to `ProblemsPage`. |
| `/problems` | `ProblemsPage.jsx` | Custom problem bank with search, platform/difficulty filters, stats grid, and pattern accordion. |
| `/sheets` | `SheetsPage.jsx` | Hub for curated roadmap sheets (Strivers A2Z, NeetCode 150, DSA Patterns). |
| `/sheets/strivers` | `StriversA2ZPage.jsx` | 455-question TakeUForward A2Z course sheet with localStorage progress tracking. |
| `/sheets/neetcode` | `Neetcode150Page.jsx` | 150-question NeetCode roadmap with category filters and status tracking. |
| `/sheets/dsa-patterns` | `DsaPatternsPage.jsx` | Pattern-oriented problem sheet grouped by algorithmic paradigm. |
| `/analytics` | `AnalyticsPage.jsx` | Solve velocity heatmap, radar chart for topics/patterns, platform distribution pie chart, and KPI cards. |
| `/revision` | `RevisionDashboardPage.jsx` | Spaced repetition queue (Overdue, Due Today, Upcoming) powered by backend SM-2 algorithm. |
| `/revision/:id` | `RevisionProblemDetailPage.jsx` | Problem review overview with recall prompts, self-ratings, algorithm notes, and time loggers. |
| `/revision/:id/review` | `RevisionProblemDetailPage.jsx` | Auto-opens review flow (`QuickReviewModal` or `GuidedReviewModal`). |
| `/problem/:id` | `ProblemViewPage.jsx` | 966-line study view with resizable panels, solutions tab, AI notes tab, and user notes editor. |
| `/solve/:id` | `SolveUserProblemPage.jsx` | 787-line full practice workspace for user problems with AI hints, Monaco code runner, test cases, and edge cases. |
| `/interview/ai` | `AIInterviewPage.jsx` | 851-line AI-driven mock interview session with simulated live problem generation and execution. |
| `/interview/:id` | `InterviewProblemPage.jsx` | Structured mock interview view for an existing problem. |
| `/companies/:companyName` | `ProblemsPage.jsx` | Problem bank filtered by company tag. |
| `/company-prep/:companyName` | `CompanyQuestionsPage.jsx` | Dedicated company interview frequency sheet. |
| `/learn` | `LearnPage.jsx` | 977-line AI learning platform for DSA topics and patterns with dynamic curriculum generation. |
| `/practice/patterns` | `PatternPracticePage.jsx` | Targeted practice filtered by algorithmic paradigms. |
| `/practice/companies` | `CompanyPracticePage.jsx` | Company-focused training lab. |
| `/practice/interview` | `InterviewPracticePage.jsx` | AI interactive debrief training lab. |
| `/practice/solve` | `SolveProblemsPage.jsx` | Custom practice question collection. |

---

### 2. Component Inventory & Structure

```
src/
├── components/
│   ├── layout/
│   │   ├── Sidebar.jsx              # Collapsible navigation drawer with brand header & user footer
│   │   └── BackendHealthCheck.jsx   # Top-level backend connection & health banner
│   ├── ui/
│   │   ├── SafeMarkdown.jsx         # Hardened Markdown renderer with Rehype sanitize (31 tests green)
│   │   ├── SafeMarkdown.test.jsx    # Security test suite for XSS prevention
│   │   ├── MotivationalQuote.jsx    # Rotating quotes card/banner with crossfade
│   │   ├── RateLimitToast.jsx       # Floating notification for backend rate-limit headers (429 warning)
│   │   ├── SearchableSelect.jsx     # Combobox dropdown for topics & patterns
│   │   └── CodeHighlighter.jsx      # Syntax highlighting wrapper
│   └── features/
│       ├── ActivityHeatmap.jsx      # GitHub-style solve velocity contribution graph
│       ├── AddProblemModal.jsx      # Manual & AI problem ingestion modal
│       ├── CircularProgress.jsx     # SVG radial percentage gauge
│       ├── ProblemCard.jsx          # Problem bank grid card with tags and difficulty badge
│       ├── ProblemDetailsModal.jsx  # Contextual problem preview modal
│       ├── SolvedProblemsStats.jsx  # Bento-style KPI grid with difficulty progress bars
│       ├── QuickReviewModal.jsx     # Spaced repetition quick review flow
│       ├── GuidedReviewModal.jsx    # Multi-step AI guided debrief modal
│       ├── RevisionProblemCard.jsx  # Revision queue item card with SM-2 interval badges
│       ├── code/
│       │   ├── CodePanel.jsx        # Monaco wrapper, toolbar, test execution runner, timer, AI analyzer
│       │   ├── CodeEditor.jsx       # Monaco editor instance
│       │   ├── ConsolePanel.jsx     # Stdout/stderr console output display with timing
│       │   ├── InputPanel.jsx       # Custom stdin test input editor
│       │   ├── EdgeCasesPanel.jsx   # AI-generated edge case inputs
│       │   └── Timer.jsx            # Stopwatch practice timer
│       ├── revision/
│       │   ├── DashboardHeader.jsx  # Spaced repetition header banner with user streak
│       │   ├── GuidedDebriefModal.jsx # Comprehensive interview review debrief
│       │   ├── PatternProgressList.jsx # Pattern mastery checklist
│       │   ├── PracticeModeCard.jsx # Practice mode selection card
│       │   ├── RevisionContent.jsx  # Notes, algorithm steps, and edge case editor
│       │   ├── RevisionHeader.jsx   # Revision problem metadata bar
│       │   ├── RevisionSidebar.jsx  # Retention stats & action trigger sidebar
│       │   └── SolveProblemsSection.jsx # Practice problem selector
│       └── sheets/
│           └── SheetProblemModal.jsx # Curated sheet problem inspection modal
```

---

### 3. Zustand Stores & State Management

1. **`authStore.js`**: Manages Firebase user session, token refresh, `/auth/me` user statistics sync, and sign-in/sign-out actions. Persisted via `zustand/middleware/persist`.
2. **`problemStore.js`**: Manages problem bank collection, multi-select filters (`topics`, `patterns`, `difficulty`, `company`), CRUD operations via API, and AI note/description generation triggers.
3. **`revisionStore.js`**: Manages SM-2 spaced repetition buckets (`dueToday`, `overdue`, `upcoming`), 60-second caching layer, review submissions (`completeReview`), debrief updates, and time tracking.
4. **`analyticsStore.js`**: Fetches `/analytics/dashboard?days=30` unified analytics, topics/patterns distribution, heatmap data, platform breakdown, and timeline history.
5. **`companyStore.js`**: Manages company catalog, readiness scores, and company-specific problem lists.
6. **`rateLimitStore.js`**: Listens to HTTP response headers from backend (`RateLimit-*`), maintaining remaining quota and triggering `RateLimitToast`.
7. **`quoteStore.js`**: Fetches and caches inspirational quotes categorized by mindset (Focus, Vision, Tenacity).
8. **`uiStore.js`**: Holds theme (`dark`), sidebar open/close state, and global modal state.

---

### 4. Critical UI Problems Discovered

1. **Lack of a Dedicated Overview Dashboard**:
   - The root route `/` currently renders `ProblemsPage` directly.
   - There is no personalized mission control / daily cockpit greeting the developer with:
     - Today's prioritized targets (due spaced revisions, current streak, recommended next problem)
     - High-level progress pulse (problems solved this week, memory retention health)
     - Instant quick-action triggers (Start Practice, Review Overdue, Continue Sheet).
2. **Fake Command Palette (`⌘K`)**:
   - The topbar displays a Raycast-styled `⌘K` input, but its click handler is literally:
     ```javascript
     onClick={() => {
       const searchInput = document.getElementById('problem-search-input');
       if (searchInput) searchInput.focus();
     }}
     ```
   - It fails if the user is on `/analytics`, `/revision`, `/sheets`, or `/learn` where `#problem-search-input` doesn't exist. It has no modal overlay, no keyboard arrow navigation, no command dispatching, and no recent history.
3. **Severe Code Duplication Across Workspace Pages**:
   - `ProblemViewPage.jsx` (966 lines), `SolveUserProblemPage.jsx` (787 lines), `AIInterviewPage.jsx` (851 lines), and `InterviewProblemPage.jsx` (500+ lines) duplicate almost identical implementations of:
     - Split-pane mouse dragging and resize math (`isDraggingPanel`, `handlePanelMouseMove`, `handlePanelMouseUp`)
     - AI hint reveals (Hint 1 $\to$ Hint 2 $\to$ Hint 3)
     - Multi-tier solution tabs (Brute Force $\to$ Better $\to$ Optimal)
     - Edge case conversion to JSON stdin format
     - `CodePanel` embedding and execution result formatting.
4. **Design Incoherence & Hardcoded Values**:
   - `LearnPage.jsx` drops into an entirely different aesthetic: hardcoded `#0a0a0a`, `#1a1a1a`, `#262626`, `#ffa116` (LeetCode amber), and `#00b8a3` with raw CSS overrides (`!bg-[#0a0a0a]`).
   - `RevisionDashboardPage.jsx` employs jarring, melodramatic copy: `"Alert: X Overdue"`, `"Decrypt all X overdue records"`, `"Purge All Overdue"`, `"Mastery Maintenance protocol"`. This is antithetical to a calm, precise engineering tool.
   - `CompaniesPage.jsx` implements an undiscoverable interaction: single-click navigates to problems, while double-click opens a readiness modal with a custom `clickTimer` debounce!
5. **Fragile State Passing & Polling Anti-Patterns**:
   - `AIInterviewPage.jsx` sets up a 500ms `setInterval` polling `localStorage.getItem('ai_problem_${localId}')` with a 60-second timeout to wait for background data passing.
   - `ProblemViewPage.jsx` relies on `useRef(new Set())` and URL query params to guard against infinite render loops when fetching missing details.
6. **Incomplete Loading, Error, and Empty States**:
   - Several pages display raw spinners (`animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-orange`) centered on a blank canvas rather than structured skeleton loaders matching the actual UI geometry.
   - API failures often fall back to raw browser `alert()` or unformatted console errors without actionable retry mechanisms.
7. **Inconsistent Navigation Shell**:
   - Some pages (`/problem/:id`, `/interview/ai`, `/solve/:id`) render outside the `DashboardPage` shell, causing the sidebar and top navigation to completely vanish without a clear global escape or navigation pathway.

---

### 5. Current Strengths to Preserve

1. **Rock-Solid Security Baseline**: All 20 security hardening phases (S0–S20) are complete. `SafeMarkdown` passes all 31 XSS/sanitization tests. All backend API contracts, input validators, quotas, rate limits, and Firestore rules are fully established.
2. **Modern Dependency Stack**: React 19.2, Vite 7, Tailwind 3.4, Lucide React, Zustand 5, Framer Motion 12, Recharts 3.5, Monaco Editor. No heavy dead-weight frameworks need to be introduced.
3. **Comprehensive DSA Dataset**: High-quality problem indices for Strivers A2Z (455 problems), NeetCode 150, DSA Patterns, and Company sheets (Google, Amazon, Apple, Meta, Microsoft, Netflix).
4. **Proven SM-2 Spaced Repetition Logic**: The backend interval calculation, confidence score debrief, and review history endpoints are sound and functional.

---

## B. Inspiration Research (16 Products)

| Product | What Works Exceptionally Well | What to Borrow Conceptually | What NOT to Copy |
| :--- | :--- | :--- | :--- |
| **Linear** | Obsidian near-black canvas (`#08090a`), achromatic hierarchy, ultra-subtle border lines (`rgba(255,255,255,0.06)`), 510-weight typography with negative tracking, high-density lists, single brand accent (`#5e6ad2`). | Surface elevation via subtle contrast rather than drop shadows; compact keyboard-navigable list views; status indicators; calm typography. | Don't clone their issue tracker domain models; don't over-densify text to the point of hurting educational readability. |
| **Vercel** | Geist design system, monochrome baseline with crisp contrast, precision border radiuses (6px, 8px, 12px), segmented pill tabs, instant keyboard command palette, tabular monospace numbers. | Segmented tab controls; metric cards with subtle sparklines; clean top headers; Geist Mono tabular numerical formatting. | Stark brutalist pure black/white that causes halation/eye fatigue in prolonged study sessions; don't eliminate helpful visual context. |
| **Raycast** | Gold standard command palette (`⌘K`), instant keystroke filtering, action accessories (`⌘↵` for secondary action, `Tab` for action menu), clear item badges and metadata rows. | Global command palette with grouped results (Problems, Sheets, Revisions, Actions, Companies), recent items, keyboard navigation (`↑`, `↓`, `↵`, `Esc`). | Don't turn the whole web app into a floating desktop launcher; Raycast is an OS utility, TufTracker is an end-to-end learning workspace. |
| **Arc** | Collapsible clean sidebar, space separation, fluid layout transitions, distraction-free viewports. | Collapsible slim sidebar navigation (`64px` icon-only $\leftrightarrow$ `240px` expanded); clean peek/drawer overlays for problem details; full focus mode. | Overly chaotic colorful gradients, excessive sidebar customization, or confusing space-switching paradigms. |
| **Stripe** | Benchmark for dashboard data hierarchy, micro-interactions, responsive data tables with rich pill filters, crystal-clear empty and loading states. | Filter bar patterns (multi-select pill filters with active count badges); table row hover actions; progressive disclosure for complex analytics. | Giant marketing gradient ribbons; Stripe's dashboard is light-mode and billing-centric, whereas developer tools need dark-mode-first engineering. |
| **Notion** | Clean hierarchical navigation, lightweight collapsible accordions, distraction-free markdown/document reading, sticky table of contents. | Editorial typography in `LearnPage` and AI explanations; sticky table of contents; expandable insight callouts (Intuition, Edge Cases). | Unstructured block-based dragging and sluggish canvas rendering. |
| **GitHub** | Developer mental model: commit heatmaps, pull request review tabs, issue labels, split code diffs, markdown rendering. | Activity heatmap visualization (subtle greens/oranges), code review diff aesthetics, keyboard shortcuts (`t` to search, `/` to focus search). | Cluttered legacy enterprise navigation bars, overly dense header rows, dated form controls. |
| **GitLab** | Robust multi-stage CI/CD pipeline views, job output streaming terminals, execution time indicators. | Code runner execution console design: status badges (Passed, Failed, Timeout, Compilation Error), execution time, memory usage, stdout/stderr formatting. | Deeply nested, cluttered settings trees. |
| **LeetCode** | Split-pane problem solving interface, test case runner (Testcase vs Test Result), Monaco editor integration, submission history. | Problem statement layout structure (Description, Examples, Constraints), test case input format and runner tabs. | Cluttered ad banners, dated discussion forums, garish neon colors, inconsistent dark mode surfaces. |
| **Codewars** | Gamified kata progression, focused test-driven development experience, clean test output assertions. | Immediate feedback loop during test execution, clear breakdown of passing vs failing test cases with expected vs actual output diffs. | Overly dark, fantasy RPG aesthetic that doesn't fit modern professional engineering tools. |
| **Brilliant** | Progressive disclosure of difficult concepts, step-by-step intuitive interactive hints, visual explanation of algorithmic intuitions before showing formulas/code. | AI Study Mode and Hint architecture: Step 1 (Conceptual Intuition) $\to$ Step 2 (Algorithmic Approach / Pattern) $\to$ Step 3 (Edge Cases & Invariants) $\to$ Step 4 (Complete Optimal Code). | Oversized cartoon illustrations and childlike gamification. |
| **Readwise** | The gold standard for spaced repetition review UX. Daily review queue (5-10 items), progress bar, discrete review actions ("Soon", "Later", "Mastered"), distraction-free focus card. | The Spaced Revision flow: Flashcard-style recall prompt $\to$ Reveal intuition & code $\to$ Self-rating assessment $\to$ Automated SM-2 next interval scheduling with fluid transitions. | Mobile-first swipe gestures that don't translate cleanly to a desktop developer keyboard environment. |
| **Perplexity** | AI answer structuring: clean markdown headers, numbered sources/citations, confidence badges, follow-up query pills, instant streaming perception with skeleton loaders. | AI Hint and AI Solution layout: Clean collapsible sections, complexity callouts (Time $O(N)$, Space $O(1)$), copy buttons, approach comparison matrix. | Giant conversational chat stream that pushes problem context off the screen. |
| **Modern AI Dev Tools** (Cursor, Claude) | Side-by-side agentic workspace where AI assists directly in context rather than in a disconnected chat bubble. | AI Command bar dockable within the problem solver; inline explanation callouts. | Autonomous multi-file rewrites or unconstrained chat loops. |
| **Developer Dashboards** (Railway, Supabase, Neon) | High-density project grids, real-time status indicators, clean connection string copy boxes, restrained resource usage meters. | Metric cards with sparklines and progress meters; project/problem health indicators. | Overly dark purple/cyan neon lines that scream "crypto dashboard". |
| **SaaS Analytics** (PostHog, June) | Cohesive chart palettes, semantic color assignment (green for success, amber for warning, blue/violet for primary trends), interactive tooltips with precise metadata, cohort filter bars. | Cohesive Recharts styling, custom tooltips with dark surface styling, filterable metrics without page reload. | Complex multi-dimensional funnel builders that overwhelm DSA progress tracking. |

---

## C. Component Library & Tooling Research

### 1. Foundation: Radix UI / shadcn Patterns
- **Evaluation**: The current codebase relies on ad-hoc Tailwind classes with duplicated modal backdrops, dropdowns, and button classes scattered across pages.
- **Decision**: Adopt the **shadcn / Radix headless architecture pattern**. Rather than pulling in massive unneeded npm packages, implement lightweight, accessible primitives within `src/components/ui/`:
  - `Button` (variants: `primary`, `secondary`, `ghost`, `outline`, `danger`, `subtle`)
  - `Input` / `SearchInput` (with built-in shortcut hints like `⌘K` or `/`)
  - `Select` / `DropdownMenu` (accessible, keyboard-driven)
  - `Dialog` / `Modal` (focus trapped, ESC dismiss, smooth fade/scale animation)
  - `Drawer` (slide-over panel for problem detail inspection without leaving the page)
  - `Tooltip` (hover metadata for icons and collapsed navigation)
  - `Tabs` (segmented sliding pill indicator for solution tiers and runner output)
  - `Badge` (semantic pills for difficulty, platform, company, status)
  - `Card` (standardized border, surface luminance, and hover transition)
  - `CommandPalette` (instant search modal with keyboard navigation)
  - `Skeleton` (geometric content placeholders)
  - `Toast` (clean notifications with dismiss and retry actions).

### 2. Animated Primitives: Framer Motion 12 (`motion/react`)
- **Evaluation**: `framer-motion: ^12.23.25` is already installed.
- **Decision**: Do **not** install Magic UI or Aceternity UI as large npm packages, which often cause dependency conflicts and encourage "AI slop" visual noise. Instead, build clean, hardware-accelerated motion primitives directly with Framer Motion:
  - `PageTransition`: 180ms opacity + 4px vertical transform.
  - `FadeIn` / `SlideIn`: Snappy physics curve `cubic-bezier(0.16, 1, 0.3, 1)`.
  - `SlidingTabs`: Smooth layoutId animation for active tab pills.
  - `AnimateHeight` / `Collapsible`: Accordions and drawer expansions.
  - `HoverCard`: Subtle 1px lift with surface luminance shift.
  - **Crucial**: Implement `useReducedMotion()` across all animation wrappers to strictly honor `prefers-reduced-motion`.

### 3. Data Visualization: Recharts 3.5 + Tremor-Style Abstraction
- **Evaluation**: `recharts: ^3.5.1` is already installed.
- **Decision**: Retain Recharts as the underlying SVG chart engine. Create unified, standardized chart wrappers (`MetricCard`, `TrendChart`, `HeatmapGrid`, `RadarMastery`) with:
  - Custom dark-surface SVG tooltip component with glass background and crisp typography.
  - Consistent grid lines (`stroke="rgba(255,255,255,0.06)"`, `strokeDasharray="3 3"`).
  - Standardized semantic color tokens (avoid rainbow charts; use indigo for velocity, emerald for solved, amber for medium, rose for hard).

### 4. Code & Text Primitives: Monaco + SafeMarkdown
- **Evaluation**: Monaco Editor (`@monaco-editor/react: ^4.7.0`) and `SafeMarkdown` are proven in the application.
- **Decision**: Keep Monaco Editor and `SafeMarkdown` exactly as they are functionally, but wrap them in polished developer chrome:
  - Monaco: Standardized VS Code Dark Modern theme, custom header with language selector, format code button, reset button, and execution indicator.
  - SafeMarkdown: Refined typography tokens (crisp headings, syntax-highlighted code blocks with copy-to-clipboard buttons, styled tables, and formatted callouts).

---

## D. Proposed Visual Direction

```
        ┌────────────────────────────────────────────────────────┐
        │                 CANVAS: #08090d                        │
        │                                                        │
        │   ┌────────────────────────────────────────────────┐   │
        │   │             SURFACE: #0e111a                   │   │
        │   │         Border: rgba(255,255,255,0.07)         │   │
        │   │                                                │   │
        │   │   ┌────────────────────────────────────────┐   │   │
        │   │   │         RAISED CARD: #141824           │   │   │
        │   │   │     Border: rgba(255,255,255,0.09)     │   │   │
        │   │   │                                        │   │   │
        │   │   │   ┌────────────────────────────────┐   │   │   │
        │   │   │   │   INTERACTIVE CONTROL: #1a1f30 │   │   │   │
        │   │   │   │   Hover: #222940               │   │   │   │
        │   │   │   │   Accent: #6366f1 (Indigo)     │   │   │   │
        │   │   │   └────────────────────────────────┘   │   │   │
        │   │   └────────────────────────────────────────┘   │   │
        │   └────────────────────────────────────────────────┘   │
        └────────────────────────────────────────────────────────┘
```

### 1. Color System (Semantic Tokens)

Color is an instrument of hierarchy, status, and feedback—never gratuitous decoration.

| Token | Dark Value | Light Fallback | Semantic Purpose |
| :--- | :--- | :--- | :--- |
| `--background` | `#08090d` | `#f8fafc` | Deepest canvas background |
| `--surface` | `#0e111a` | `#ffffff` | Primary panel / sidebar surface |
| `--surface-raised` | `#141824` | `#f1f5f9` | Cards, tables, and dialog containers |
| `--surface-elevated` | `#1b2030` | `#ffffff` | Modals, popovers, and command palette |
| `--surface-hover` | `#222940` | `#e2e8f0` | Interactive control hover state |
| `--surface-active` | `#28304c` | `#cbd5e1` | Pressed / active state |
| `--border-subtle` | `rgba(255,255,255,0.06)` | `rgba(0,0,0,0.06)` | Quiet divider lines |
| `--border` | `rgba(255,255,255,0.10)` | `rgba(0,0,0,0.12)` | Default card and input borders |
| `--border-strong` | `rgba(255,255,255,0.20)` | `rgba(0,0,0,0.24)` | Active focus and selected borders |
| `--foreground` | `#f8fafc` | `#0f172a` | High-contrast primary headings & text |
| `--foreground-muted` | `#94a3b8` | `#475569` | Secondary body text and subtitles |
| `--foreground-subtle`| `#64748b` | `#94a3b8` | Metadata, captions, keyboard hints |
| `--primary` | `#6366f1` | `#4f46e5` | Core brand accent (Electric Indigo) |
| `--primary-hover` | `#818cf8` | `#4338ca` | Primary button & link hover |
| `--brand-amber` | `#f59e0b` | `#d97706` | Streaks, SM-2 retention highlights |
| `--difficulty-easy` | `#10b981` | `#059669` | Easy problems, test passed |
| `--difficulty-medium`| `#f59e0b` | `#d97706` | Medium problems, warning |
| `--difficulty-hard` | `#f43f5e` | `#e11d48` | Hard problems, test failed, overdue |

---

### 2. Typography Hierarchy

- **UI Sans-Serif**: `Plus Jakarta Sans`, `-apple-system`, `BlinkMacSystemFont`, `Inter`, `sans-serif`.
- **Code & Numeric Monospace**: `JetBrains Mono`, `monospace`. All numbers in tables, execution times, and metrics use `font-mono tabular-nums`.

| Level | Size / Line Height | Weight | Tracking | Usage |
| :--- | :--- | :--- | :--- | :--- |
| **Display** | `32px` / `38px` (`text-3xl`) | 800 (Extrabold) | `-0.03em` | Key metric values, login hero |
| **H1** | `24px` / `30px` (`text-2xl`) | 700 (Bold) | `-0.025em` | Page titles (Dashboard, Problems, Analytics) |
| **H2** | `18px` / `24px` (`text-lg`) | 600 (Semibold) | `-0.02em` | Major section headers, modal titles |
| **H3** | `14px` / `20px` (`text-sm`) | 600 (Semibold) | `-0.01em` | Card titles, group headings |
| **Body** | `14px` / `22px` (`text-sm`) | 400 (Regular) | `0` | Standard problem text, descriptions, notes |
| **Body Small** | `13px` / `18px` (`text-xs+`) | 400 (Regular) | `0` | Secondary descriptions, table cells |
| **Caption** | `12px` / `16px` (`text-xs`) | 500 (Medium) | `0` | Timestamps, table headers, helper hints |
| **Micro** | `11px` / `14px` (`text-2xs`) | 600 (Semibold) | `0.02em` | Difficulty badges, status pills, shortcuts |
| **Code** | `13px` / `20px` (`font-mono`) | 400 / 500 | `0` | Code blocks, inline signatures, test stdin |

---

### 3. Spacing & Elevation

- **Base Spacing Scale**: Strict 4px/8px rhythm: `4px` (`p-1`), `8px` (`p-2`), `12px` (`p-3`), `16px` (`p-4`), `20px` (`p-5`), `24px` (`p-6`), `32px` (`p-8`), `48px` (`p-12`).
- **Border Radii**:
  - Small Controls (`button`, `input`, `badge`, `kbd`): `8px` (`rounded-lg`)
  - Medium Containers (`card`, `table`, `panel`): `12px` (`rounded-xl`)
  - Large Overlays (`dialog`, `drawer`, `command-menu`): `16px` (`rounded-2xl`)
  - Semantic Status Dots / Avatars: `9999px` (`rounded-full`).
- **Elevation**:
  - No thick, blurry drop-shadows that wash out dark mode.
  - Rely on 1px subtle white borders (`rgba(255,255,255,0.08)`) and inner top rim lighting (`box-shadow: inset 0 1px 0 0 rgba(255,255,255,0.06)`).

---

### 4. Motion System

- **Curves**:
  - Snappy physics: `cubic-bezier(0.16, 1, 0.3, 1)` (Linear / Raycast standard)
  - Layout transition: `cubic-bezier(0.25, 1, 0.5, 1)`
- **Durations**:
  - Instant micro-interactions (hover, active press): `100ms – 150ms`
  - Overlays & Popovers (dropdown, tooltip, command menu): `180ms – 220ms`
  - Layout transitions (page navigation, panel resize): `250ms`
- **Rules**:
  - Animations must be interruptible.
  - Never animate every card sequentially with delayed stagger in dense tables.
  - Respect `prefers-reduced-motion` unconditionally.

---

## E. Proposed Architecture & Component Catalog

```
frontend/src/
├── components/
│   ├── ui/
│   │   ├── Button.jsx             # Accessible button with 6 variants, loading spinner, tactile active state
│   │   ├── Input.jsx              # Clean input with optional left/right icons and keyboard shortcut badges
│   │   ├── Select.jsx             # Accessible custom select
│   │   ├── Dialog.jsx             # Focus-trapped modal dialog with smooth entrance
│   │   ├── Drawer.jsx             # Contextual slide-over drawer for inspection
│   │   ├── Tooltip.jsx            # Micro tooltip for collapsed navigation & icon controls
│   │   ├── Tabs.jsx               # Segmented sliding pill tabs with Framer Motion layoutId
│   │   ├── Badge.jsx              # Difficulty, platform, status, and tag pills
│   │   ├── Card.jsx               # Standardized obsidian card with inner rim lighting
│   │   ├── Table.jsx              # Dense data table with sticky headers, sorting, and hover highlights
│   │   ├── CommandPalette.jsx     # True ⌘K global command menu with fuzzy search and actions
│   │   ├── Skeleton.jsx           # Tailored layout skeleton loaders
│   │   ├── Toast.jsx              # Notification system for rate limits, success, and errors
│   │   ├── SafeMarkdown.jsx       # Preserved hardened Markdown renderer
│   │   └── CodeHighlighter.jsx    # Syntax highlighting wrapper
│   ├── layout/
│   │   ├── AppShell.jsx           # Global master shell wrapping all authenticated routes
│   │   ├── Sidebar.jsx            # Sleek collapsible navigation (64px collapsed, 240px expanded)
│   │   ├── Topbar.jsx             # Clean header with breadcrumbs, command trigger, streak, profile
│   │   ├── PageHeader.jsx         # Unified page title, description, and action button bar
│   │   └── Breadcrumbs.jsx        # Route hierarchy indicator
│   ├── data/
│   │   ├── MetricCard.jsx         # Executive KPI card with trend indicator and sparkline
│   │   ├── ChartCard.jsx          # Recharts container with standardized tooltip and legend
│   │   └── ActivityHeatmap.jsx    # Polished annual solve velocity calendar
│   ├── problem/
│   │   ├── ProblemRow.jsx         # High-density problem table row with hover actions
│   │   ├── ProblemCard.jsx        # Optional grid view problem card
│   │   ├── ProblemFilters.jsx     # Unified search and segmented filter bar
│   │   └── ProblemStatement.jsx   # Structured problem description with examples & constraints
│   ├── workspace/
│   │   ├── WorkspaceLayout.jsx    # Shared, robust split-pane layout for all solving/viewing pages
│   │   ├── MonacoWorkspace.jsx    # Polished Monaco editor chrome (language, run, test cases)
│   │   ├── RunnerConsole.jsx      # Execution output, stdout/stderr, runtime, memory usage
│   │   └── AICopilotPanel.jsx     # Unified AI hints, solutions, intuition, and edge cases
│   └── revision/
│       ├── RevisionQueueCard.jsx  # Focused spaced repetition card with SM-2 interval pills
│       ├── ReviewFlowModal.jsx    # Distraction-free Recall -> Reveal -> Self-Rate review flow
│       └── RetentionGauge.jsx     # SM-2 memory retention visualizer
```

---

## F. Migration Strategy (Phased & Zero-Downtime)

To ensure that no existing behavior is broken and every single route remains fully functional throughout the redesign, the transformation will be executed in **14 disciplined phases (UI-0 through UI-13)**:

```
[UI-0: Research & Audit] (Current Phase - Verified & Documented)
       │
       ▼
[UI-1: Design System & Design Tokens]
       │  • Implement semantic tokens in index.css and tailwind.config.js
       │  • Build reusable UI primitives (Button, Input, Badge, Card, Tabs, Modal, etc.)
       │  • Verify with Vitest & build check
       ▼
[UI-2: Global Application Shell]
       │  • Implement AppShell, modern collapsible Sidebar, Topbar, and genuine ⌘K CommandPalette
       │  • Connect all existing routes under AppShell with seamless navigation
       ▼
[UI-3: Dashboard Redesign]
       │  • Build dedicated Mission Control dashboard at `/` (Greeting, Today's Targets, Streak, Metrics)
       ▼
[UI-4: Problems Page & Problem Table]
       │  • Redesign `/problems` with dense, keyboard-navigable table, fast filters, and hover previews
       ▼
[UI-5: Flagship Code Workspace]
       │  • Consolidate duplicate split panes into unified `WorkspaceLayout`
       │  • Redesign Monaco editor surrounding chrome, runner console, and test case execution
       ▼
[UI-6: AI Experience & Copilot]
       │  • Redesign AI hints, solutions (Brute/Better/Optimal), edge cases, and debriefs
       │  • Eliminate polling anti-patterns and fragile localStorage loops
       ▼
[UI-7: Spaced Revision Flow]
       │  • Redesign `/revision` and `/revision/:id` around a focused, calm review workflow
       │  • Replace gamer/hacker copy with professional developer ergonomics
       ▼
[UI-8: Analytics Page]
       │  • Redesign `/analytics` with cohesive Recharts styling, KPI cards, and solve velocity heatmap
       ▼
[UI-9: Companies Hub & Readiness]
       │  • Redesign `/companies` and `/company-prep/:companyName`
       │  • Replace confusing double-click interaction with clear card/drawer exploration
       ▼
[UI-10: Learn & DSA Patterns]
       │  • Redesign `/learn` and `/sheets/*` (Strivers, NeetCode, Patterns)
       │  • Eliminate hardcoded colors; align completely with design tokens
       ▼
[UI-11: Authentication & Settings]
       │  • Redesign `/login`, user profile, and preferences
       ▼
[UI-12: Responsive & Accessibility Pass]
       │  • Desktop, tablet, mobile layouts; keyboard navigation; ARIA roles; reduced-motion audit
       ▼
[UI-13: Performance & Final Polish]
       │  • Bundle optimization, layout shift elimination, production build validation
```

### Safety & Invariant Guarantees
1. **API Contracts**: Zero changes to backend routes or Firebase authentication contracts.
2. **Security Integrity**: `SafeMarkdown` remains the single sink for all user and AI markdown content.
3. **Continuous Verification**: After every single phase, run `npm run test` and `npm run build` to guarantee green tests and clean builds.

---

*UI-0 Research phase concluded. Awaiting instruction for UI-1.*
