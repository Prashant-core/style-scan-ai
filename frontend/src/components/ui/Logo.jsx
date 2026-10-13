import Link from "next/link";

// A face outline with a measuring line across it.
// tone="light" is for dark backgrounds.
export function LogoMark({ tone = "dark", className = "size-8" }) {
  const light = tone === "light";
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none" aria-hidden="true">
      <rect width="32" height="32" rx="7" className={light ? "fill-tape" : "fill-ink"} />
      <ellipse
        cx="16"
        cy="16"
        rx="6.5"
        ry="8.5"
        strokeWidth="1.6"
        className={light ? "stroke-ink" : "stroke-white"}
      />
      <path
        d="M7 16h18M7 12.5v7M25 12.5v7"
        strokeWidth="2"
        strokeLinecap="round"
        className={light ? "stroke-ink" : "stroke-tape"}
      />
    </svg>
  );
}

export default function Logo({ href = "/", tone = "dark", className = "" }) {
  const light = tone === "light";
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-2.5 ${
        light ? "text-white focus-visible:outline-tape" : "text-ink"
      } ${className}`}
    >
      <LogoMark tone={tone} />
      <span className="font-display text-[1.6rem] font-semibold leading-none tracking-tight">
        StyleScan AI
      </span>
    </Link>
  );
}