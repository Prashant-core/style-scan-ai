"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Lock, Plus, X } from "lucide-react";
import Logo, { LogoMark } from "./Logo";
import { ACCOUNT_ITEMS, FEATURES, HOME_ITEM } from "@/utils/features";
import { useSidebarCollapsed } from "@/utils/sidebar";

function NavItem({ item, active, onNavigate, collapsed }) {
  const Icon = item.icon;
  const soon = item.status === "soon";
  const row = `group/tool relative flex items-center rounded-xl text-[15px] transition-colors ${
    collapsed ? "size-11 justify-center" : "gap-3 px-3 py-2.5"
  }`;

  const inner = (
    <>
      <Icon className="size-[20px] shrink-0 transition-transform duration-300 group-hover/tool:scale-110" aria-hidden="true" />
      {!collapsed && <span className="truncate">{item.label}</span>}
      {!collapsed && soon && (
        <span className="ml-auto rounded-full border border-line px-2 py-0.5 text-xs text-muted">Soon</span>
      )}
    </>
  );

  if (soon) {
    return (
      <div className={`${row} cursor-default text-muted/70`} aria-disabled="true" title={`${item.label} (soon)`}>
        {inner}
      </div>
    );
  }

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      aria-label={collapsed ? item.label : undefined}
      title={collapsed ? item.label : undefined}
      className={`${row} ${active ? "bg-tape-soft font-semibold text-ink" : "text-muted hover:bg-ink/5 hover:text-ink"}`}
    >
      {inner}
    </Link>
  );
}

// The content of the menu. "collapsed" shows icons only (computer only).
function SidebarBody({ collapsed = false, onNavigate, onClose, onToggle }) {
  const pathname = usePathname();
  const isActive = (href) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <div className={`flex h-full flex-col py-5 ${collapsed ? "items-center px-3" : "px-4"}`}>
      <div className={`flex w-full items-center ${collapsed ? "justify-center" : "justify-between px-2"}`}>
        {collapsed ? (
          <Link href="/home" aria-label="StyleScan home">
            <LogoMark className="size-8" />
          </Link>
        ) : (
          <Logo href="/home" />
        )}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="flex size-9 items-center justify-center rounded-lg text-ink transition-colors hover:bg-ink/5"
          >
            <X className="size-5" />
          </button>
        )}
      </div>

      {/* The main button, like "Start new design" */}
      <Link
        href="/editor"
        onClick={onNavigate}
        aria-label="Open a photo"
        title="Open a photo"
        className={`mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-accent font-medium text-on-accent transition hover:-translate-y-px hover:brightness-105 active:scale-[0.98] ${
          collapsed ? "size-11" : "h-12 w-full text-[15px]"
        }`}
      >
        <Plus className="size-5" aria-hidden="true" />
        {!collapsed && "Open a photo"}
      </Link>

      <nav className={`mt-6 flex w-full flex-1 flex-col gap-1 overflow-y-auto ${collapsed ? "items-center" : ""}`} aria-label="App">
        <NavItem item={HOME_ITEM} active={isActive(HOME_ITEM.href)} onNavigate={onNavigate} collapsed={collapsed} />
        {FEATURES.map((item) => (
          <NavItem key={item.href} item={item} active={isActive(item.href)} onNavigate={onNavigate} collapsed={collapsed} />
        ))}
        <div className={`my-3 border-t border-line ${collapsed ? "w-8" : "w-full"}`} />
        {ACCOUNT_ITEMS.map((item) => (
          <NavItem key={item.href} item={item} active={isActive(item.href)} onNavigate={onNavigate} collapsed={collapsed} />
        ))}
      </nav>

      {!collapsed && (
        <Link
          href="/privacy"
          onClick={onNavigate}
          className="mt-4 flex items-start gap-3 rounded-xl border border-line p-3 text-[13px] leading-snug text-muted transition-colors hover:border-ink"
        >
          <Lock className="mt-0.5 size-4 shrink-0 text-ink" aria-hidden="true" />
          <span>Your photos are private to your account. You can delete them any time.</span>
        </Link>
      )}

      {onToggle && (
        <button
          type="button"
          onClick={onToggle}
          aria-label={collapsed ? "Expand the menu" : "Shrink the menu"}
          title={collapsed ? "Expand the menu" : "Shrink the menu"}
          className="mt-4 flex size-9 items-center justify-center self-end rounded-full border border-line text-muted transition-colors hover:border-ink hover:text-ink"
        >
          {collapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
        </button>
      )}
    </div>
  );
}

export default function Sidebar({ open, onClose }) {
  const [collapsed, setCollapsed] = useSidebarCollapsed();

  // Close the phone menu with the Escape key
  useEffect(() => {
    if (!open) return;
    const onKey = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <>
      <aside
        className={`fixed inset-y-0 left-0 z-30 hidden border-r border-line bg-paper transition-[width] duration-300 lg:block ${
          collapsed ? "w-[76px]" : "w-64"
        }`}
      >
        <SidebarBody collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      </aside>

      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div
              className="absolute inset-0 bg-black/40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
            />
            <motion.aside
              className="absolute inset-y-0 left-0 w-72 max-w-[85%] border-r border-line bg-paper"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              <SidebarBody onNavigate={onClose} onClose={onClose} />
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}