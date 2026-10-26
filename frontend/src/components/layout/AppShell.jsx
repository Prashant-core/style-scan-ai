"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import Logo from "@/components/ui/Logo";
import Sidebar from "@/components/ui/Sidebar";
import ThemeSwitch from "@/components/ui/ThemeSwitch";
import ThemeToggle from "@/components/ui/ThemeToggle";
import ProtectedRoute from "./ProtectedRoute";

// The frame for every page after login: sidebar, mobile top bar and page heading.
// The light / dark switch sits at the top right of every page (in the top bar on phones).
// Pass wide for pages that need more room, like the photo editor.
export default function AppShell({ title, description, wide = false, children }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <ProtectedRoute>
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-line bg-paper/90 px-5 pt-[env(safe-area-inset-top)] backdrop-blur lg:hidden">
          <Logo href="/home" />
          <div className="-mr-2 flex items-center gap-1">
            <ThemeToggle />
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              className="flex size-10 items-center justify-center rounded-lg text-ink transition-colors hover:bg-ink/5"
            >
              <Menu className="size-5" />
            </button>
          </div>
        </header>

        <main className={`mx-auto w-full px-5 py-8 lg:px-10 lg:py-12 ${wide ? "max-w-7xl" : "max-w-5xl"}`}>
          <div className="mb-10 flex items-start justify-between gap-6">
            {title && (
              <div className="max-w-2xl">
                <h1 className="font-display text-4xl leading-none sm:text-5xl">{title}</h1>
                {description && <p className="mt-3 text-lg text-muted">{description}</p>}
              </div>
            )}
            <div className="ml-auto hidden shrink-0 lg:block">
              <ThemeSwitch />
            </div>
          </div>
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}