import Link from "next/link";
import Logo from "./Logo";
import ThemeSwitch from "./ThemeSwitch";

const COLUMNS = [
  {
    title: "Photo tools",
    links: [
      { href: "/editor", label: "Photo editor" },
      { href: "/enhance", label: "Photo enhancer" },
      { href: "/portrait", label: "Portrait tools" },
      { href: "/gallery", label: "My gallery" },
    ],
  },
  {
    title: "Face and skin",
    links: [
      { href: "/face-analysis", label: "Face analysis" },
      { href: "/skin-tracker", label: "Skin tracker" },
      { href: "/assistant", label: "Style assistant" },
    ],
  },
  {
    title: "StyleScan",
    links: [
      { href: "/#how-it-works", label: "How it works" },
      { href: "/privacy", label: "Privacy" },
      { href: "/login", label: "Log in" },
      { href: "/signup", label: "Create account" },
    ],
  },
];

export default function SiteFooter() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-14 lg:grid-cols-[1.2fr_2fr] lg:px-8">
        <div className="flex flex-col items-start gap-5">
          <Logo />
          <p className="max-w-xs text-[15px] leading-relaxed text-muted">
            Photo tools that run on your device, on any screen. Your photos stay private and you can delete them any
            time.
          </p>
          <ThemeSwitch />
        </div>

        <nav className="grid grid-cols-2 gap-8 sm:grid-cols-3" aria-label="Footer">
          {COLUMNS.map((column) => (
            <div key={column.title}>
              <h3 className="font-display text-xl">{column.title}</h3>
              <ul className="mt-4 space-y-3">
                {column.links.map((link) => (
                  <li key={link.href + link.label}>
                    <Link href={link.href} className="text-[15px] text-muted transition-colors hover:text-ink">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>

      <div className="border-t border-line">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-5 py-6 pb-28 text-sm text-muted lg:px-8">
          <p>© {new Date().getFullYear()} StyleScan AI</p>
          <Link href="/privacy" className="transition-colors hover:text-ink">
            Privacy
          </Link>
        </div>
      </div>
    </footer>
  );
}