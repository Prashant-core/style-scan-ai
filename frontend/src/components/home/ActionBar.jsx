"use client";

import Link from "next/link";
import { ArrowUp, Sparkles } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

// A bar that floats at the bottom of the home page. It takes you straight to the photo editor.
export default function ActionBar() {
  const { user } = useAuth();

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 flex justify-center px-4 pb-[max(16px,env(safe-area-inset-bottom))]">
      <Link
        href={user ? "/editor" : "/signup"}
        className="group pointer-events-auto flex w-full max-w-2xl items-center gap-3 rounded-full border border-line bg-surface/90 py-2 pl-5 pr-2 shadow-[0_10px_40px_-12px_rgba(0,0,0,0.5)] backdrop-blur transition hover:border-ink"
      >
        <Sparkles className="size-5 shrink-0 text-muted transition-colors group-hover:text-ink" aria-hidden="true" />
        <span className="min-w-0 flex-1 truncate text-[15px] text-muted">
          {user ? "Open a photo to start editing..." : "Create a free account to start editing..."}
        </span>
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-accent text-on-accent transition-transform group-hover:-translate-y-0.5">
          <ArrowUp className="size-5" aria-hidden="true" />
        </span>
      </Link>
    </div>
  );
}