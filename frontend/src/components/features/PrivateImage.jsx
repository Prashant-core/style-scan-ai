"use client";

import { useEffect, useState } from "react";
import { Download, ImageOff } from "lucide-react";
import { fetchBlob } from "@/utils/api";

// Shows a photo that belongs to the logged-in user. "downloadName" adds a download link.
export default function PrivateImage({ imageId, alt, className = "", downloadName }) {
  const [state, setState] = useState({ id: null, url: null, failed: false });

  useEffect(() => {
    let active = true;
    let objectUrl = null;

    fetchBlob(`/api/images/${imageId}`)
      .then((blob) => {
        if (!active) return;
        objectUrl = URL.createObjectURL(blob);
        setState({ id: imageId, url: objectUrl, failed: false });
      })
      .catch(() => {
        if (active) setState({ id: imageId, url: null, failed: true });
      });

    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [imageId]);

  const ready = state.id === imageId;

  if (ready && state.failed) {
    return (
      <div className={`flex items-center justify-center bg-line text-muted ${className}`}>
        <ImageOff className="size-6" aria-hidden="true" />
        <span className="sr-only">The photo could not be loaded</span>
      </div>
    );
  }

  if (!ready || !state.url) {
    return <div className={`animate-pulse bg-line ${className}`} aria-hidden="true" />;
  }

  return (
    <div className="relative">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={state.url} alt={alt} className={className} />
      {downloadName && (
        <a
          href={state.url}
          download={downloadName}
          className="mt-3 inline-flex items-center gap-2 text-sm font-medium underline-offset-4 hover:underline"
        >
          <Download className="size-4" aria-hidden="true" />
          Download
        </a>
      )}
    </div>
  );
}