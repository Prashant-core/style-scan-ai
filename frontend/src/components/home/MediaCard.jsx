import Link from "next/link";

// A picture card with a title on it, and an optional small tag in the corner.
// With "before", the card shows the sliding before/after line when you hover it (the line rests in the middle on phones).
//   size: Tailwind classes for the width and shape, for example "w-[240px] aspect-[9/16]"
export default function MediaCard({ href, after, before, title, tag, size = "w-[260px] aspect-[3/4]", children }) {
  const slides = Boolean(before);

  return (
    <Link
      href={href}
      className={`pw-tile group/card relative block shrink-0 snap-start overflow-hidden rounded-[20px] bg-surface ${
        slides ? "pw-ba" : ""
      } ${size}`}
      style={{ margin: 0 }}
    >
      <div className="absolute inset-0 transition-transform duration-700 ease-out group-hover/card:scale-[1.04]">
        {after && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={after} alt="" loading="lazy" className="pw-layer" />
        )}
        {slides && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={before} alt="" loading="lazy" className="pw-layer pw-before" />
            <span className="pw-line" aria-hidden="true" />
          </>
        )}
        {children}
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
      {tag && (
        <span className="absolute right-3 top-3 rounded-full bg-black/65 px-3 py-1 text-xs font-medium text-white backdrop-blur">
          {tag}
        </span>
      )}
      <p className="absolute inset-x-4 bottom-4 text-[17px] font-medium leading-snug text-white">{title}</p>
    </Link>
  );
}