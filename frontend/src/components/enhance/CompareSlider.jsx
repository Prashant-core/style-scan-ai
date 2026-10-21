"use client";

import { useEffect, useRef, useState } from "react";
import { MoveHorizontal } from "lucide-react";

// Shows two canvases on top of each other, with a divider you drag to compare them.
// Left of the divider is "before". Right of it is "after".
// The canvases are used as they are (not copied), so when the enhancer draws new pieces
// onto the "after" canvas, they show up here straight away.
// These touch the canvases directly (they belong to the browser's page, not to React)
function mountCanvases(stage, before, after) {
  before.className = "block h-auto w-full";
  after.className = "absolute inset-0 block h-full w-full";
  stage.replaceChildren(before, after);
}

function clipAfter(after, percent) {
  after.style.clipPath = `inset(0 0 0 ${percent}%)`;
}

export default function CompareSlider({ before, after }) {
  const stageRef = useRef(null);
  const [position, setPosition] = useState(50); // the divider, as a percentage from the left

  // Puts the two canvases on the page
  useEffect(() => {
    const stage = stageRef.current;
    mountCanvases(stage, before, after);
    return () => stage.replaceChildren();
  }, [before, after]);

  // Hides the part of "after" that is left of the divider
  useEffect(() => {
    clipAfter(after, position);
  }, [after, position]);

  // Keeps a tall photo from being taller than the screen
  const maxWidth = `calc(72vh * ${before.width / before.height})`;

  return (
    <div
      className="relative mx-auto w-full overflow-hidden rounded-lg border border-line bg-surface"
      style={{ maxWidth }}
    >
      <div ref={stageRef} className="relative" />

      <span
        className="pointer-events-none absolute inset-y-0 w-0.5 -translate-x-1/2 bg-white shadow-[0_0_6px_rgba(0,0,0,0.5)]"
        style={{ left: `${position}%` }}
        aria-hidden="true"
      />
      <span
        className="pointer-events-none absolute top-1/2 flex size-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-ink shadow-lg"
        style={{ left: `${position}%` }}
        aria-hidden="true"
      >
        <MoveHorizontal className="size-5" />
      </span>

      <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-ink/70 px-3 py-1 text-xs font-semibold text-white">
        Before
      </span>
      <span className="pointer-events-none absolute right-3 top-3 rounded-full bg-ink/70 px-3 py-1 text-xs font-semibold text-white">
        After
      </span>

      {/* The real control. It covers the whole picture, so you can drag anywhere. It also works with the arrow keys. */}
      <input
        type="range"
        min={0}
        max={100}
        step={0.1}
        value={position}
        onChange={(event) => setPosition(Number(event.target.value))}
        aria-label="Drag to compare the original and the enhanced photo"
        className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
      />
    </div>
  );
}