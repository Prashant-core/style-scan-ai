"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import Logo from "@/components/ui/Logo";
import Sidebar from "@/components/ui/Sidebar";
import ProtectedRoute from "./ProtectedRoute";

// The frame for every page after login: sidebar, mobile top bar and page heading.
// Pass wide for pages that need more room, like the photo editor.
export default function AppShell({ title, description, wide = false, children }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <ProtectedRoute>
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-line bg-paper/90 px-5 backdrop-blur lg:hidden">
          <Logo href="/home" />
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            className="-mr-2 flex size-10 items-center justify-center rounded-lg text-ink transition-colors hover:bg-ink/5"
          >
            <Menu className="size-5" />
          </button>
        </header>

        <main className={`mx-auto w-full px-5 py-10 lg:px-10 lg:py-14 ${wide ? "max-w-7xl" : "max-w-5xl"}`}>
          {title && (
            <div className="mb-10 max-w-2xl">
              <h1 className="font-display text-5xl font-semibold leading-none tracking-tight">
                {title}
              </h1>
              {description && <p className="mt-3 text-lg text-muted">{description}</p>}
            </div>
          )}
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}