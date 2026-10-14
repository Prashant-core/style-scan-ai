"use client";

import { motion, useReducedMotion } from "framer-motion";

// Shows the photo with the measurement lines drawn on top.
// "lines" use positions between 0 and 1, so they fit the photo at any size.
export default function FaceOverlay({ src, lines, aspect }) {
  const reduce = useReducedMotion();

  return (
    <div
      className="relative w-full overflow-hidden rounded-xl bg-ink"
      style={{ aspectRatio: aspect }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="Your photo with the measured lines" className="absolute inset-0 size-full object-cover" />

      <svg
        viewBox="0 0 1 1"
        preserveAspectRatio="none"
        className="absolute inset-0 size-full"
        aria-hidden="true"
      >
        {lines.map((item, index) => (
          <motion.line
            key={item.name}
            x1={item.from.x}
            y1={item.from.y}
            x2={item.to.x}
            y2={item.to.y}
            stroke="#f2c230"
            strokeWidth={3}
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            initial={{ pathLength: reduce ? 1 : 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: reduce ? 0 : 0.7, delay: reduce ? 0 : 0.2 + index * 0.25 }}
          />
        ))}
      </svg>

      {lines.flatMap((item) => [item.from, item.to]).map((point, index) => (
        <span
          key={index}
          className="absolute size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-tape ring-2 ring-ink"
          style={{ left: `${point.x * 100}%`, top: `${point.y * 100}%` }}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}