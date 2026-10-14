"use client";

import { useRef, useState } from "react";
import { Camera, ImagePlus } from "lucide-react";
import Button from "@/components/ui/Button";
import CameraCapture from "@/components/features/CameraCapture";
import { checkFile } from "@/utils/faceMeasure";

// Lets the user choose a photo, drag one in, or take one with the camera.
export default function UploadBox({ onSelect, disabled = false }) {
  const chooseRef = useRef(null);
  const cameraRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");
  const [cameraOpen, setCameraOpen] = useState(false);

  function handleFile(file) {
    if (!file) return;
    const problem = checkFile(file);
    setError(problem);
    if (!problem) onSelect(file);
  }

  function handleInput(event) {
    handleFile(event.target.files?.[0]);
    event.target.value = ""; // lets the user pick the same photo again
  }

  function handleDrop(event) {
    event.preventDefault();
    setDragging(false);
    if (!disabled) handleFile(event.dataTransfer.files?.[0]);
  }

  // Uses the live camera when the browser allows it, otherwise the phone's camera app
  function openCamera() {
    setError("");
    if (navigator.mediaDevices?.getUserMedia) {
      setCameraOpen(true);
    } else {
      cameraRef.current?.click();
    }
  }

  function handleCaptured(file) {
    setCameraOpen(false);
    handleFile(file);
  }

  return (
    <div>
      <div
        onDragOver={(event) => {
          event.preventDefault();
          if (!disabled) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`flex flex-col items-center rounded-xl border-2 border-dashed px-6 py-12 text-center transition-colors ${
          dragging ? "border-ink bg-tape/15" : "border-ink/25 bg-surface"
        }`}
      >
        <ImagePlus className="size-10 text-ink" aria-hidden="true" />
        <p className="mt-4 font-display text-3xl font-semibold tracking-tight">Add your photo</p>
        <p className="mt-2 max-w-xs text-muted">
          Drop a photo here, choose one from your device, or take one now. JPG, PNG or WebP, up to 10 MB.
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button onClick={() => chooseRef.current?.click()} disabled={disabled}>
            Choose a photo
          </Button>
          <Button variant="secondary" onClick={openCamera} disabled={disabled}>
            <Camera className="size-4" aria-hidden="true" />
            Use camera
          </Button>
        </div>

        <input
          ref={chooseRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleInput}
          className="sr-only"
          tabIndex={-1}
          aria-label="Choose a photo"
        />
        <input
          ref={cameraRef}
          type="file"
          accept="image/*"
          capture="user"
          onChange={handleInput}
          className="sr-only"
          tabIndex={-1}
          aria-label="Take a photo"
        />
      </div>

      {error && (
        <p role="alert" className="mt-3 text-sm text-danger">
          {error}
        </p>
      )}

      {cameraOpen && (
        <CameraCapture onCapture={handleCaptured} onClose={() => setCameraOpen(false)} />
      )}
    </div>
  );
}