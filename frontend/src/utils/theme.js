import { useSyncExternalStore } from "react";

// The light / dark choice. "auto" means: follow the device.
// It is saved in the browser, and shown on the <html> tag as data-theme.
const KEY = "stylescan-theme";
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

export function chooseTheme(value) {
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

// Returns [theme, chooseTheme]
export function useTheme() {
  const theme = useSyncExternalStore(subscribe, read, () => "auto");
  return [theme, chooseTheme];
}