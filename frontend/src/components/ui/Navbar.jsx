"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Menu, X } from "lucide-react";
import Logo from "./Logo";
import Button from "./Button";
import ThemeToggle from "./ThemeToggle";
import { useAuth } from "@/context/AuthContext";
import { FEATURES } from "@/utils/features";

const LINKS = [
  { href: "/#how-it-works", label: "How it works" },
  { href: "/privacy", label: "Privacy" },
];

// A thin line grows under a link when you hover it
const linkStyle =
  "text-[15px] text-ink/80 transition-colors hover:text-ink bg-[linear-gradient(currentColor,currentColor)] bg-[length:0_1px] bg-[position:0_100%] bg-no-repeat pb-0.5 hover:bg-[length:100%_1px] [transition-property:color,background-size] duration-300";

// The "Tools" menu: every tool with its icon. Opens on hover, on focus and with the keyboard.
function ToolsMenu() {
  const [open, setOpen] = useState(false);
  const timer = useRef(null);

  const show = () => {
    clearTimeout(timer.current);
    setOpen(true);
  };
  const hide = () => {
    timer.current = setTimeout(() => setOpen(false), 120);
  };

  return (
    <div
      className="relative"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) hide();
      }}
      onKeyDown={(event) => event.key === "Escape" && setOpen(false)}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((value) => !value)}
        className="inline-flex items-center gap-1 text-[15px] text-ink/80 transition-colors hover:text-ink"
      >
        Tools
        <ChevronDown className={`size-4 transition-transform duration-300 ${open ? "rotate-180" : ""}`} aria-hidden="true" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.18 }}
            className="absolute left-1/2 top-full z-50 w-[min(720px,92vw)] -translate-x-1/2 pt-4"
          >
            <ul className="grid gap-1 rounded-2xl border border-line bg-surface p-3 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.5)] sm:grid-cols-2">
              {FEATURES.map((tool) => {
                const Icon = tool.icon;
                const live = tool.status === "live";
                const row = "group/tool flex items-start gap-3 rounded-xl p-3 transition-colors";
                const inner = (
                  <>
                    <span className="grid size-10 shrink-0 place-items-center rounded-lg border border-line bg-paper">
                      <Icon className="size-5" />
                    </span>
                    <span className="min-w-0">
                      <span className="flex items-center gap-2 font-medium">
                        {tool.label}
                        {!live && <span className="rounded-full border border-line px-2 text-[11px] text-muted">Soon</span>}
                      </span>
                      <span className="mt-0.5 block text-[13px] leading-snug text-muted">{tool.summary}</span>
                    </span>
                  </>
                );
                return (
                  <li key={tool.href}>
                    {live ? (
                      <Link href={tool.href} className={`${row} hover:bg-ink/5`} onClick={() => setOpen(false)}>
                        {inner}
                      </Link>
                    ) : (
                      <div className={`${row} opacity-60`}>{inner}</div>
                    )}
                  </li>
                );
              })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Navbar() {
  const { user, loading } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/90 pt-[env(safe-area-inset-top)] backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 lg:px-8">
        <div className="flex items-center gap-10">
          <Logo />
          <nav className="hidden items-center gap-8 md:flex" aria-label="Main">
            <ToolsMenu />
            {LINKS.map((link) => (
              <Link key={link.href} href={link.href} className={linkStyle}>
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <ThemeToggle />
          {!loading &&
            (user ? (
              <Button href="/home" variant="accent" pill size="sm">
                Open app
              </Button>
            ) : (
              <>
                <Button href="/signup" variant="accent" pill size="sm">
                  Start creating
                </Button>
                <Button href="/login" variant="outline" pill size="sm">
                  Log in
                </Button>
              </>
            ))}
        </div>

        <div className="-mr-2 flex items-center gap-1 md:hidden">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="flex size-10 items-center justify-center rounded-lg text-ink transition-colors hover:bg-ink/5"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="max-h-[calc(100vh-4rem)] overflow-y-auto border-t border-line bg-paper px-5 pb-6 pt-4 md:hidden">
          <nav className="flex flex-col" aria-label="Mobile">
            {FEATURES.filter((tool) => tool.status === "live").map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                onClick={() => setOpen(false)}
                className="border-b border-line py-3.5 text-lg text-ink"
              >
                {tool.label}
              </Link>
            ))}
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="border-b border-line py-3.5 text-lg text-muted"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="mt-5 flex gap-3">
            {!loading &&
              (user ? (
                <Button href="/home" variant="accent" pill className="flex-1">
                  Open app
                </Button>
              ) : (
                <>
                  <Button href="/signup" variant="accent" pill className="flex-1">
                    Start creating
                  </Button>
                  <Button href="/login" variant="outline" pill className="flex-1">
                    Log in
                  </Button>
                </>
              ))}
          </div>
        </div>
      )}
    </header>
  );
}