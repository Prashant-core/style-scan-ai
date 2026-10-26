"use client";

import { useState } from "react";
import { useSidebarCollapsed } from "@/utils/sidebar";
import Sidebar from "@/components/ui/Sidebar";
import BottomTabs from "./BottomTabs";
import ProtectedRoute from "./ProtectedRoute";
import TopBar from "./TopBar";

// The frame for every page after login: left menu, top bar and (on phones) a bottom tab bar.
// Pass wide for pages that need more room, like the photo editor.
// Pass bare to skip the page heading and the width limit (the home dashboard does this).
export default function AppShell({ title, description, wide = false, bare = false, children }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [collapsed] = useSidebarCollapsed();

  return (
    <ProtectedRoute>
      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} />

      <div className={`transition-[padding] duration-300 ${collapsed ? "lg:pl-[76px]" : "lg:pl-64"}`}>
        <TopBar onMenu={() => setMenuOpen(true)} />

        <main
          className={`mx-auto w-full px-4 pb-28 pt-6 sm:px-6 lg:px-10 lg:pb-12 lg:pt-8 ${
            bare ? "max-w-[1400px]" : wide ? "max-w-7xl" : "max-w-5xl"
          }`}
        >
          {title && (
            <div className="mb-10 max-w-2xl">
              <h1 className="font-display text-4xl leading-none sm:text-5xl">{title}</h1>
              {description && <p className="mt-3 text-lg text-muted">{description}</p>}
            </div>
          )}
          {children}
        </main>
      </div>

      <BottomTabs onMore={() => setMenuOpen(true)} />
    </ProtectedRoute>
  );
}