"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { FEATURES } from "@/utils/features";

const TABS = [
  { id: "all", label: "Popular", hrefs: null },
  { id: "photo", label: "Edit a photo", hrefs: ["/editor", "/enhance", "/portrait", "/gallery"] },
  { id: "look", label: "Know your look", hrefs: ["/face-analysis", "/skin-tracker", "/assistant", "/trial-room"] },
];

// Every tool as a card, with tabs on top
export default function ToolGrid() {
  const [active, setActive] = useState("all");
  const tab = TABS.find((item) => item.id === active);
  const tools = tab.hrefs ? tab.hrefs.map((href) => FEATURES.find((tool) => tool.href === href)) : FEATURES;

  return (
    <div>
      <div role="tablist" aria-label="Tools" className="flex flex-wrap gap-2">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={active === item.id}
            aria-controls="tool-panel"
            onClick={() => setActive(item.id)}
            className={`rounded-full border px-4 py-2 text-sm transition-colors ${
              active === item.id ? "border-ink bg-ink text-paper" : "border-line hover:border-ink"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <ul id="tool-panel" role="tabpanel" className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {tools.map((tool) => {
          const Icon = tool.icon;
          const live = tool.status === "live";
          const base = "group/tool flex h-full items-start gap-4 rounded-2xl border border-line bg-surface p-4 transition duration-300";
          const body = (
            <>
              <span
                className={`grid size-12 shrink-0 place-items-center rounded-xl border border-line bg-paper transition-colors duration-300 ${
                  live ? "group-hover/tool:border-ink group-hover/tool:bg-ink group-hover/tool:text-paper" : "text-muted"
                }`}
              >
                <Icon className="size-6" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2 font-medium">
                  {tool.label}
                  {!live && <span className="rounded-full border border-line px-2 text-[11px] font-normal text-muted">Soon</span>}
                </span>
                <span className="mt-1 block text-[13px] leading-snug text-muted">{tool.summary}</span>
              </span>
              {live && (
                <ArrowUpRight
                  className="size-4 shrink-0 text-muted transition-all duration-300 group-hover/tool:-translate-y-0.5 group-hover/tool:translate-x-0.5 group-hover/tool:text-ink"
                  aria-hidden="true"
                />
              )}
            </>
          );
          return (
            <li key={tool.href}>
              {live ? (
                <Link href={tool.href} className={`${base} hover:-translate-y-0.5 hover:border-ink`}>
                  {body}
                </Link>
              ) : (
                <div className={`${base} opacity-70`}>{body}</div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}