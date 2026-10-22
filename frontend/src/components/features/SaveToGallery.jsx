"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, FolderHeart } from "lucide-react";
import Button from "@/components/ui/Button";
import { api } from "@/utils/api";
import { friendlyError } from "@/utils/photo";

// "Save to my gallery". The picture is made in the browser first, then sent to the person's private gallery.
//   getBlob - async function that returns the picture to save (a Blob), or null if it could not be made
//   source  - which tool made it: "editor", "enhancer" or "portrait"
export default function SaveToGallery({ getBlob, source, className = "" }) {
  const [state, setState] = useState("idle"); // idle, saving or saved
  const [error, setError] = useState("");

  async function save() {
    setState("saving");
    setError("");
    try {
      const blob = await getBlob();
      if (!blob) throw new Error("no picture");
      const form = new FormData();
      form.append("photo", blob, blob.type === "image/png" ? "edit.png" : "edit.jpg");
      form.append("source", source);
      await api.post("/api/gallery", form);
      setState("saved");
    } catch (err) {
      setError(friendlyError(err, "We couldn't save it to your gallery. Please try again."));
      setState("idle");
    }
  }

  return (
    <div className={className}>
      {state === "saved" ? (
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm" role="status">
          <span className="inline-flex items-center gap-1.5 font-medium">
            <Check className="size-4" aria-hidden="true" />
            Saved to your gallery
          </span>
          <Link href="/gallery" className="underline underline-offset-4">
            View gallery
          </Link>
          <button type="button" onClick={save} className="text-muted underline underline-offset-4">
            Save again
          </button>
        </p>
      ) : (
        <Button variant="secondary" className="w-full" onClick={save} loading={state === "saving"}>
          <FolderHeart className="size-4" aria-hidden="true" />
          {state === "saving" ? "Saving..." : "Save to my gallery"}
        </Button>
      )}
      {error && (
        <p className="mt-2 text-sm text-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}