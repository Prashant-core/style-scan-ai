"use client";

import { motion, useReducedMotion } from "framer-motion";

const SCALE_MAX = 1.5; // the bar is full at 1.50
const REFERENCE = 1 / SCALE_MAX; // where the cheekbone width (1.00) sits on the bar

// One measurement: a name, a number, and a bar compared with the cheekbones.
export default function MetricCard({ label, value, hint, delay = 0 }) {
  const reduce = useReducedMotion();
  const fill = Math.min(100, Math.max(0, (value / SCALE_MAX) * 100));

  return (
    <div className="rounded-xl border border-line bg-surface p-5">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-1 font-display text-4xl font-semibold leading-none tracking-tight">
        {value.toFixed(2)}
      </p>

      <div
        className="relative mt-4 h-2 rounded-full bg-line"
        role="img"
        aria-label={`${label}: ${value.toFixed(2)} compared with 1.00 for the cheekbones`}
      >
        <motion.div
          className="h-full rounded-full bg-tape"
          initial={{ width: reduce ? `${fill}%` : 0 }}
          animate={{ width: `${fill}%` }}
          transition={{ duration: reduce ? 0 : 0.8, delay: reduce ? 0 : delay, ease: [0.22, 1, 0.36, 1] }}
        />
        <span
          className="absolute -top-1 h-4 w-px bg-ink"
          style={{ left: `${REFERENCE * 100}%` }}
          aria-hidden="true"
        />
      </div>

      {hint && <p className="mt-3 text-sm text-muted">{hint}</p>}
    </div>
  );
}