// The icons for every tool. They are drawn on a 24 x 24 grid with one thin line weight, so they look like a set.
// Each one has a small movement when you hover the row or card around it.
// For that, the row or card needs the class "group/tool".

function Svg({ className, children }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

// Moving parts turn from their own middle and ease in and out
const part = "transition-transform duration-300 ease-out [transform-box:fill-box] origin-center";

// Photo editor: three sliders. The knobs slide.
export function EditorIcon({ className = "size-5" }) {
  return (
    <Svg className={className}>
      <path d="M4 6h16M4 12h16M4 18h16" strokeOpacity="0.5" />
      <circle cx="9" cy="6" r="2.2" fill="currentColor" stroke="none" className={`${part} group-hover/tool:translate-x-[6px]`} />
      <circle cx="15" cy="12" r="2.2" fill="currentColor" stroke="none" className={`${part} group-hover/tool:-translate-x-[6px]`} />
      <circle cx="8" cy="18" r="2.2" fill="currentColor" stroke="none" className={`${part} group-hover/tool:translate-x-[7px]`} />
    </Svg>
  );
}

// Photo enhancer: sparkles. The big one turns and the small ones grow.
export function EnhanceIcon({ className = "size-5" }) {
  return (
    <Svg className={className}>
      <path
        d="M10 5.5 11.7 10l4.5 1.7L11.7 13.4 10 18l-1.7-4.6L3.8 11.7 8.3 10z"
        className={`${part} group-hover/tool:rotate-90 group-hover/tool:scale-110`}
      />
      <path d="M18 3.5v4M16 5.5h4" className={`${part} group-hover/tool:scale-125`} />
      <path d="M18 15.5v4M16 17.5h4" className={`${part} delay-75 group-hover/tool:scale-125`} />
    </Svg>
  );
}

// Portrait tools: a person inside a dotted cut-out line. The dots march round.
export function PortraitIcon({ className = "size-5" }) {
  return (
    <Svg className={className}>
      <rect
        x="4"
        y="3"
        width="16"
        height="18"
        rx="3.5"
        strokeDasharray="2.2 2.8"
        strokeOpacity="0.6"
        className="transition-[stroke-dashoffset] duration-700 ease-out group-hover/tool:[stroke-dashoffset:-10]"
      />
      <circle cx="12" cy="10" r="2.8" className={`${part} group-hover/tool:-translate-y-px`} />
      <path d="M7 18.5c.7-2.7 2.7-4.1 5-4.1s4.3 1.4 5 4.1" className={`${part} group-hover/tool:-translate-y-px`} />
    </Svg>
  );
}

// My gallery: two frames. The back one slides out.
export function GalleryIcon({ className = "size-5" }) {
  return (
    <Svg className={className}>
      <rect x="8" y="3.5" width="12.5" height="12.5" rx="2.5" strokeOpacity="0.5" className={`${part} group-hover/tool:translate-x-[1.5px] group-hover/tool:-translate-y-[1.5px]`} />
      <g className={`${part} group-hover/tool:-translate-x-[1px] group-hover/tool:translate-y-[1px]`}>
        <rect x="3.5" y="8" width="13" height="12.5" rx="2.5" />
        <circle cx="8" cy="12.3" r="1.1" fill="currentColor" stroke="none" />
        <path d="m3.8 18 3.7-3.4 2.8 2.4 2.2-1.8 3.8 3.3" />
      </g>
    </Svg>
  );
}

// Face analysis: a face with a measuring line. The line moves down and back.
export function FaceIcon({ className = "size-5" }) {
  return (
    <Svg className={className}>
      <path
        d="M3 8V5.5A2.5 2.5 0 0 1 5.5 3H8M16 3h2.5A2.5 2.5 0 0 1 21 5.5V8M21 16v2.5a2.5 2.5 0 0 1-2.5 2.5H16M8 21H5.5A2.5 2.5 0 0 1 3 18.5V16"
        strokeOpacity="0.5"
      />
      <ellipse cx="12" cy="12" rx="4.8" ry="6.3" />
      <path d="M6.8 12h10.4M6.8 10.5v3M17.2 10.5v3" className={`${part} duration-500 group-hover/tool:translate-y-[2.6px]`} />
    </Svg>
  );
}

// Trial room: a t-shirt that swings.
export function ShirtIcon({ className = "size-5" }) {
  return (
    <Svg className={className}>
      <path
        d="M8.2 3.8 3.5 6.3l1.9 3.6 2.6-1.2V20h8V8.7l2.6 1.2 1.9-3.6-4.7-2.5a3.9 3.9 0 0 1-7.6 0z"
        className="origin-top transition-transform duration-500 ease-out [transform-box:fill-box] group-hover/tool:-rotate-6"
      />
    </Svg>
  );
}

// Skin tracker: a line graph. The last point pulses.
export function SkinIcon({ className = "size-5" }) {
  return (
    <Svg className={className}>
      <path d="M4 4v16h16" strokeOpacity="0.5" />
      <path d="m7.5 15 3.6-4.2 3 2.4L19 7" />
      <circle cx="19" cy="7" r="1.7" fill="currentColor" stroke="none" className={`${part} group-hover/tool:scale-[1.5]`} />
    </Svg>
  );
}

// Style assistant: a speech bubble with three dots that hop in turn.
export function ChatIcon({ className = "size-5" }) {
  return (
    <Svg className={className}>
      <path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v7a2.5 2.5 0 0 1-2.5 2.5H11.5l-3.8 3.3c-.4.3-.9.1-.9-.4V16h-.3A2.5 2.5 0 0 1 4 13.5z" />
      <circle cx="9" cy="10" r="1" fill="currentColor" stroke="none" className={`${part} group-hover/tool:-translate-y-[1.6px]`} />
      <circle cx="12.5" cy="10" r="1" fill="currentColor" stroke="none" className={`${part} delay-75 group-hover/tool:-translate-y-[1.6px]`} />
      <circle cx="16" cy="10" r="1" fill="currentColor" stroke="none" className={`${part} delay-150 group-hover/tool:-translate-y-[1.6px]`} />
    </Svg>
  );
}

// History: a clock whose hand spins once.
export function HistoryIcon({ className = "size-5" }) {
  return (
    <Svg className={className}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 12 14.8 13.6" />
      <path d="M12 12V7.4" className="origin-bottom transition-transform duration-700 ease-in-out [transform-box:fill-box] group-hover/tool:rotate-[360deg]" />
    </Svg>
  );
}

// Settings: a cog that turns a little.
export function SettingsIcon({ className = "size-5" }) {
  return (
    <Svg className={className}>
      <g className={`${part} duration-500 group-hover/tool:rotate-45`}>
        <circle cx="12" cy="12" r="3" />
        <circle cx="12" cy="12" r="6.2" />
        <path d="M12 2.8v2M12 19.2v2M2.8 12h2M19.2 12h2M5.5 5.5l1.4 1.4M17.1 17.1l1.4 1.4M18.5 5.5l-1.4 1.4M6.9 17.1l-1.4 1.4" />
      </g>
    </Svg>
  );
}

// Home: a house. The roof lifts a little.
export function HomeIcon({ className = "size-5" }) {
  return (
    <Svg className={className}>
      <path d="M4.5 11 12 4.5 19.5 11" className={`${part} group-hover/tool:-translate-y-[1.2px]`} />
      <path d="M6 9.8V19a.8.8 0 0 0 .8.8H10v-5h4v5h3.2a.8.8 0 0 0 .8-.8V9.8" />
    </Svg>
  );
}