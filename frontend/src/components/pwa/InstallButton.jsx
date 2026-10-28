"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { promptInstall, useInstall } from "@/utils/install";

// A button that installs StyleScan as an app.
// - Android Chrome / Edge: opens the real install question.
// - iPhone / iPad: shows how to use "Add to Home Screen", because Safari has no install button for sites.
// - Already installed, or the browser can't install: shows nothing, unless you pass "fallback".
export default function InstallButton({ className = "", children = "Install app", fallback = null }) {
  const { canInstall, installed, ios } = useInstall();
  const [hint, setHint] = useState(false);

  if (installed) return null;

  if (canInstall) {
    return (
      <button type="button" onClick={promptInstall} className={className}>
        <Download className="size-[18px] shrink-0" aria-hidden="true" />
        {children}
      </button>
    );
  }

  if (ios) {
    return (
      <>
        <button type="button" onClick={() => setHint((value) => !value)} aria-expanded={hint} className={className}>
          <Download className="size-[18px] shrink-0" aria-hidden="true" />
          {children}
        </button>
        {hint && (
          <p role="status" className="basis-full px-3 pb-2 text-sm text-muted">
            In Safari, tap the Share button, then “Add to Home Screen”.
          </p>
        )}
      </>
    );
  }

  return fallback;
}