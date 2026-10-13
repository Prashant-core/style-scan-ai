"use client";

import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";

export default function FaceAnalysisPage() {
  return (
    <>
      <title>Face analysis | StyleScan AI</title>
      <AppShell title="Face analysis" description="Find your face shape and the styles that suit it.">
        <Card>
          <p className="text-muted">This tool is being built. It will be ready soon.</p>
        </Card>
      </AppShell>
    </>
  );
}