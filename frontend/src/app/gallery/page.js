"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Download, PencilRuler, Trash2 } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import { GalleryIcon } from "@/components/ui/ToolIcons";
import PrivateImage from "@/components/features/PrivateImage";
import { api, fetchBlob } from "@/utils/api";
import { setHandoff } from "@/utils/handoff";
import { downloadBlob } from "@/utils/editor";
import { formatDate, friendlyError } from "@/utils/photo";

const SOURCES = { editor: "Photo editor", enhancer: "Photo enhancer", portrait: "Portrait tools" };

export default function GalleryPage() {
  const router = useRouter();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [confirming, setConfirming] = useState(null);
  const [busy, setBusy] = useState(null); // the item being downloaded or opened

  useEffect(() => {
    let active = true;
    api
      .get("/api/history?scan_type=edit")
      .then((data) => active && setItems(data))
      .catch((err) => active && setError(friendlyError(err, "We couldn't load your gallery.")))
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
      setError(friendlyError(err, "We couldn't delete this picture. Please try again."));
    }
  }

  async function handleDownload(item) {
    setBusy(item.id);
    setError("");
    try {
      downloadBlob(await fetchBlob(`/api/images/${item.image_id}`), `stylescan-${item.id.slice(0, 8)}.jpg`);
    } catch (err) {
      setError(friendlyError(err, "We couldn't download this picture."));
    } finally {
      setBusy(null);
    }
  }

  // Sends the saved picture back to the editor, to keep working on it
  async function handleEdit(item) {
    setBusy(item.id);
    setError("");
    try {
      const blob = await fetchBlob(`/api/images/${item.image_id}`);
      setHandoff(new File([blob], "gallery.jpg", { type: blob.type || "image/jpeg" }));
      router.push("/editor");
    } catch (err) {
      setError(friendlyError(err, "We couldn't open this picture."));
      setBusy(null);
    }
  }

  return (
    <>
      <title>My gallery | StyleScan AI</title>
      <AppShell
        wide
        title="My gallery"
        description="Pictures you saved from the editor, enhancer and portrait tools. Only you can see them, and you can delete any of them."
      >
        {error && <Alert className="mb-6">{error}</Alert>}

        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" aria-hidden="true">
            {[0, 1, 2, 3].map((n) => (
              <div key={n} className="aspect-[4/5] animate-pulse rounded-xl bg-line" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            icon={GalleryIcon}
            title="Nothing saved yet"
            actions={
              <>
                <Button href="/editor" variant="accent" pill>
                  Open the photo editor
                </Button>
                <Button href="/portrait" variant="outline" pill>
                  Portrait tools
                </Button>
              </>
            }
          >
            After you edit, enhance or retouch a photo, press <strong>Save to my gallery</strong>. It will appear here.
          </EmptyState>
        ) : (
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((item) => (
              <li key={item.id} className="overflow-hidden rounded-xl border border-line bg-surface">
                <PrivateImage
                  imageId={item.image_id}
                  alt={`Saved from ${SOURCES[item.metrics?.source] || "the editor"}`}
                  className="aspect-[4/5] w-full object-cover"
                />
                <div className="p-4">
                  <p className="font-semibold">{SOURCES[item.metrics?.source] || "Photo editor"}</p>
                  <p className="text-sm text-muted">{formatDate(item.created_at, true)}</p>

                  {confirming === item.id ? (
                    <div className="mt-3 flex gap-2">
                      <Button variant="danger" size="sm" onClick={() => handleDelete(item.id)}>
                        Delete
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setConfirming(null)}>
                        Keep
                      </Button>
                    </div>
                  ) : (
                    <div className="mt-3 flex flex-wrap gap-1">
                      <Button variant="ghost" size="sm" onClick={() => handleDownload(item)} disabled={busy === item.id}>
                        <Download className="size-4" aria-hidden="true" />
                        Download
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(item)} disabled={busy === item.id}>
                        <PencilRuler className="size-4" aria-hidden="true" />
                        Edit
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setConfirming(item.id)} aria-label="Delete this picture">
                        <Trash2 className="size-4" aria-hidden="true" />
                      </Button>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}

        <p className="mt-10 text-sm text-muted">
          Saved pictures are kept privately on our server. Read how we handle your photos on the{" "}
          <Link href="/privacy" className="underline underline-offset-4">
            privacy page
          </Link>
          .
        </p>
      </AppShell>
    </>
  );
}