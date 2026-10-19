"use client";

import { useRef } from "react";

const MIN_SIZE = 0.06; // the crop box can never be smaller than 6% of the photo
const clamp = (value, low, high) => Math.min(high, Math.max(low, value));

const CORNERS = [
  { mode: "nw", style: "left-0 top-0 -translate-x-1/2 -translate-y-1/2 cursor-nwse-resize" },
  { mode: "ne", style: "left-full top-0 -translate-x-1/2 -translate-y-1/2 cursor-nesw-resize" },
  { mode: "sw", style: "left-0 top-full -translate-x-1/2 -translate-y-1/2 cursor-nesw-resize" },
  { mode: "se", style: "left-full top-full -translate-x-1/2 -translate-y-1/2 cursor-nwse-resize" },
];

// Moves one corner. The opposite corner stays where it is.
// "ratio" is the width divided by the height of the box (as shares of the photo), or null for a free shape.
function resize(mode, base, point, ratio) {
  const west = mode.includes("w");
  const north = mode.includes("n");
  const fixedX = west ? base.x + base.w : base.x;
  const fixedY = north ? base.y + base.h : base.y;
  const maxW = west ? fixedX : 1 - fixedX;
  const maxH = north ? fixedY : 1 - fixedY;

  let w = Math.max(MIN_SIZE, (west ? fixedX - point.x : point.x - fixedX));
  let h = Math.max(MIN_SIZE, (north ? fixedY - point.y : point.y - fixedY));

  if (ratio) {
    w = Math.max(w, h * ratio);
    w = Math.min(w, maxW, maxH * ratio);
    h = w / ratio;
  } else {
    w = Math.min(w, maxW);
    h = Math.min(h, maxH);
  }

  return { x: west ? fixedX - w : fixedX, y: north ? fixedY - h : fixedY, w, h };
}

// The box you drag to choose the crop. Everything outside the box is dimmed.
// rect and the numbers it holds are shares of the photo, from 0 to 1.
export default function CropOverlay({ rect, ratio, onChange }) {
  const areaRef = useRef(null);
  const dragRef = useRef(null);

  function pointFrom(event) {
    const bounds = areaRef.current.getBoundingClientRect();
    return {
      x: clamp((event.clientX - bounds.left) / bounds.width, 0, 1),
      y: clamp((event.clientY - bounds.top) / bounds.height, 0, 1),
    };
  }

  function begin(event, mode) {
    event.preventDefault();
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { mode, start: pointFrom(event), base: rect };
  }

  function move(event) {
    const drag = dragRef.current;
    if (!drag) return;
    const point = pointFrom(event);

    if (drag.mode === "move") {
      const x = clamp(drag.base.x + (point.x - drag.start.x), 0, 1 - drag.base.w);
      const y = clamp(drag.base.y + (point.y - drag.start.y), 0, 1 - drag.base.h);
      onChange({ ...drag.base, x, y });
    } else {
      onChange(resize(drag.mode, drag.base, point, ratio));
    }
  }

  function end() {
    dragRef.current = null;
  }

  const dragProps = { onPointerMove: move, onPointerUp: end, onPointerCancel: end };

  return (
    <div ref={areaRef} className="absolute inset-0 touch-none select-none overflow-hidden">
      <div
        className="absolute cursor-move shadow-[0_0_0_9999px_rgba(15,26,42,0.6)] outline outline-2 outline-white"
        style={{
          left: `${rect.x * 100}%`,
          top: `${rect.y * 100}%`,
          width: `${rect.w * 100}%`,
          height: `${rect.h * 100}%`,
        }}
        onPointerDown={(event) => begin(event, "move")}
        {...dragProps}
        role="presentation"
      >
        {/* Thirds grid */}
        <span className="pointer-events-none absolute inset-y-0 left-1/3 w-px bg-white/50" />
        <span className="pointer-events-none absolute inset-y-0 left-2/3 w-px bg-white/50" />
        <span className="pointer-events-none absolute inset-x-0 top-1/3 h-px bg-white/50" />
        <span className="pointer-events-none absolute inset-x-0 top-2/3 h-px bg-white/50" />

        {CORNERS.map((corner) => (
          <span
            key={corner.mode}
            className={`absolute flex size-9 items-center justify-center ${corner.style}`}
            onPointerDown={(event) => begin(event, corner.mode)}
            {...dragProps}
            role="presentation"
          >
            <span className="size-3.5 rounded-sm border-2 border-ink bg-white" />
          </span>
        ))}
      </div>
    </div>
  );
}