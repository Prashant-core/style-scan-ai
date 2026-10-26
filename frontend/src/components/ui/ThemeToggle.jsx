"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "@/utils/theme";

const ORDER = ["auto", "light", "dark"];
const ICONS = { auto: Monitor, light: Sun, dark: Moon };
const NAMES = { auto: "Same as device", light: "Light", dark: "Dark" };

// One small button that goes through: same as device, light, dark.
export default function ThemeToggle({ className = "" }) {
  const [theme, choose] = useTheme();
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