// Small drawn pictures used inside cards that are not photos.
// They are made of plain shapes, so they work in light and dark.

// A skin score and its graph
export function SkinArt() {
  return (
    <div className="absolute inset-0 bg-surface p-5">
      <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted">Skin score</p>
      <p className="mt-1 font-display text-5xl leading-none">82</p>
      <svg viewBox="0 0 200 90" className="mt-4 w-full" aria-hidden="true">
        {[20, 45, 70].map((y) => (
          <line key={y} x1="0" x2="200" y1={y} y2={y} className="stroke-line" strokeWidth="1" />
        ))}
        <path d="M4 66 36 58 68 62 100 46 132 40 164 30 196 18" fill="none" className="stroke-ink" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="196" cy="18" r="4.5" className="fill-accent stroke-ink" strokeWidth="1.5" />
      </svg>
    </div>
  );
}

// A short chat
export function ChatArt() {
  return (
    <div className="absolute inset-0 flex flex-col justify-center gap-3 bg-surface p-5">
      <p className="ml-auto max-w-[80%] rounded-2xl rounded-br-md bg-ink px-4 py-2.5 text-[13px] text-paper">
        Which glasses suit me?
      </p>
      <p className="max-w-[88%] rounded-2xl rounded-bl-md border border-line bg-paper px-4 py-2.5 text-[13px] leading-relaxed">
        You have an oval face. Rectangular and round frames both work well.
      </p>
    </div>
  );
}

// A face with measuring lines
export function FaceArt() {
  return (
    <div className="absolute inset-0 grid place-items-center bg-surface">
      <svg viewBox="0 0 120 150" className="h-3/4" aria-hidden="true">
        <ellipse cx="60" cy="72" rx="32" ry="42" fill="none" className="stroke-ink" strokeWidth="2" />
        <path d="M20 58h80M20 54v8M100 54v8M28 88h64M28 84v8M92 84v8M60 22v100" fill="none" className="stroke-accent" strokeWidth="2.2" strokeLinecap="round" />
      </svg>
    </div>
  );
}