# UI Redesign: Design System & Design Tokens

This document serves as the technical reference for all design tokens and Tailwind extensions implemented in the TufTracker 2 frontend.

## 1. Token Catalog

### Canvas & Surfaces
- `--background`: `#08090d`
- `--background-subtle`: `#0b0d13`
- `--surface`: `#0e111a`
- `--surface-raised`: `#141824`
- `--surface-elevated`: `#1b2030`
- `--surface-hover`: `#222940`
- `--surface-active`: `#28314c`

### Borders
- `--border-subtle`: `rgba(255, 255, 255, 0.06)`
- `--border`: `rgba(255, 255, 255, 0.10)`
- `--border-strong`: `rgba(255, 255, 255, 0.20)`
- `--border-focus`: `#6366f1`

### Text & Foregrounds
- `--foreground`: `#f8fafc`
- `--foreground-muted`: `#94a3b8`
- `--foreground-subtle`: `#64748b`

### Accents & Status
- `--primary`: `#6366f1` (Electric Indigo)
- `--primary-hover`: `#818cf8`
- `--primary-active`: `#4f46e5`
- `--primary-subtle`: `rgba(99, 102, 241, 0.12)`
- `--accent-amber`: `#f59e0b` (Warm Amber for streaks & achievements)
- `--difficulty-easy`: `#10b981` (Emerald)
- `--difficulty-medium`: `#f59e0b` (Amber)
- `--difficulty-hard`: `#f43f5e` (Rose)

## 2. Tailwind Integration Mapping

```javascript
// tailwind.config.js extend.colors:
colors: {
  background: {
    DEFAULT: 'var(--background)',
    subtle: 'var(--background-subtle)',
  },
  surface: {
    DEFAULT: 'var(--surface)',
    raised: 'var(--surface-raised)',
    elevated: 'var(--surface-elevated)',
    hover: 'var(--surface-hover)',
    active: 'var(--surface-active)',
  },
  border: {
    DEFAULT: 'var(--border)',
    subtle: 'var(--border-subtle)',
    strong: 'var(--border-strong)',
  },
  foreground: {
    DEFAULT: 'var(--foreground)',
    muted: 'var(--foreground-muted)',
    subtle: 'var(--foreground-subtle)',
  },
  primary: {
    DEFAULT: 'var(--primary)',
    hover: 'var(--primary-hover)',
    active: 'var(--primary-active)',
    subtle: 'var(--primary-subtle)',
  },
}
```

## 3. Elevation & Inner Rim Highlights
Cards and surfaces use an inner rim highlight:
```css
box-shadow: inset 0 1px 0 0 rgba(255, 255, 255, 0.06);
```
This creates crisp physical separation in dark mode without blurry drop shadows.
