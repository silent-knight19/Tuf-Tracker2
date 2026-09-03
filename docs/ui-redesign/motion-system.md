# UI Redesign: Motion System & Animation Rules

This document outlines the animation architecture, timing curves, and accessibility rules for all motion in TufTracker 2.

## 1. Principles of Motion

1. **Functional, Not Decorative**: Motion exists to communicate causality, spatial origin, and system feedback. It must never delay navigation or block the user.
2. **Snappy & Physical**: Use low-latency spring physics (`cubic-bezier(0.16, 1, 0.3, 1)`) matching Linear and Raycast.
3. **Interruptibility**: Animations must allow immediate user interaction mid-flight.
4. **Strict Reduced-Motion Support**: Respect `prefers-reduced-motion` unconditionally.

## 2. Animation Tokens & Easing Curves

```javascript
export const motionTokens = {
  // Easing Curves
  easeSpring: [0.16, 1, 0.3, 1],    // Snappy physical entrance
  easeStandard: [0.25, 1, 0.5, 1],  // Smooth continuous motion
  easeOut: [0, 0, 0.2, 1],          // Exit animations

  // Durations (in seconds)
  durationInstant: 0.1,             // Active press (100ms)
  durationFast: 0.15,               // Hover shifts (150ms)
  durationNormal: 0.2,              // Dropdowns, tooltips (200ms)
  durationModal: 0.24,              // Dialog scale/fade (240ms)
  durationPage: 0.25,               // Page layout transition (250ms)
};
```

## 3. Motion Primitives Catalog

### `PageTransition`
Subtle 200ms opacity and 4px vertical translation. Prevents abrupt white/black flash while avoiding sluggish multi-second fades.

```jsx
<motion.div
  initial={{ opacity: 0, y: 4 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -4 }}
  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
>
  {children}
</motion.div>
```

### `SlidingTabs`
Uses Framer Motion `layoutId="activePill"` to glide the background pill behind the selected tab seamlessly.

### `ModalEntrance`
Scale `0.98 -> 1.0` with opacity `0 -> 1` in `220ms`. Backdrop fades in with `backdrop-blur-md`.

### `TableHoverRow`
Instant 120ms background color luminance shift (`rgba(255,255,255,0.03)`). No vertical scale or bounce.

## 4. Reduced-Motion Implementation

All Framer Motion wrappers must integrate:
```javascript
import { useReducedMotion } from 'framer-motion';

export function useMotionSettings() {
  const shouldReduce = useReducedMotion();
  return {
    transition: shouldReduce ? { duration: 0 } : { duration: 0.2, ease: [0.16, 1, 0.3, 1] },
    animate: shouldReduce ? { opacity: 1 } : undefined,
  };
}
```
In CSS:
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```
