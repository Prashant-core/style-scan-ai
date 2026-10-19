"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import PrivateImage from "@/components/features/PrivateImage";
import { api } from "@/utils/api";
import { formatDate, friendlyError } from "@/utils/photo";

const FILTERS = [
  { id: "all", label: "All" },
  { id: "face_analysis", label: "Face analysis" },
  { id: "trial_room", label: "Trial room" },
  { id: "skin_scan", label: "Skin scans" },
];

const LABELS = Object.fromEntries(FILTERS.map((f) => [f.id, f.label]));

// One short line that says what the saved item is
function describe(item) {
  const m = item.metrics;
  switch (item.scan_type) {
    case "face_analysis":
      return `${m.face_shape ? m.face_shape[0].toUpperCase() + m.face_shape.slice(1) : "Your"} face shape`;
    case "skin_scan":
      return `Skin score ${m.overall} / 100`;
    case "trial_room":
      return m.prompt;
    default:
      return "";
  }
}

export default function HistoryPage() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [confirming, setConfirming] = useState(null);

  useEffect(() => {
    let active = true;
    api
      .get("/api/history")
      .then((data) => active && setItems(data))
      .catch((err) => active && setError(friendlyError(err, "We couldn't load your history.")))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  async function handleDelete(id) {
    try {
      await api.delete(`/api/history/${id}`);
      setItems((current) => current.filter((item) => item.id !== id));
      setConfirming(null);
    } catch (err) {
      setError(friendlyError(err, "We couldn't delete this item. Try again."));
    }
  }

  const shown = filter === "all" ? items : items.filter((item) => item.scan_type === filter);

  return (
    <>
      <title>History | StyleScan AI</title>
      <AppShell title="History" description="Everything you have saved. You can delete any item at any time.">
        {error && <Alert className="mb-6">{error}</Alert>}

        <div className="mb-8 flex flex-wrap gap-2" role="tablist" aria-label="Filter history">
          {FILTERS.map((item) => (
            <button
              key={item.id}
              role="tab"
              aria-selected={filter === item.id}
              onClick={() => setFilter(item.id)}
              className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                filter === item.id ? "border-ink bg-ink text-white" : "border-line hover:border-ink"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="h-40 animate-pulse rounded-xl bg-line" aria-hidden="true" />
        ) : shown.length === 0 ? (
          <p className="text-muted">Nothing here yet.</p>
        ) : (
          <ul className="border-t border-ink">
            {shown.map((item) => (
              <li key={item.id} className="flex items-center gap-4 border-b border-line py-4">
                {item.image_id ? (
                  <PrivateImage
                    imageId={item.image_id}
                    alt={LABELS[item.scan_type]}
                    className="size-16 shrink-0 rounded-lg object-cover"
                  />
                ) : (
                  <div className="flex size-16 shrink-0 items-center justify-center rounded-lg bg-tape/25 text-center text-xs font-semibold">
                    {item.scan_type === "face_analysis" ? "Face" : "Scan"}
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{LABELS[item.scan_type]}</p>
                  <p className="truncate text-[15px] text-muted">{describe(item)}</p>
                  <p className="text-sm text-muted">{formatDate(item.created_at, true)}</p>
                </div>

                {confirming === item.id ? (
                  <div className="flex shrink-0 gap-2">
                    <Button variant="danger" size="sm" onClick={() => handleDelete(item.id)}>
                      Delete
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setConfirming(null)}>
                      Keep
                    </Button>
                  </div>
                ) : (
                  <Button variant="ghost" size="sm" onClick={() => setConfirming(item.id)}>
                    Delete
                  </Button>
                )}
              </li>
            ))}
          </ul>
        )}
      </AppShell>
    </>
  );
}