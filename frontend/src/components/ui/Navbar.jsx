"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import Logo from "./Logo";
import Button from "./Button";
import ThemeToggle from "./ThemeToggle";
import { useAuth } from "@/context/AuthContext";

const LINKS = [
  { href: "/#what-it-does", label: "Tools" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/privacy", label: "Privacy" },
];

// A thin line grows under a link when you hover it
const linkStyle =
  "text-[15px] text-muted transition-colors hover:text-ink bg-[linear-gradient(currentColor,currentColor)] bg-[length:0_1px] bg-[position:0_100%] bg-no-repeat pb-0.5 hover:bg-[length:100%_1px] [transition-property:color,background-size] duration-300";

export default function Navbar() {
  const { user, loading } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/90 pt-[env(safe-area-inset-top)] backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 lg:px-8">
        <Logo />

        <nav className="hidden items-center gap-8 md:flex" aria-label="Main">
          {LINKS.map((link) => (
            <Link key={link.href} href={link.href} className={linkStyle}>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <ThemeToggle />
          {!loading &&
            (user ? (
              <Button href="/home" size="sm">
                Open app
              </Button>
            ) : (
              <>
                <Button href="/login" variant="ghost" size="sm">
                  Log in
                </Button>
                <Button href="/signup" size="sm">
                  Create account
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
        <div className="border-t border-line bg-paper px-5 pb-6 pt-4 md:hidden">
          <nav className="flex flex-col" aria-label="Mobile">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="border-b border-line py-3.5 text-lg text-ink"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="mt-5 flex gap-3">
            {!loading &&
              (user ? (
                <Button href="/home" className="flex-1">
                  Open app
                </Button>
              ) : (
                <>
                  <Button href="/login" variant="secondary" className="flex-1">
                    Log in
                  </Button>
                  <Button href="/signup" className="flex-1">
                    Create account
                  </Button>
                </>
              ))}
          </div>
        </div>
      )}
    </header>
  );
}