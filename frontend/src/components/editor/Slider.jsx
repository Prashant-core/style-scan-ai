"use client";

import { useId } from "react";

// A labelled slider. Double-click (or double-tap) it to put it back to its starting value.
// onChange runs all the time while dragging. onCommit runs once when the person lets go.
export default function Slider({
  label,
  value,
  min = -100,
  max = 100,
  step = 1,
  resetTo = 0,
  suffix = "",
  onChange,
  onCommit,
}) {
  const id = useId();

  return (
    <div>
      <div className="flex items-baseline justify-between text-sm">
        <label htmlFor={id} className="font-medium">
          {label}
        </label>
        <span className="tabular-nums text-muted">
          {value}
          {suffix}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        onPointerUp={onCommit}
        onTouchEnd={onCommit}
        onKeyUp={onCommit}
        onBlur={onCommit}
        onDoubleClick={() => {
          onChange(resetTo);
          onCommit();
        }}
        className="mt-1 h-6 w-full cursor-pointer accent-ink"
      />
    </div>
  );
}