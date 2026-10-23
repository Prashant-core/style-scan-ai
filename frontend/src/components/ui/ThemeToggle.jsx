"use client";

import { useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Monitor, Moon, Sun } from "lucide-react";

const KEY = "stylescan-theme";
const ORDER = ["auto", "light", "dark"];
const ICONS = { auto: Monitor, light: Sun, dark: Moon };
const NAMES = { auto: "Same as device", light: "Light", dark: "Dark" };

const listeners = new Set();

function read() {
  try {
    const saved = localStorage.getItem(KEY);
    return saved === "light" || saved === "dark" ? saved : "auto";
  } catch {
    return "auto";
  }
}

function subscribe(callback) {
  listeners.add(callback);
  window.addEventListener("storage", callback);
  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", callback);
  };
}

function choose(value) {
  try {
    if (value === "auto") localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, value);
  } catch {
    // Saving is a bonus. The theme still changes for this visit.
  }
  if (value === "auto") document.documentElement.removeAttribute("data-theme");
  else document.documentElement.setAttribute("data-theme", value);
  listeners.forEach((callback) => callback());
}

// One button that goes through: same as device, light, dark.
export default function ThemeToggle({ className = "" }) {
  const theme = useSyncExternalStore(subscribe, read, () => "auto");
  const Icon = ICONS[theme];
  const next = ORDER[(ORDER.indexOf(theme) + 1) % ORDER.length];

  return (
    <button
      type="button"
      onClick={() => choose(next)}
      aria-label={`Theme: ${NAMES[theme]}. Switch to ${NAMES[next]}.`}
      title={`Theme: ${NAMES[theme]}`}
      className={`flex size-9 items-center justify-center rounded-lg text-muted transition-colors hover:bg-ink/5 hover:text-ink ${className}`}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={theme}
          initial={{ opacity: 0, rotate: -60, scale: 0.7 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          exit={{ opacity: 0, rotate: 60, scale: 0.7 }}
          transition={{ duration: 0.18 }}
          className="flex"
        >
          <Icon className="size-[18px]" aria-hidden="true" />
        </motion.span>
      </AnimatePresence>
    </button>
  );
}