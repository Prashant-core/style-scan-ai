// The service worker. It does two small jobs:
//   1. If the phone has no internet, it shows a friendly "You are offline" page instead of a browser error.
//   2. It keeps the site's pictures and code files (which never change) so they load faster the next time.
// It does NOT keep your pages, your photos or any data from your account, so nothing private is stored.
// When you change this file, change VERSION too, so old copies are cleared.

const VERSION = "v1";
const FILES = `stylescan-files-${VERSION}`;
const OFFLINE_PAGE = "/offline.html";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(FILES)
      .then((cache) => cache.add(OFFLINE_PAGE))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((names) => Promise.all(names.filter((name) => name !== FILES).map((name) => caches.delete(name))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  // Only handle our own site. Requests to the API server and the AI model downloads go straight through.
  if (url.origin !== self.location.origin) return;

  // Opening a page: use the internet, and show the offline page if there is none
  if (request.mode === "navigate") {
    event.respondWith(fetch(request).catch(() => caches.match(OFFLINE_PAGE)));
    return;
  }

  // Code files with a fingerprint in the name never change, so the saved copy is always right
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      caches.match(request).then(
        (saved) =>
          saved ||
          fetch(request).then((response) => {
            if (response.ok) {
              const copy = response.clone();
              caches.open(FILES).then((cache) => cache.put(request, copy));
            }
            return response;
          }),
      ),
    );
    return;
  }

  // Pictures and icons: show the saved copy straight away, and refresh it in the background
  if (url.pathname.startsWith("/wall/") || url.pathname.startsWith("/icons/") || url.pathname === "/logo.svg") {
    event.respondWith(
      caches.match(request).then((saved) => {
        const fresh = fetch(request)
          .then((response) => {
            if (response.ok) {
              const copy = response.clone();
              caches.open(FILES).then((cache) => cache.put(request, copy));
            }
            return response;
          })
          .catch(() => saved);
        return saved || fresh;
      }),
    );
  }
});