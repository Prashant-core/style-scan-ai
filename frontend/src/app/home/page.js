"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import PrivateImage from "@/components/features/PrivateImage";
import AppShell from "@/components/layout/AppShell";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/utils/api";
import { FEATURES } from "@/utils/features";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

// The tools are shown in two groups
const GROUPS = [
  { title: "Photo tools", hrefs: ["/editor", "/enhance", "/portrait", "/gallery"] },
  { title: "Know your look", hrefs: ["/face-analysis", "/skin-tracker", "/assistant", "/trial-room"] },
];

// Cards come in one after the other
const list = { hidden: {}, show: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } } };
const item = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
};

function ToolCard({ tool }) {
  const Icon = tool.icon;
  const live = tool.status === "live";

  const body = (
    <>
      <div className="flex items-start justify-between">
        <span
          className={`grid size-11 place-items-center rounded-lg border border-line bg-paper text-ink transition-colors duration-300 ${
            live ? "group-hover/tool:border-ink group-hover/tool:bg-ink group-hover/tool:text-paper" : "text-muted"
          }`}
        >
          <Icon className="size-[22px]" />
        </span>
        {live ? (
          <ArrowUpRight
            className="size-5 text-muted transition-all duration-300 group-hover/tool:-translate-y-0.5 group-hover/tool:translate-x-0.5 group-hover/tool:text-ink"
            aria-hidden="true"
          />
        ) : (
          <span className="rounded-full border border-line px-2 py-0.5 text-[11px] text-muted">Soon</span>
        )}
      </div>
      <div>
        <h3 className="font-display text-lg sm:text-xl">{tool.label}</h3>
        <p className="mt-1 text-[13px] leading-relaxed text-muted sm:text-[14px]">{tool.summary}</p>
      </div>
    </>
  );

  const base = "group/tool flex h-full flex-col justify-between gap-5 rounded-xl border border-line bg-surface p-4 sm:gap-6 sm:p-5";

  return (
    <motion.li variants={item}>
      {live ? (
        <Link
          href={tool.href}
          className={`${base} transition duration-300 hover:-translate-y-0.5 hover:border-ink hover:shadow-[0_12px_30px_-18px_rgba(0,0,0,0.35)]`}
        >
          {body}
        </Link>
      ) : (
        <div className={`${base} opacity-70`}>{body}</div>
      )}
    </motion.li>
  );
}

export default function HomePage() {
  const { user } = useAuth();
  const reduce = useReducedMotion();
  const firstName = user?.full_name?.split(" ")[0];
  const [tip, setTip] = useState(null);
  const [recent, setRecent] = useState([]); // the latest saved edits

  // The daily tip is a bonus. If it cannot load, the page works without it.
  useEffect(() => {
    api
      .get("/api/tips/today")
      .then((data) => setTip(data.tip))
      .catch(() => setTip(null));
  }, []);

  // Also a bonus. Without it, the "Recent edits" box is simply not shown.
  useEffect(() => {
    let active = true;
    api
      .get("/api/history?scan_type=edit")
      .then((data) => active && setRecent(data.slice(0, 4)))
      .catch(() => active && setRecent([]));
    return () => {
      active = false;
    };
  }, []);

  return (
    <>
      <title>Home | StyleScan AI</title>
      <AppShell
        wide
        title={firstName ? `${getGreeting()}, ${firstName}.` : "Home"}
        description="Pick a tool to get started."
      >
        <div className="space-y-12">
          {GROUPS.map((group) => (
            <section key={group.title} aria-labelledby={`group-${group.hrefs[0].slice(1)}`}>
              <h2
                id={`group-${group.hrefs[0].slice(1)}`}
                className="mb-4 font-mono text-[11px] uppercase tracking-[0.08em] text-muted"
              >
                {group.title}
              </h2>
              <motion.ul
                className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4"
                variants={list}
                initial={reduce ? "show" : "hidden"}
                animate="show"
              >
                {group.hrefs.map((href) => (
                  <ToolCard key={href} tool={FEATURES.find((tool) => tool.href === href)} />
                ))}
              </motion.ul>
            </section>
          ))}

          {(tip || recent.length > 0) && (
            <motion.section
              className={`grid gap-4 ${tip && recent.length > 0 ? "lg:grid-cols-[1.2fr_1fr]" : ""}`}
              initial={reduce ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              {tip && (
                <div className="rounded-xl border border-line bg-surface p-6">
                  <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-muted">Tip of the day</p>
                  <p className="mt-3 max-w-xl font-display text-2xl leading-snug">{tip}</p>
                </div>
              )}
              {recent.length > 0 && (
                <div className="rounded-xl border border-line bg-surface p-6">
                  <div className="flex items-baseline justify-between">
                    <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-muted">Recent edits</p>
                    <Link href="/gallery" className="text-sm underline decoration-line underline-offset-4 hover:decoration-ink">
                      Open gallery
                    </Link>
                  </div>
                  <ul className="mt-4 grid grid-cols-4 gap-2">
                    {recent.map((edit) => (
                      <li key={edit.id}>
                        <Link href="/gallery" aria-label="Open your gallery" className="block overflow-hidden rounded-lg">
                          <PrivateImage
                            imageId={edit.image_id}
                            alt="A saved edit"
                            className="aspect-square w-full object-cover transition-transform duration-500 hover:scale-105"
                          />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.section>
          )}
        </div>
      </AppShell>
    </>
  );
}