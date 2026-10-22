import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { pageVariants } from "../lib/motion";

// Thin wrapper that gives every routed page a shared entrance/exit.
// If the user prefers reduced motion we skip the transform/fade entirely
// and render children straight through — accessibility non-negotiable.
export default function PageShell({ children, className = "" }) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {children}
    </motion.div>
  );
}
