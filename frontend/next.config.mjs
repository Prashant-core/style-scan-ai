/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        // The browser must always ask for a fresh copy of the service worker, or updates would never arrive
        source: "/sw.js",
        headers: [
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Service-Worker-Allowed", value: "/" },
        ],
      },
    ];
  },
};

export default nextConfig;