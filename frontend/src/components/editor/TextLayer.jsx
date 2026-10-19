"use client";

import { useRef } from "react";
import { FONT_STACK } from "@/utils/editor";

const clamp = (value, low, high) => Math.min(high, Math.max(low, value));

// Shows the words on top of the photo so they can be dragged.
// Positions are shares of the photo (0 to 1). Sizes are a share of the photo's width,
// so the words look the same on screen as in the saved file.
export default function TextLayer({ texts, selectedId, onSelect, onMove, onMoveEnd }) {
  const areaRef = useRef(null);
  const dragRef = useRef(null);

  function pointFrom(event) {
    const bounds = areaRef.current.getBoundingClientRect();
    return {
      x: (event.clientX - bounds.left) / bounds.width,
      y: (event.clientY - bounds.top) / bounds.height,
    };
  }

  function begin(event, item) {
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    const point = pointFrom(event);
    dragRef.current = { id: item.id, offsetX: point.x - item.x, offsetY: point.y - item.y };
    onSelect(item.id);
  }

  function move(event) {
    const drag = dragRef.current;
    if (!drag) return;
    const point = pointFrom(event);
    onMove(drag.id, clamp(point.x - drag.offsetX, 0, 1), clamp(point.y - drag.offsetY, 0, 1));
  }

  function end() {
    if (dragRef.current) onMoveEnd();
    dragRef.current = null;
  }

  // Arrow keys move the selected words a little, for people who do not use a mouse
  function nudge(event, item) {
    const step = event.shiftKey ? 0.05 : 0.01;
    const moves = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
    const change = moves[event.key];
    if (!change) return;
    event.preventDefault();
    onMove(item.id, clamp(item.x + change[0], 0, 1), clamp(item.y + change[1], 0, 1));
    onMoveEnd();
  }

  return (
    <div
      ref={areaRef}
      className="absolute inset-0 select-none overflow-hidden [container-type:inline-size]"
      onPointerDown={() => onSelect(null)}
      role="presentation"
    >
      {texts.map((item) => {
        const size = item.size * 100;
        return (
          <div
            key={item.id}
            role="button"
            tabIndex={0}
            aria-label={`Text: ${item.text}. Drag, or use the arrow keys, to move it.`}
            onPointerDown={(event) => begin(event, item)}
            onPointerMove={move}
            onPointerUp={end}
            onPointerCancel={end}
            onKeyDown={(event) => nudge(event, item)}
            className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-move touch-none whitespace-nowrap focus-visible:outline-dashed focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-tape ${
              selectedId === item.id ? "outline-dashed outline-2 outline-offset-4 outline-tape" : ""
            }`}
            style={{
              left: `${item.x * 100}%`,
              top: `${item.y * 100}%`,
              fontFamily: FONT_STACK,
              fontWeight: item.bold ? 700 : 500,
              fontSize: `${size}cqw`,
              lineHeight: 1,
              color: item.color,
              textShadow: item.shadow
                ? `0 ${size * 0.04}cqw ${size * 0.12}cqw rgba(0, 0, 0, 0.5)`
                : undefined,
            }}
          >
            {item.text}
          </div>
        );
      })}
    </div>
  );
}