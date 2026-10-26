"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useReducedMotion } from "framer-motion";

// A row of cards you can swipe or scroll sideways. Round arrow buttons appear when there is more to see.
export default function Carousel({ children, label, className = "" }) {
  const track = useRef(null);
  const reduce = useReducedMotion();
  const [edge, setEdge] = useState({ start: true, end: false });

  // Works out whether there is more to the left or to the right.
  // The observer also runs once at the start, so no direct call is needed here.
  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const update = () =>
      setEdge({ start: el.scrollLeft < 4, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4 });
    const observer = new ResizeObserver(update);
    observer.observe(el);
    el.addEventListener("scroll", update, { passive: true });
    return () => {
      observer.disconnect();
      el.removeEventListener("scroll", update);
    };
  }, []);

  function move(direction) {
    const el = track.current;
    el.scrollBy({ left: direction * el.clientWidth * 0.8, behavior: reduce ? "auto" : "smooth" });
  }

  const arrow =
    "absolute top-1/2 z-10 hidden size-11 -translate-y-1/2 place-items-center rounded-full border border-line bg-paper/90 text-ink shadow-lg backdrop-blur transition hover:scale-105 hover:bg-paper sm:grid";

  return (
    <div className={`relative ${className}`}>
      <div
        ref={track}
        role="region"
        aria-label={label}
        tabIndex={0}
        className="flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] sm:gap-4 [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </div>
      {!edge.start && (
        <button type="button" onClick={() => move(-1)} aria-label="Show earlier" className={`${arrow} left-2`}>
          <ChevronLeft className="size-5" aria-hidden="true" />
        </button>
      )}
      {!edge.end && (
        <button type="button" onClick={() => move(1)} aria-label="Show more" className={`${arrow} right-2`}>
          <ChevronRight className="size-5" aria-hidden="true" />
        </button>
      )}
    </div>
  );
} 