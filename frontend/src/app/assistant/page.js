"use client";

import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";

export default function AssistantPage() {
  return (
    <>
      <title>Style assistant | StyleScan AI</title>
      <AppShell title="Style assistant" description="Ask questions and get answers based on your own results.">
        <Card>
          <p className="text-muted">This tool is being built. It will be ready soon.</p>
        </Card>
      </AppShell>
    </>
  );
}