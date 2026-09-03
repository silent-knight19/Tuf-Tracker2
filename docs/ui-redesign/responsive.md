# UI Redesign: Responsive Architecture & Breakpoints

This document establishes responsive rules and layout adaptations across desktop, tablet, and mobile breakpoints.

## 1. Breakpoint System

| Breakpoint | Viewport Width | Target Devices | Navigation Pattern | Layout Structure |
| :--- | :--- | :--- | :--- | :--- |
| **Mobile (`sm`)** | `< 768px` | Phones (iPhone, Pixel) | Bottom navigation bar / Mobile drawer | Single column cards, stacked workspace |
| **Tablet (`md`)** | `768px – 1023px`| iPad, Tablets | Collapsed slim sidebar (`64px`) | 2-column grid, stacked code runner |
| **Desktop (`lg`)** | `1024px – 1439px`| Laptops (MacBook Air/Pro) | Expanded sidebar (`240px`) | 12-column grid, side-by-side workspace |
| **Wide (`xl`/`2xl`)** | `1440px+` | External displays, 4K | Fully expanded with contextual right drawers | Dense multi-column, dual full-height panes |

## 2. Page-Specific Responsive Adaptations

### Coding Workspace (`/solve/:id`, `/problem/:id`, `/interview/ai`)
- **Desktop (`>= 1024px`)**: Side-by-side dual pane with draggable split divider (Problem Statement on Left, Monaco Editor & Console on Right).
- **Mobile/Tablet (`< 1024px`)**: Stacked tab layout (`[Problem Statement] [Code Editor] [Test Console]`) allowing full-screen focus on code editing without horizontal cramping.

### Problem Bank (`/problems`)
- **Desktop**: High-density table view with all metadata visible (Status, Title, Tags, Patterns, Company, Difficulty, Revision Status, Action).
- **Mobile**: Compact card/list hybrid displaying Title, Difficulty Badge, and Status with swipe/tap to open inspection drawer.

### Dashboard (`/`)
- **Desktop**: 12-column Bento layout (Today's Targets [8 cols] + Streak/Retention Gauge [4 cols]; Problem Grid [8 cols] + Quick Practice Labs [4 cols]).
- **Mobile**: Single vertical stream sorted by action priority: Due Revisions $\to$ Continue Sheet $\to$ Daily Recommended Problem $\to$ Quick Practice.

## 3. Touch Targets & Ergonomics
- Minimum interactive touch target: `44px x 44px` on mobile.
- Inputs prevent iOS automatic zoom by using minimum `16px` font size on mobile or standard `text-sm` (`14px`) with proper viewport meta settings.
