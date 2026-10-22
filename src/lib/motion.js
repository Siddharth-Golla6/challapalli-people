// Shared Framer Motion variants + transition presets used across the app.
// Keeping them in one file means the whole site breathes with the same
// rhythm — one easing, one duration bank, one stagger step.

export const emphasised = [0.2, 0.7, 0.1, 1];

export const T = {
  snap: { duration: 0.18, ease: emphasised },
  base: { duration: 0.35, ease: emphasised },
  slow: { duration: 0.55, ease: emphasised },
};

// Page-level fade + lift between routes. Honours reduced-motion through
// the useReducedMotion hook in callers that care.
export const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: T.slow },
  exit: { opacity: 0, y: -8, transition: T.base },
};

// Reveal a hero (or hero-like block) with a staggered cascade of children.
// Children opt in with `heroItem` below.
export const heroContainer = {
  initial: {},
  animate: { transition: { staggerChildren: 0.09, delayChildren: 0.1 } },
};
export const heroItem = {
  initial: { opacity: 0, y: 18, filter: "blur(6px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.9, ease: emphasised } },
};

// Grid of cards entering together. Each item lifts and fades from below.
export const gridContainer = {
  initial: {},
  animate: { transition: { staggerChildren: 0.055, delayChildren: 0.05 } },
};
export const gridItem = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.45, ease: emphasised } },
};

// Interactive affordances for Link/button cards.
export const cardHover = {
  rest: { y: 0, scale: 1 },
  hover: { y: -4, scale: 1.005, transition: T.base },
  tap: { scale: 0.985, transition: T.snap },
};

// Toast / banner slide-in from bottom-right.
export const toast = {
  initial: { opacity: 0, y: 24, scale: 0.96 },
  animate: { opacity: 1, y: 0, scale: 1, transition: T.base },
  exit: { opacity: 0, y: 12, scale: 0.98, transition: T.snap },
};

// Tab panel crossfade (People's Voice, admin tabs).
export const tabPanel = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: T.base },
  exit: { opacity: 0, y: -4, transition: T.snap },
};
