"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { LogOut, X } from "lucide-react";
import Logo from "./Logo";
import ThemeToggle from "./ThemeToggle";
import { useAuth } from "@/context/AuthContext";
import { ACCOUNT_ITEMS, FEATURES, HOME_ITEM } from "@/utils/features";

const rowStyle = "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-[15px] transition-colors";

function NavItem({ item, active, onNavigate }) {
  const Icon = item.icon;

  if (item.status === "soon") {
    return (
      <div className={`${rowStyle} cursor-default text-muted/70`} aria-disabled="true">
        <Icon className="size-[18px]" aria-hidden="true" />
        <span>{item.label}</span>
        <span className="ml-auto rounded-full border border-line px-2 py-0.5 text-xs text-muted">
          Soon
        </span>
      </div>
    );
  }

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={`${rowStyle} ${
        active ? "bg-tape-soft font-semibold text-ink" : "text-muted hover:bg-ink/5 hover:text-ink"
      }`}
    >
      {active && (
        <span className="absolute inset-y-2 left-0 w-[3px] rounded-full bg-tape" aria-hidden="true" />
      )}
      <Icon className="size-[18px]" aria-hidden="true" />
      <span>{item.label}</span>
    </Link>
  );
}

function SidebarBody({ onNavigate, onClose }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const isActive = (href) => pathname === href || pathname.startsWith(`${href}/`);

  function handleLogout() {
    logout();
    onNavigate?.();
    router.replace("/");
  }

  return (
    <div className="flex h-full flex-col px-4 py-5">
      <div className="flex items-center justify-between px-2">
        <Logo href="/home" />
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

      <nav className="mt-8 flex flex-1 flex-col gap-1 overflow-y-auto" aria-label="App">
        <NavItem item={HOME_ITEM} active={isActive(HOME_ITEM.href)} onNavigate={onNavigate} />
        {FEATURES.map((item) => (
          <NavItem key={item.href} item={item} active={isActive(item.href)} onNavigate={onNavigate} />
        ))}

        <div className="my-3 border-t border-line" />

        {ACCOUNT_ITEMS.map((item) => (
          <NavItem key={item.href} item={item} active={isActive(item.href)} onNavigate={onNavigate} />
        ))}
      </nav>

      <div className="mt-4 flex items-center gap-3 border-t border-line px-2 pt-4">
        <div
          className="flex size-9 shrink-0 items-center justify-center rounded-full bg-ink text-sm font-semibold text-white"
          aria-hidden="true"
        >
          {user?.full_name?.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-ink">{user?.full_name}</p>
          <p className="truncate text-sm text-muted">@{user?.username}</p>
        </div>
        <ThemeToggle />
        <button
          type="button"
          onClick={handleLogout}
          aria-label="Log out"
          title="Log out"
          className="flex size-9 items-center justify-center rounded-lg text-muted transition-colors hover:bg-ink/5 hover:text-ink"
        >
          <LogOut className="size-[18px]" />
        </button>
      </div>
    </div>
  );
}

export default function Sidebar({ open, onClose }) {
  // Close the mobile menu with the Escape key
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
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-line bg-paper lg:block">
        <SidebarBody />
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