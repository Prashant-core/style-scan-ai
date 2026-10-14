"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, X } from "lucide-react";
import Button from "@/components/ui/Button";

// Turns a camera error into a message a person can understand
function cameraMessage(error) {
  switch (error?.name) {
    case "NotAllowedError":
    case "SecurityError":
      return "Camera access is blocked. Allow the camera in your browser settings and try again.";
    case "NotFoundError":
    case "OverconstrainedError":
      return "We couldn't find a camera on this device.";
    case "NotReadableError":
      return "Your camera is being used by another app. Close it and try again.";
    default:
      return "We couldn't start the camera. Try again, or choose a photo instead.";
  }
}

// A pop-up with a live camera view. "onCapture" receives the photo as a File.
export default function CameraCapture({ onCapture, onClose }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function start() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 960 } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;
        const video = videoRef.current;
        if (video) {
          video.srcObject = stream;
          await video.play();
        }
      } catch (err) {
        if (!cancelled) setError(cameraMessage(err));
      }
    }

    start();

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((track) => track.stop()); // turns the camera light off
    };
  }, []);

  // Closes with the Escape key
  useEffect(() => {
    const onKey = (event) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function capture() {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height); // not mirrored

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setError("We couldn't take the photo. Please try again.");
          return;
        }
        onCapture(new File([blob], "camera-photo.jpg", { type: "image/jpeg" }));
      },
      "image/jpeg",
      0.92
    );
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Take a photo"
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 p-4"
    >
      <div className="w-full max-w-lg rounded-xl bg-paper p-4 shadow-xl">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-2xl font-semibold tracking-tight">Take a photo</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close the camera"
            className="rounded-full p-1.5 hover:bg-line"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>

        {error ? (
          <p role="alert" className="rounded-lg border border-danger/30 bg-danger-soft px-4 py-6 text-sm text-danger">
            {error}
          </p>
        ) : (
          <div className="relative overflow-hidden rounded-lg bg-ink">
            <video
              ref={videoRef}
              playsInline
              muted
              onPlaying={() => setReady(true)}
              className="aspect-[4/3] w-full -scale-x-100 object-cover"
            />
            {!ready && (
              <p className="absolute inset-0 flex items-center justify-center text-sm text-paper">
                Starting the camera...
              </p>
            )}
          </div>
        )}

        <p className="mt-3 text-sm text-muted">
          Look at the camera with your whole face in view. The photo is not uploaded.
        </p>

        <div className="mt-4 flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          {!error && (
            <Button onClick={capture} disabled={!ready}>
              <Camera className="size-4" aria-hidden="true" />
              Capture
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}