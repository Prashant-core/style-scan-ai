"use client";

import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";

export default function TrialRoomPage() {
  return (
    <>
      <title>Trial room | StyleScan AI</title>
      <AppShell title="Trial room" description="Try a new look on your own photo before you buy.">
        <Card>
          <p className="text-muted">This tool is being built. It will be ready soon.</p>
        </Card>
      </AppShell>
    </>
  );
}