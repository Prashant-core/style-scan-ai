"use client";

import { motion, useReducedMotion } from "framer-motion";

// A score from 0 to 100 shown as a bar that fills in.
export default function ScoreBar({ label, value, hint, delay = 0 }) {
  const reduce = useReducedMotion();
  const score = Math.max(0, Math.min(100, Math.round(value)));

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <p className="font-medium">{label}</p>
        <p className="font-display text-2xl font-semibold leading-none tabular-nums">{score}</p>
      </div>
      <div
        className="mt-2 h-2 overflow-hidden rounded-full bg-line"
        role="img"
        aria-label={`${label}: ${score} out of 100`}
      >
        <motion.div
          className="h-full rounded-full bg-tape"
          initial={{ width: reduce ? `${score}%` : 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: reduce ? 0 : 0.8, delay: reduce ? 0 : delay, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
      {hint && <p className="mt-2 text-sm text-muted">{hint}</p>}
    </div>
  );
}