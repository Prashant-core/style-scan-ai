import { useSyncExternalStore } from "react";

// Keeps track of whether this site can be installed as an app.
// Android Chrome sends a "beforeinstallprompt" message once. We keep it, so an Install button can use it later.
// iPhones do not send it, so there we show a short how-to instead.
const SERVER = { canInstall: false, installed: false, ios: false };
let state = SERVER;
let deferred = null;
let started = false;
const listeners = new Set();

function update(patch) {
  state = { ...state, ...patch };
  listeners.forEach((callback) => callback());
}

function isStandalone() {
  return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
}

// Called once, when the site opens
export function startInstallWatch() {
  if (started || typeof window === "undefined") return;
  started = true;

  const ios = /iphone|ipad|ipod/i.test(window.navigator.userAgent);
  update({ installed: isStandalone(), ios });

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferred = event;
    update({ canInstall: true });
  });
  window.addEventListener("appinstalled", () => {
    deferred = null;
    update({ canInstall: false, installed: true });
  });
}

export async function promptInstall() {
  if (!deferred) return;
  deferred.prompt();
  await deferred.userChoice;
  deferred = null;
  update({ canInstall: false });
}

function subscribe(callback) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

// Returns { canInstall, installed, ios }
export function useInstall() {
  return useSyncExternalStore(subscribe, () => state, () => SERVER);
}