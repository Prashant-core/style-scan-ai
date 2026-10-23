// A wall of example pictures. Each one shows what a tool does.
// The pictures are in frontend/public/wall/. Run "python scripts/make_wall.py" (see that file) to make them.
// To use your own photos, put them in frontend/public/wall/ and change the paths below.
// "after" is the result. "before" is the original, and gives the sliding before/after line on hover.
// "ratio" is the picture's height divided by its width.
// Without "after", a soft colour block is shown instead (tones are 3 colours for it).

export const WALL_ITEMS = [
  { ratio: 1.16, title: "Enhance 2×", tool: "Enhancer", before: "/wall/enhance-before.jpg", after: "/wall/enhance-after.jpg" },
  { ratio: 1, title: "Blur background", tool: "Portrait", before: "/wall/blur-before.jpg", after: "/wall/blur-after.jpg" },
  { ratio: 1.18, title: "Face shape", tool: "Analysis", after: "/wall/face-shape.jpg" },
  { ratio: 1, title: "Auto-fix", tool: "Editor", before: "/wall/autofix-before.jpg", after: "/wall/autofix-after.jpg" },
  { ratio: 1.105, title: "Smooth skin", tool: "Portrait", before: "/wall/smooth-before.jpg", after: "/wall/smooth-after.jpg" },
  { ratio: 1.333, title: "Saved edit", tool: "Gallery", after: "/wall/saved.jpg" },
  { ratio: 1, title: "Crop and filters", tool: "Editor", before: "/wall/filters-before.jpg", after: "/wall/filters-after.jpg" },
];

export function PhotoTile({ item, captions = true }) {
  const hasImage = Boolean(item.after);
  const slides = Boolean(item.before) || (!hasImage && item.ba);
  const [c1, c2, c3] = item.tones || ["#bbb", "#ddd", "#888"];
  const style = { "--ar": (1 / item.ratio).toFixed(3), "--c1": c1, "--c2": c2, "--c3": c3 };
  if (hasImage) style.aspectRatio = "var(--ar)";

  return (
    <figure className={`pw-tile${slides ? " pw-ba" : ""}`}>
      <div
        className={
          hasImage
            ? "relative overflow-hidden rounded-lg bg-line transition-transform duration-500 ease-out [.pw-tile:hover_&]:-translate-y-[3px]"
            : "pw-photo"
        }
        style={style}
      >
        {hasImage ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.after} alt={item.title} loading="lazy" className="pw-layer" />
            {item.before && (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.before} alt="" loading="lazy" className="pw-layer pw-before" />
                <span className="pw-line" aria-hidden="true" />
              </>
            )}
          </>
        ) : (
          <>
            <i className="pw-layer pw-soft" aria-hidden="true" />
            {slides && <i className="pw-layer pw-soft pw-before" aria-hidden="true" />}
            {slides && <span className="pw-line" aria-hidden="true" />}
          </>
        )}
      </div>
      {captions && (
        <figcaption className="mt-2 flex items-baseline justify-between gap-3 text-[13px]">
          <span>{item.title}</span>
          <span className="whitespace-nowrap font-mono text-[10.5px] uppercase tracking-[0.06em] text-muted">
            {item.tool}
          </span>
        </figcaption>
      )}
    </figure>
  );
}

export default function PhotoWall({ items = WALL_ITEMS, className = "" }) {
  return (
    <div className={`pw-wall ${className}`}>
      {items.map((item) => (
        <PhotoTile key={item.title} item={item} />
      ))}
    </div>
  );
}