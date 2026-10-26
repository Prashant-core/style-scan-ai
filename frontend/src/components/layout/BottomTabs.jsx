"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { EditorIcon, EnhanceIcon, GalleryIcon, HomeIcon } from "@/components/ui/ToolIcons";

const TABS = [
  { href: "/home", label: "Home", icon: HomeIcon },
  { href: "/editor", label: "Editor", icon: EditorIcon },
  { href: "/enhance", label: "Enhance", icon: EnhanceIcon },
  { href: "/gallery", label: "Gallery", icon: GalleryIcon },
];

// The row of buttons at the bottom of a phone or tablet screen
export default function BottomTabs({ onMore }) {
  const pathname = usePathname();
  const item = "flex flex-1 flex-col items-center gap-1 py-2 text-[11px] transition-colors";

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-30 flex border-t border-line bg-paper/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
    >
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const active = pathname === tab.href || pathname.startsWith(`${tab.href}/`);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={`${item} ${active ? "font-semibold text-ink" : "text-muted"}`}
          >
            <span className={`grid h-7 w-14 place-items-center rounded-full transition-colors ${active ? "bg-accent text-on-accent" : ""}`}>
              <Icon className="size-[20px]" />
            </span>
            {tab.label}
          </Link>
        );
      })}
      <button type="button" onClick={onMore} className={`${item} text-muted`}>
        <span className="grid h-7 w-14 place-items-center">
          <Menu className="size-[20px]" aria-hidden="true" />
        </span>
        More
      </button>
    </nav>
  );
}