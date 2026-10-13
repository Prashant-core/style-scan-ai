"use client";

import { motion, useReducedMotion } from "framer-motion";

// An example face that gets measured with yellow tape lines.
// It is drawn for dark backgrounds. The values are an example, not a real scan.

const FACE =
  "M200 70C270 70 305 120 305 200C305 270 290 340 250 385C232 405 215 412 200 412C185 412 168 405 150 385C110 340 95 270 95 200C95 120 130 70 200 70Z";

const ACROSS = [
  { id: "forehead", x1: 116, x2: 284, y: 112, label: "Forehead", value: "0.80", delay: 1.5 },
  { id: "cheekbones", x1: 95, x2: 305, y: 200, label: "Cheekbones", value: "1.00", delay: 2.0 },
  { id: "jaw", x1: 120, x2: 280, y: 338, label: "Jaw", value: "0.76", delay: 2.5 },
];

const LENGTH = { x: 56, y1: 70, y2: 412, label: "Length", value: "1.63", delay: 3.0 };

const LANDMARKS = [
  [160, 178],
  [240, 178],
  [200, 250],
  [168, 308],
  [232, 308],
];

export default function FaceDiagram({ animate = true, className = "" }) {
  const reduce = useReducedMotion();
  const play = animate && !reduce;

  const timing = (delay, duration = 0.5) =>
    play ? { duration, delay, ease: "easeInOut" } : { duration: 0 };

  const draw = (delay, duration) => ({
    initial: { pathLength: play ? 0 : 1 },
    animate: { pathLength: 1 },
    transition: timing(delay, duration),
  });

  const fade = (delay, to = 1) => ({
    initial: { opacity: play ? 0 : to },
    animate: { opacity: to },
    transition: timing(delay, 0.4),
  });

  return (
    <svg
      viewBox="0 0 540 460"
      fill="none"
      role="img"
      aria-label="Example face with four measurements: forehead, cheekbones, jaw and length"
      className={className}
    >
      {/* Face outline */}
      <motion.path
        d={FACE}
        strokeWidth="2"
        strokeLinejoin="round"
        className="stroke-white/85"
        {...draw(0.2, 1.2)}
      />

      {/* Brows, eyes, nose and mouth */}
      <motion.g strokeWidth="1.8" strokeLinecap="round" className="stroke-white/50" {...fade(1.0)}>
        <path d="M146 160Q165 150 184 158M216 158Q235 150 254 160" />
        <ellipse cx="160" cy="178" rx="14" ry="5.5" />
        <ellipse cx="240" cy="178" rx="14" ry="5.5" />
        <path d="M200 188C198 215 192 235 190 246C196 254 206 254 212 246" />
        <path d="M168 308Q200 322 232 308" />
      </motion.g>

      {/* Face landmarks */}
      <motion.g className="fill-tape" {...fade(1.2)}>
        {LANDMARKS.map(([cx, cy]) => (
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="3.5" />
        ))}
      </motion.g>

      {/* Width measurements */}
      {ACROSS.map((m) => (
        <g key={m.id}>
          <motion.line
            x1={m.x1}
            y1={m.y + 9}
            x2={m.x2}
            y2={m.y + 9}
            strokeWidth="6"
            strokeDasharray="1.5 9"
            className="stroke-tape"
            {...fade(m.delay + 0.3, 0.5)}
          />
          <motion.line
            x1={m.x1}
            y1={m.y}
            x2={m.x2}
            y2={m.y}
            strokeWidth="2.5"
            strokeLinecap="round"
            className="stroke-tape"
            {...draw(m.delay, 0.6)}
          />
          <motion.path
            d={`M${m.x1} ${m.y - 8}V${m.y + 8}M${m.x2} ${m.y - 8}V${m.y + 8}`}
            strokeWidth="2.5"
            strokeLinecap="round"
            className="stroke-tape"
            {...fade(m.delay + 0.5)}
          />
          <motion.text
            x={m.x2 + 18}
            y={m.y + 5}
            fontSize="15"
            className="fill-white"
            style={{ fontVariantNumeric: "tabular-nums" }}
            {...fade(m.delay + 0.5)}
          >
            {m.label}{" "}
            <tspan fontWeight="700" className="fill-tape">
              {m.value}
            </tspan>
          </motion.text>
        </g>
      ))}

      {/* Length measurement */}
      <g>
        <motion.line
          x1={LENGTH.x + 9}
          y1={LENGTH.y1}
          x2={LENGTH.x + 9}
          y2={LENGTH.y2}
          strokeWidth="6"
          strokeDasharray="1.5 9"
          className="stroke-tape"
          {...fade(LENGTH.delay + 0.3, 0.5)}
        />
        <motion.line
          x1={LENGTH.x}
          y1={LENGTH.y1}
          x2={LENGTH.x}
          y2={LENGTH.y2}
          strokeWidth="2.5"
          strokeLinecap="round"
          className="stroke-tape"
          {...draw(LENGTH.delay, 0.8)}
        />
        <motion.path
          d={`M${LENGTH.x - 8} ${LENGTH.y1}H${LENGTH.x + 8}M${LENGTH.x - 8} ${LENGTH.y2}H${LENGTH.x + 8}`}
          strokeWidth="2.5"
          strokeLinecap="round"
          className="stroke-tape"
          {...fade(LENGTH.delay + 0.7)}
        />
        <motion.text
          x={LENGTH.x}
          y={LENGTH.y2 + 32}
          textAnchor="middle"
          fontSize="15"
          className="fill-white"
          style={{ fontVariantNumeric: "tabular-nums" }}
          {...fade(LENGTH.delay + 0.7)}
        >
          {LENGTH.label}{" "}
          <tspan fontWeight="700" className="fill-tape">
            {LENGTH.value}
          </tspan>
        </motion.text>
      </g>
    </svg>
  );
}