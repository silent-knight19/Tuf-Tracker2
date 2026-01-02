# TufTracker Design System & Theming Guide

This document defines the core UI principles, tokens, and components for TufTracker. All new components must adhere to these standards to maintain a uniform, "premium" aesthetic.

## 🎨 Core Color Palette

| Category | Token | Hex / Value | Usage |
| :--- | :--- | :--- | :--- |
| **Base** | `dark-950` | `#0f0f0f` | Main page background |
| | `dark-900` | `#1a1a1a` | Card & sidebar background |
| | `dark-800` | `#2d2d2d` | Borders & input backgrounds |
| **Accents**| `brand-orange` | `#ffa116` | Primary action, focus, "hot" states |
| | `brand-yellow` | `#ffc01e` | Secondary action, XP, "medium" states |
| **Status** | `easy` | `#00b8a3` | Solved, easy difficulty |
| | `medium` | `#ffc01e` | Pending, medium difficulty |
| | `hard` | `#ef4743` | Overdue, hard difficulty |

## ✨ Design "DNA" (The Look & Feel)

### 1. Glassmorphism (The Glass Effect)
Most containers should feel like semi-transparent glass.
- **Pattern**: `bg-dark-900/40 backdrop-blur-xl border border-dark-800/60`
- **Usage**: Cards, headers, navigation panels.

### 2. Typography Hierarchy
Use **Inter** for all text and **JetBrains Mono** for code.
- **Main Titles**: `text-4xl` or `text-3xl`, `font-black`, `tracking-tight`, `text-white`.
- **Section Headers**: `text-sm`, `font-bold`, `uppercase`, `tracking-widest`, `text-dark-400`.
- **Micro-Labels**: `text-[10px]`, `font-black`, `uppercase`, `tracking-[0.2em]`, `text-brand-orange`.
- **Body Text**: `text-sm` or `text-base`, `text-dark-100`.

### 3. Interactive Elements (Hover States)
Elements should feel alive. When hovering:
- **Scaling**: `hover:scale-[1.05]` or `hover:scale-110` (for smaller icons).
- **Glow**: Use `shadow-[0_0_20px_rgba(249,115,22,0.1)]`.
- **Borders**: Transition from `border-dark-800` to `border-brand-orange/30`.

### 4. Spacing & Layout
- **Container Padding**: `p-6` (Default for dashboard pages).
- **Section Spacing**: `space-y-8` or `space-y-10`.
- **Card Padding**: `p-5` or `p-6`.
- **Corner Radius**: `rounded-3xl` (3rem/48px) for large containers, `rounded-xl` (12px) for buttons.

## 🛠 Component Reference

### The "Universal Card"
```jsx
<div className="bg-dark-900/40 backdrop-blur-xl border border-dark-800/60 rounded-3xl p-6 transition-all hover:border-brand-orange/30 group">
  <span className="text-[10px] font-black text-brand-orange uppercase tracking-widest mb-2 block">
    Category Label
  </span>
  <h3 className="text-xl font-black text-white mb-2">Card Title</h3>
  <p className="text-sm text-dark-400">Descriptive content goes here...</p>
</div>
```

### The "Premium Pill" (Buttons/Badges)
```jsx
<button className="px-4 py-2 bg-brand-orange/10 border border-brand-orange/20 rounded-xl text-brand-orange text-[11px] font-black uppercase tracking-widest hover:bg-brand-orange hover:text-white transition-all active:scale-95">
  Action Label
</button>
```

### Icon Containers
Always wrap Lucide icons in a subtle background.
- **Style**: `w-10 h-10 rounded-xl bg-dark-950 border border-dark-800 flex items-center justify-center shadow-inner`

## 🌑 Global Utilities (Commonly Used)
- **Scrollbar**: `custom-scrollbar` (Defined in `index.css`).
- **Text Gradient**: `text-transparent bg-clip-text bg-gradient-to-r from-white to-dark-400`.
- **Shadow Glow**: `shadow-[0_0_15px_rgba(249,115,22,0.1)]`.

---
*Follow these rules to ensure TufTracker remains a cohesive, high-performance training environment.*
