"use client";

import { motion, useReducedMotion } from "framer-motion";

// A template starts again on every page change, so each page fades in and rises a little.
// With "reduce motion" turned on in the device settings, the page just appears.
export default function Template({ children }) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, y: reduce ? 0 : 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduce ? 0 : 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}