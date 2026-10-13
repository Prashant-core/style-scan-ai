"use client";

import { motion, useReducedMotion } from "framer-motion";

// Fades content in and moves it up a little.
// By default it plays when the content scrolls into view.
// With onLoad it plays as soon as the page opens.
export default function Reveal({ children, delay = 0, y = 14, onLoad = false, className = "" }) {
  const reduce = useReducedMotion();

  const shown = { opacity: 1, y: 0 };
  const trigger = onLoad
    ? { animate: shown }
    : { whileInView: shown, viewport: { once: true, margin: "-80px" } };

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: reduce ? 0 : y }}
      transition={{ duration: reduce ? 0 : 0.55, delay: reduce ? 0 : delay, ease: [0.22, 1, 0.36, 1] }}
      {...trigger}
    >
      {children}
    </motion.div>
  );
}