"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Aperture, Crop, Lightbulb, Maximize2, ScanFace, Sparkles, Type } from "lucide-react";
import ToolGrid from "@/components/dashboard/ToolGrid";
import PrivateImage from "@/components/features/PrivateImage";
import Carousel from "@/components/home/Carousel";
import MediaCard from "@/components/home/MediaCard";
import { WALL_ITEMS, PhotoTile } from "@/components/home/PhotoWall";
import AppShell from "@/components/layout/AppShell";
import Button from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/utils/api";

const W = "/wall/";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

// The big cards at the top
const FEATURED = [
  { href: "/editor", title: "Fix the light in one tap", tag: "Auto-fix", before: W + "autofix-before.jpg", after: W + "autofix-after.jpg" },
  { href: "/enhance", title: "Make a small photo sharp and twice as big", tag: "Enhancer", before: W + "enhance-before.jpg", after: W + "enhance-after.jpg" },
  { href: "/portrait", title: "Blur or remove the background", tag: "Portrait", before: W + "blur-before.jpg", after: W + "blur-after.jpg" },
  { href: "/face-analysis", title: "Find your face shape", tag: "Face analysis", after: W + "face-shape.jpg" },
];

// Small round-cornered shortcuts
const QUICK = [
  { href: "/editor", label: "Crop a photo", icon: Crop },
  { href: "/editor", label: "Add text", icon: Type },
  { href: "/editor", label: "Fix the light", icon: Sparkles },
  { href: "/portrait", label: "Blur the background", icon: Aperture },
  { href: "/enhance", label: "Make it bigger", icon: Maximize2 },
  { href: "/face-analysis", label: "Find my face shape", icon: ScanFace },
];

export default function HomePage() {
  const { user } = useAuth();
  const firstName = user?.full_name?.split(" ")[0];
  const [tip, setTip] = useState(null);
  const [recent, setRecent] = useState(null); // null while loading, then a list

  // The daily tip is a bonus. If it cannot load, the page works without it.
  useEffect(() => {
    let active = true;
    api
      .get("/api/tips/today")
      .then((data) => active && setTip(data.tip))
      .catch(() => active && setTip(null));
    return () => {
      active = false;
    };
  }, []);

  // Also a bonus. If it fails, the box shows the empty message.
  useEffect(() => {
    let active = true;
    api
      .get("/api/history?scan_type=edit")
      .then((data) => active && setRecent(data.slice(0, 6)))
      .catch(() => active && setRecent([]));
    return () => {
      active = false;
    };
  }, []);

  return (
    <>
      <title>Home | StyleScan AI</title>
      <AppShell bare>
        <div className="space-y-12 lg:space-y-14">
          <section aria-labelledby="featured-title">
            <h1 id="featured-title" className="mb-4 font-display text-3xl sm:text-4xl">
              {firstName ? `${getGreeting()}, ${firstName}.` : "Welcome back."}
            </h1>
            <Carousel label="Try these first">
              {FEATURED.map((card) => (
                <MediaCard key={card.title} {...card} size="w-[290px] aspect-[16/10] sm:w-[400px] xl:w-[460px]" />
              ))}
            </Carousel>
          </section>

          <section aria-labelledby="quick-title">
            <h2 id="quick-title" className="mb-4 font-display text-2xl sm:text-3xl">
              Quick starts
            </h2>
            <ul className="flex flex-wrap gap-2.5">
              {QUICK.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="group/chip inline-flex items-center gap-2.5 rounded-full border border-line bg-surface py-2.5 pl-3.5 pr-5 text-[15px] font-medium transition hover:-translate-y-0.5 hover:border-ink"
                    >
                      <Icon className="size-[18px] transition-transform duration-300 group-hover/chip:scale-110" aria-hidden="true" />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>

          <section aria-labelledby="tools-title">
            <h2 id="tools-title" className="mb-4 font-display text-2xl sm:text-3xl">
              All tools
            </h2>
            <ToolGrid />
          </section>

          <section aria-labelledby="recent-title" className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
            <div className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
              <div className="flex items-baseline justify-between gap-4">
                <h2 id="recent-title" className="font-display text-2xl">
                  Recent edits
                </h2>
                <Link href="/gallery" className="text-sm font-medium underline decoration-line underline-offset-4 hover:decoration-ink">
                  Open gallery
                </Link>
              </div>

              {recent === null && (
                <div className="mt-5 grid grid-cols-3 gap-2 sm:grid-cols-6" aria-hidden="true">
                  {[0, 1, 2, 3, 4, 5].map((n) => (
                    <div key={n} className="aspect-square animate-pulse rounded-lg bg-line" />
                  ))}
                </div>
              )}

              {recent && recent.length > 0 && (
                <ul className="mt-5 grid grid-cols-3 gap-2 sm:grid-cols-6">
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
              )}

              {recent && recent.length === 0 && (
                <div className="mt-5 flex flex-col items-start gap-4 rounded-xl border border-dashed border-line p-6">
                  <p className="text-[15px] text-muted">No saved edits yet. Open a photo, edit it and press Save to see it here.</p>
                  <Button href="/editor" variant="accent" pill size="sm">
                    Open a photo
                  </Button>
                </div>
              )}
            </div>

            {tip && (
              <div className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
                <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.08em] text-muted">
                  <Lightbulb className="size-4" aria-hidden="true" /> Tip of the day
                </p>
                <p className="mt-4 font-display text-2xl leading-snug">{tip}</p>
              </div>
            )}
          </section>

          <section aria-labelledby="wall-title">
            <h2 id="wall-title" className="mb-4 font-display text-2xl sm:text-3xl">
              See what the tools can do
            </h2>
            <div className="pw-wall">
              {WALL_ITEMS.map((item) => (
                <PhotoTile key={item.title} item={item} />
              ))}
            </div>
          </section>
        </div>
      </AppShell>
    </>
  );
}