"use client";

import { motion, useReducedMotion } from "framer-motion";
import { formatDate } from "@/utils/photo";

const WIDTH = 640;
const HEIGHT = 240;
const PAD = { top: 16, right: 20, bottom: 34, left: 38 };

// A line graph of scores (0 to 100) over time. "points" are { date, value }, oldest first.
export default function TrendChart({ points }) {
  const reduce = useReducedMotion();
  if (points.length === 0) return null;

  const innerWidth = WIDTH - PAD.left - PAD.right;
  const innerHeight = HEIGHT - PAD.top - PAD.bottom;
  const x = (index) =>
    PAD.left + (points.length === 1 ? innerWidth / 2 : (index / (points.length - 1)) * innerWidth);
  const y = (value) => PAD.top + innerHeight - (Math.max(0, Math.min(100, value)) / 100) * innerHeight;

  const path = points.map((p, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)} ${y(p.value).toFixed(1)}`).join(" ");
  const first = points[0];
  const last = points[points.length - 1];

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      className="h-auto w-full"
      role="img"
      aria-label={`Skin score over time. Latest score ${last.value} out of 100.`}
    >
      {[0, 50, 100].map((tick) => (
        <g key={tick}>
          <line x1={PAD.left} x2={WIDTH - PAD.right} y1={y(tick)} y2={y(tick)} stroke="currentColor" strokeOpacity="0.12" />
          <text x={PAD.left - 8} y={y(tick) + 4} textAnchor="end" fontSize="12" fill="currentColor" fillOpacity="0.6">
            {tick}
          </text>
        </g>
      ))}

      {points.length > 1 && (
        <motion.path
          d={path}
          fill="none"
          stroke="#f2c230"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: reduce ? 1 : 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: reduce ? 0 : 1, ease: "easeOut" }}
        />
      )}

      {points.map((p, i) => (
        <circle key={p.date + i} cx={x(i)} cy={y(p.value)} r="5" fill="#f2c230" stroke="currentColor" strokeWidth="2">
          <title>{`${formatDate(p.date)}: ${p.value}`}</title>
        </circle>
      ))}

      <text x={PAD.left} y={HEIGHT - 10} fontSize="12" fill="currentColor" fillOpacity="0.6">
        {formatDate(first.date)}
      </text>
      {points.length > 1 && (
        <text x={WIDTH - PAD.right} y={HEIGHT - 10} textAnchor="end" fontSize="12" fill="currentColor" fillOpacity="0.6">
          {formatDate(last.date)}
        </text>
      )}
    </svg>
  );
}