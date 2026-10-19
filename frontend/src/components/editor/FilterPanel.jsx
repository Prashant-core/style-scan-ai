"use client";

import { useEffect, useRef } from "react";
import Slider from "@/components/editor/Slider";
import { DEFAULT_EDIT, FILTERS, renderEdit } from "@/utils/editor";

// A small picture of the photo with one filter applied
function FilterThumb({ source, filter }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (canvasRef.current) {
      renderEdit(source, { ...DEFAULT_EDIT, filter }, { target: canvasRef.current });
    }
  }, [source, filter]);

  return <canvas ref={canvasRef} className="aspect-square w-full rounded-md object-cover" aria-hidden="true" />;
}

// One-tap looks, with a slider for how strong the look is
export default function FilterPanel({ thumb, filter, amount, onApply, onLive, onEnd }) {
  return (
    <div className="space-y-5">
      <ul className="grid grid-cols-3 gap-3">
        {FILTERS.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              aria-pressed={filter === item.id}
              onClick={() => {
                if (filter !== item.id) onApply((edit) => ({ ...edit, filter: item.id, filterAmount: 100 }));
              }}
              className={`block w-full rounded-lg border-2 p-1 text-center text-xs font-medium transition-colors ${
                filter === item.id ? "border-ink" : "border-transparent hover:border-line"
              }`}
            >
              <FilterThumb source={thumb} filter={item.id} />
              <span className="mt-1 block">{item.label}</span>
            </button>
          </li>
        ))}
      </ul>

      {filter !== "none" && (
        <Slider
          label="Strength"
          min={0}
          max={100}
          resetTo={100}
          value={amount}
          onChange={(value) => onLive((edit) => ({ ...edit, filterAmount: value }))}
          onCommit={onEnd}
        />
      )}
    </div>
  );
}