// The web app manifest. It tells Android (and desktop Chrome and Edge) that StyleScan can be installed
// like an app: its name, its icons, its colours, and that it opens full screen without the browser bar.
export default function manifest() {
  return {
    id: "/",
    name: "StyleScan AI",
    short_name: "StyleScan",
    description: "Edit, enhance and style your photos. Face shape, skin tracker and portrait tools that run on your device.",
    start_url: "/home",
    scope: "/",
    display: "standalone",
    orientation: "any",
    background_color: "#f4f3f0",
    theme_color: "#f4f3f0",
    categories: ["photo", "lifestyle", "productivity"],
    icons: [
      { src: "/icons/192", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/512", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/maskable", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Photo editor", url: "/editor", icons: [{ src: "/icons/192", sizes: "192x192", type: "image/png" }] },
      { name: "Photo enhancer", url: "/enhance", icons: [{ src: "/icons/192", sizes: "192x192", type: "image/png" }] },
      { name: "My gallery", url: "/gallery", icons: [{ src: "/icons/192", sizes: "192x192", type: "image/png" }] },
    ],
  };
}