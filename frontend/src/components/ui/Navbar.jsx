"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import Logo from "./Logo";
import Button from "./Button";
import { useAuth } from "@/context/AuthContext";

const LINKS = [
  { href: "/#what-it-does", label: "What it does" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/privacy", label: "Privacy" },
];

const linkStyle =
  "relative text-[15px] text-muted transition-colors hover:text-ink after:absolute after:-bottom-1 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-ink after:transition-transform after:duration-300 hover:after:scale-x-100";

export default function Navbar() {
  const { user, loading } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 lg:px-8">
        <Logo />

        <nav className="hidden items-center gap-9 md:flex" aria-label="Main">
          {LINKS.map((link) => (
            <Link key={link.href} href={link.href} className={linkStyle}>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
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

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          className="-mr-2 flex size-10 items-center justify-center rounded-lg text-ink transition-colors hover:bg-ink/5 md:hidden"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
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