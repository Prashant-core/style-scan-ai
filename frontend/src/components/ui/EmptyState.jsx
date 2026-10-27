"use client";

import { motion, useReducedMotion } from "framer-motion";

// A friendly box for pages with nothing in them yet.
// Pass an icon, a title, a sentence, and buttons (as children).
export default function EmptyState({ icon: Icon, title, children, actions, className = "" }) {
  const reduce = useReducedMotion();

  return (
    <div
      className={`flex flex-col items-center rounded-2xl border border-dashed border-ink/25 bg-surface px-6 py-14 text-center ${className}`}
    >
      {Icon && (
        <motion.span
          className="grid size-16 place-items-center rounded-2xl border border-line bg-paper"
          animate={reduce ? undefined : { y: [0, -5, 0] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
        >
          <Icon className="size-8" />
        </motion.span>
      )}
      <h2 className="mt-5 font-display text-2xl sm:text-3xl">{title}</h2>
      {children && <p className="mt-2 max-w-md text-muted">{children}</p>}
      {actions && <div className="mt-6 flex flex-wrap justify-center gap-3">{actions}</div>}
    </div>
  );
}