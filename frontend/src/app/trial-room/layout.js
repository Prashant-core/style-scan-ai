import { Shirt } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";
import { FEATURES } from "@/utils/features";

// While the Trial room is marked "soon" in utils/features.js, this page shows a short note
// instead of the tool. Set its status to "live" there and the real page appears again.
export default function TrialRoomLayout({ children }) {
  const live = FEATURES.find((item) => item.href === "/trial-room")?.status === "live";
  if (live) return children;

  return (
    <>
      <title>Trial room | StyleScan AI</title>
      <AppShell title="Trial room" description="See yourself in a new look before you decide.">
        <Card className="max-w-xl p-8">
          <Shirt className="size-8" aria-hidden="true" />
          <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight">Coming soon</h2>
          <p className="mt-2 text-muted">
            The Trial room needs a paid image AI, so it is switched off for now. In the meantime, try the photo
            editor, the photo enhancer or the portrait tools.
          </p>
        </Card>
      </AppShell>
    </>
  );
}