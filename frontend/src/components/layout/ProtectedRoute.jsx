"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

// Shows the page only to logged-in users. Everyone else goes to the login page.
export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="grid min-h-screen place-items-center" role="status">
        <Loader2 className="size-6 animate-spin text-muted" aria-hidden="true" />
        <span className="sr-only">Loading</span>
      </div>
    );
  }

  return children;
}