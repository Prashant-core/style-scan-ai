"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import Card from "@/components/ui/Card";
import { useAuth } from "@/context/AuthContext";
import { FEATURES } from "@/utils/features";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function formatDate(value) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function ToolRow({ item }) {
  const Icon = item.icon;
  const live = item.status === "live";

  const content = (
    <>
      <Icon className="mt-1 size-6 shrink-0 text-ink" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <h3 className="font-display text-2xl font-semibold tracking-tight">{item.label}</h3>
        <p className="mt-1 text-muted">{item.summary}</p>
      </div>
      {live ? (
        <ArrowUpRight
          className="mt-1.5 size-5 shrink-0 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          aria-hidden="true"
        />
      ) : (
        <span className="mt-1.5 shrink-0 text-sm text-muted">Coming soon</span>
      )}
    </>
  );

  const rowStyle = "flex items-start gap-4 border-b border-line py-6 md:px-3";

  if (live) {
    return (
      <Link href={item.href} className={`group ${rowStyle} transition-colors hover:bg-surface`}>
        {content}
      </Link>
    );
  }
  return <div className={`${rowStyle} text-ink/80`}>{content}</div>;
}

export default function HomePage() {
  const { user } = useAuth();
  const firstName = user?.full_name?.split(" ")[0];

  return (
    <>
      <title>Home | StyleScan AI</title>
      <AppShell
        title={firstName ? `${getGreeting()}, ${firstName}.` : "Home"}
        description="Pick a tool to get started."
      >
        <div className="grid gap-12 lg:grid-cols-[1fr_300px]">
          <div className="border-t border-ink">
            {FEATURES.map((item) => (
              <ToolRow key={item.href} item={item} />
            ))}
          </div>

          <aside>
            <Card>
              <h2 className="font-display text-2xl font-semibold tracking-tight">Your account</h2>
              <dl className="mt-5 space-y-4 text-[15px]">
                <div>
                  <dt className="text-muted">Name</dt>
                  <dd className="font-medium">{user?.full_name}</dd>
                </div>
                <div>
                  <dt className="text-muted">Username</dt>
                  <dd className="font-medium">@{user?.username}</dd>
                </div>
                <div>
                  <dt className="text-muted">Email</dt>
                  <dd className="break-all font-medium">{user?.email}</dd>
                </div>
                <div>
                  <dt className="text-muted">Member since</dt>
                  <dd className="font-medium">{formatDate(user?.created_at)}</dd>
                </div>
              </dl>
            </Card>
          </aside>
        </div>
      </AppShell>
    </>
  );
}