"use client";

import { motion } from "framer-motion";
import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "@/utils/theme";

const OPTIONS = [
  { id: "auto", label: "Same as device", icon: Monitor },
  { id: "light", label: "Light", icon: Sun },
  { id: "dark", label: "Dark", icon: Moon },
];

// A switch with all three choices visible. The dark pill slides to the one you pick.
export default function ThemeSwitch({ className = "" }) {
  const [theme, choose] = useTheme();

  return (
    <div
      role="group"
      aria-label="Colour theme"
      className={`inline-flex rounded-lg border border-line bg-surface p-0.5 ${className}`}
    >
      {OPTIONS.map((item) => {
        const Icon = item.icon;
        const active = theme === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => choose(item.id)}
            aria-pressed={active}
            aria-label={item.label}
            title={item.label}
            className={`relative flex size-8 items-center justify-center rounded-md transition-colors ${
              active ? "text-paper" : "text-muted hover:text-ink"
            }`}
          >
            {active && (
              <motion.span
                layoutId="theme-pill"
                className="absolute inset-0 rounded-md bg-ink"
                transition={{ type: "spring", stiffness: 500, damping: 36 }}
              />
            )}
            <Icon className="relative size-4" aria-hidden="true" />
          </button>
        );
      })}
    </div>
  );
}