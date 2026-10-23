import Link from "next/link";

// A small square with a face outline and a measuring line across it.
// It uses the theme colours, so it works in light and dark.
export function LogoMark({ className = "size-7" }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none" aria-hidden="true">
      <rect width="32" height="32" rx="7" className="fill-ink" />
      <ellipse cx="16" cy="16" rx="6.5" ry="8.5" strokeWidth="1.6" className="stroke-paper" />
      <path d="M7 16h18M7 12.5v7M25 12.5v7" strokeWidth="2" strokeLinecap="round" className="stroke-paper" />
    </svg>
  );
}

export default function Logo({ href = "/", className = "" }) {
  return (
    <Link href={href} className={`inline-flex items-center gap-2.5 text-ink ${className}`}>
      <LogoMark />
      <span className="font-display text-[1.15rem] leading-none">StyleScan</span>
    </Link>
  );
}