"use client";

import { useEffect } from "react";
import { startInstallWatch } from "@/utils/install";

// Sits in the page layout and does two things when the site opens:
// it starts listening for the "can be installed" message, and it registers the service worker.
// The service worker is only used on the real site (production), so it never gets in the way while you code.
export default function PwaRegister() {
  useEffect(() => {
    startInstallWatch();
    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {
        // Without it the site still works. It just has no offline page.
      });
    }
  }, []);

  return null;
}