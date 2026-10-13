"use client";

import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";

export default function SkinTrackerPage() {
  return (
    <>
      <title>Skin tracker | StyleScan AI</title>
      <AppShell title="Skin tracker" description="Scan your skin each day and see your progress.">
        <Card>
          <p className="text-muted">This tool is being built. It will be ready soon.</p>
        </Card>
      </AppShell>
    </>
  );
}