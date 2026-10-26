import { useSyncExternalStore } from "react";

// Remembers if the left menu on a computer is shrunk to icons only. Saved in the browser.
const KEY = "stylescan-sidebar";
const listeners = new Set();

function read() {
  try {
    return localStorage.getItem(KEY) === "collapsed";
  } catch {
    return false;
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

function setCollapsed(value) {
  try {
    if (value) localStorage.setItem(KEY, "collapsed");
    else localStorage.removeItem(KEY);
  } catch {
    // Saving is a bonus. The menu still changes for this visit.
  }
  listeners.forEach((callback) => callback());
}

// Returns [collapsed, setCollapsed]
export function useSidebarCollapsed() {
  const collapsed = useSyncExternalStore(subscribe, read, () => false);
  return [collapsed, setCollapsed];
}