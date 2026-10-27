"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, History, LogOut, Menu, Search, Settings, ShieldCheck } from "lucide-react";
import Logo from "@/components/ui/Logo";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { useAuth } from "@/context/AuthContext";
import { FEATURES } from "@/utils/features";

// The search box. It finds tools by name and opens one with a click or Enter.
function ToolSearch({ className = "" }) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [open, setOpen] = useState(false);

  const query = text.trim().toLowerCase();
  const matches = query
    ? FEATURES.filter((tool) => `${tool.label} ${tool.summary}`.toLowerCase().includes(query)).filter(
        (tool) => tool.status === "live",
      )
    : [];

  function go(tool) {
    setText("");
    setOpen(false);
    router.push(tool.href);
  }

  return (
    <div className={`relative ${className}`}>
      <form
        role="search"
        onSubmit={(event) => {
          event.preventDefault();
          if (matches[0]) go(matches[0]);
        }}
        className="flex h-11 items-center gap-3 rounded-full border border-line bg-surface px-4 transition-colors focus-within:border-ink"
      >
        <Search className="size-[18px] shrink-0 text-muted" aria-hidden="true" />
        <input
          type="search"
          value={text}
          onChange={(event) => {
            setText(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder="Search for a tool"
          aria-label="Search for a tool"
          className="min-w-0 flex-1 bg-transparent text-[15px] text-ink outline-none placeholder:text-muted [&::-webkit-search-cancel-button]:hidden"
        />
      </form>

      {open && query && (
        <ul className="absolute inset-x-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-line bg-surface p-1.5 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.5)]">
          {matches.length === 0 && <li className="px-3 py-3 text-sm text-muted">No tool matches “{text.trim()}”.</li>}
          {matches.map((tool) => {
            const Icon = tool.icon;
            return (
              <li key={tool.href}>
                <button
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => go(tool)}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-ink/5"
                >
                  <Icon className="size-5 shrink-0" />
                  <span className="min-w-0">
                    <span className="block text-[15px] font-medium">{tool.label}</span>
                    <span className="block truncate text-[13px] text-muted">{tool.summary}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

// The round profile button and its menu
function ProfileMenu() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const box = useRef(null);

  // Close when you click outside or press Escape
  useEffect(() => {
    if (!open) return;
    const onClick = (event) => {
      if (box.current && !box.current.contains(event.target)) setOpen(false);
    };
    const onKey = (event) => event.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onClick);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function handleLogout() {
    logout();
    router.replace("/");
  }

  const row = "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] transition-colors hover:bg-ink/5";

  return (
    <div className="relative" ref={box}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label="Your account"
        className="flex items-center gap-1.5 rounded-full p-0.5 transition-opacity hover:opacity-80"
      >
        <span className="grid size-10 place-items-center rounded-full bg-ink text-[15px] font-semibold text-paper">
          {user?.full_name?.charAt(0).toUpperCase()}
        </span>
        <ChevronDown className={`hidden size-4 text-muted transition-transform sm:block ${open ? "rotate-180" : ""}`} aria-hidden="true" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.16 }}
            className="absolute right-0 top-full z-50 mt-2 w-72 rounded-2xl border border-line bg-surface p-2 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.5)]"
          >
            <div className="px-3 pb-3 pt-2">
              <p className="truncate font-medium">{user?.full_name}</p>
              <p className="truncate text-sm text-muted">@{user?.username}</p>
            </div>
            <div className="border-t border-line pt-1.5">
              <Link href="/settings" onClick={() => setOpen(false)} className={row}>
                <Settings className="size-[18px] text-muted" aria-hidden="true" /> Settings
              </Link>
              <Link href="/history" onClick={() => setOpen(false)} className={row}>
                <History className="size-[18px] text-muted" aria-hidden="true" /> History
              </Link>
              <Link href="/privacy" onClick={() => setOpen(false)} className={row}>
                <ShieldCheck className="size-[18px] text-muted" aria-hidden="true" /> Privacy
              </Link>
              <button type="button" onClick={handleLogout} className={`${row} w-full text-left`}>
                <LogOut className="size-[18px] text-muted" aria-hidden="true" /> Log out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// The bar at the top of every page after login.
// On a computer: search on the left, theme and profile on the right.
// On a phone: logo, theme, profile and a menu button.
export default function TopBar({ onMenu }) {
  return (
    <>
      <header className="sticky top-0 z-20 border-b border-line bg-paper/90 pt-[env(safe-area-inset-top)] backdrop-blur">
        <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-10">
          <Logo href="/home" className="lg:hidden" />
          <ToolSearch className="hidden max-w-xl flex-1 lg:block" />
          <div className="ml-auto flex items-center gap-1.5">
            <ThemeToggle />
            <ProfileMenu />
            <button
              type="button"
              onClick={onMenu}
              aria-label="Open menu"
              className="flex size-10 items-center justify-center rounded-lg text-ink transition-colors hover:bg-ink/5 lg:hidden"
            >
              <Menu className="size-5" />
            </button>
          </div>
        </div>
      </header>
      {/* On a phone the search box sits under the bar and scrolls away, so the bar stays small */}
      <div className="border-b border-line px-4 py-3 sm:px-6 lg:hidden">
        <ToolSearch />
      </div>
    </>
  );
}