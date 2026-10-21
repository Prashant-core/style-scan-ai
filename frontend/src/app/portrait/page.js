"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Download, Eye, ImagePlus, PencilRuler, Sparkles } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import UploadBox from "@/components/features/UploadBox";
import Slider from "@/components/editor/Slider";
import { downloadBlob, loadPhoto } from "@/utils/editor";
import { scaledCopy } from "@/utils/enhance";
import { setHandoff } from "@/utils/handoff";
import { friendlyError } from "@/utils/photo";
import { coverFit, coverage, hexToRgb, renderPortrait, resizePlane } from "@/utils/portrait";
import { segmentPortrait } from "@/utils/segment";
import { FaceError } from "@/utils/faceMeasure";

const WORK_SIDE = 2048; // the biggest size we work and save at
const PREVIEW_SIDE = 1000; // the size used on screen, so the sliders feel instant

const TABS = [
  { id: "background", label: "Background", icon: ImagePlus },
  { id: "retouch", label: "Retouch", icon: Sparkles },
];

const MODES = [
  { id: "original", label: "Original" },
  { id: "blur", label: "Blur" },
  { id: "colour", label: "Colour" },
  { id: "image", label: "Image" },
  { id: "transparent", label: "Remove" },
];

const SWATCHES = ["#ffffff", "#e9e7e2", "#cfe3ff", "#ffd9d2", "#0f1a2a", "#1f7a4d"];

const DEFAULT_SETTINGS = { mode: "original", blur: 60, colour: "#ffffff", feather: 30, smooth: 0, even: 0 };

const CHECKERS = {
  backgroundColor: "#ffffff",
  backgroundImage:
    "linear-gradient(45deg,#d8d8d8 25%,transparent 25%,transparent 75%,#d8d8d8 75%),linear-gradient(45deg,#d8d8d8 25%,transparent 25%,transparent 75%,#d8d8d8 75%)",
  backgroundSize: "16px 16px",
  backgroundPosition: "0 0, 8px 8px",
};

// Everything the renderer needs, for one size. Used for the screen and again for saving.
function buildScene(work, masks, side) {
  const shrink = Math.min(1, side / Math.max(work.width, work.height));
  const width = Math.max(1, Math.round(work.width * shrink));
  const height = Math.max(1, Math.round(work.height * shrink));
  const canvas = shrink < 1 ? scaledCopy(work, width, height) : work;
  const data = canvas.getContext("2d").getImageData(0, 0, width, height);
  return {
    width,
    height,
    image: { data: data.data, width, height },
    person: resizePlane(masks.person, masks.width, masks.height, width, height),
    skin: resizePlane(masks.skin, masks.width, masks.height, width, height),
  };
}

function renderSettings(settings) {
  return { ...settings, colour: hexToRgb(settings.colour) };
}

function backdropFor(backdrop, scene) {
  if (!backdrop || !scene) return null;
  const canvas = coverFit(backdrop, scene.width, scene.height);
  return { data: canvas.getContext("2d").getImageData(0, 0, scene.width, scene.height).data };
}

export default function PortraitPage() {
  const router = useRouter();

  const [work, setWork] = useState(null); // the photo, at working size
  const [masks, setMasks] = useState(null); // where the person and skin are
  const [scene, setScene] = useState(null); // the same, at screen size
  const [stage, setStage] = useState("idle"); // idle, analysing or ready
  const [tab, setTab] = useState("background");
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [backdrop, setBackdrop] = useState(null); // the picture chosen for "Image"
  const [peek, setPeek] = useState(false);
  const [format, setFormat] = useState("jpeg");
  const [saving, setSaving] = useState(false);
  const [opening, setOpening] = useState(false);
  const [error, setError] = useState("");

  const canvasRef = useRef(null);

  const change = (patch) => setSettings((current) => ({ ...current, ...patch }));
  const transparent = settings.mode === "transparent";
  const backdropData = useMemo(() => backdropFor(backdrop, scene), [backdrop, scene]);

  // Draws the portrait each time something changes
  useEffect(() => {
    if (!scene || !canvasRef.current) return;
    const frame = requestAnimationFrame(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = scene.width;
      canvas.height = scene.height;
      const shown = peek ? { ...DEFAULT_SETTINGS } : settings;
      const pixels = renderPortrait({
        image: scene.image,
        person: scene.person,
        skin: scene.skin,
        backdrop: backdropData,
        settings: renderSettings(shown),
      });
      canvas.getContext("2d").putImageData(new ImageData(pixels, scene.width, scene.height), 0, 0);
    });
    return () => cancelAnimationFrame(frame);
  }, [scene, settings, peek, backdropData]);

  async function handleSelect(file) {
    setError("");
    setStage("analysing");
    try {
      const opened = await loadPhoto(file);
      const canvas = scaledCopy(opened.full, ...fit(opened.full, WORK_SIDE));
      const found = await segmentPortrait(canvas);
      if (coverage(found.person) < 0.02) {
        throw new FaceError("We couldn't find a person in this photo. Please try a photo where you are clearly visible.");
      }
      setWork(canvas);
      setMasks(found);
      setScene(buildScene(canvas, found, PREVIEW_SIDE));
      setSettings(DEFAULT_SETTINGS);
      setBackdrop(null);
      setTab("background");
      setStage("ready");
    } catch (err) {
      setError(friendlyError(err, "We couldn't open that photo. Please try another one."));
      setStage("idle");
    }
  }

  async function chooseBackdrop(file) {
    if (!file) return;
    setError("");
    try {
      const opened = await loadPhoto(file);
      setBackdrop(opened.preview);
      change({ mode: "image" });
    } catch (err) {
      setError(friendlyError(err, "We couldn't open that image. Please try another one."));
    }
  }

  function startOver() {
    setWork(null);
    setMasks(null);
    setScene(null);
    setStage("idle");
    setError("");
  }

  // Makes the full-size result as a file
  async function makeFile(type, quality) {
    const full = buildScene(work, masks, WORK_SIDE);
    const pixels = renderPortrait({
      image: full.image,
      person: full.person,
      skin: full.skin,
      backdrop: backdropFor(backdrop, full),
      settings: renderSettings(settings),
    });
    const canvas = document.createElement("canvas");
    canvas.width = full.width;
    canvas.height = full.height;
    canvas.getContext("2d").putImageData(new ImageData(pixels, full.width, full.height), 0, 0);
    return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
  }

  // A see-through result can only be saved as PNG
  const fileType = transparent || format === "png" ? "png" : "jpeg";

  async function handleDownload() {
    setSaving(true);
    setError("");
    const blob = await makeFile(`image/${fileType}`, 0.95);
    setSaving(false);
    if (!blob) {
      setError("We couldn't save the photo. Please try again.");
      return;
    }
    downloadBlob(blob, `stylescan-portrait.${fileType === "png" ? "png" : "jpg"}`);
  }

  async function openInEditor() {
    setOpening(true);
    setError("");
    const blob = await makeFile(`image/${fileType}`, 0.97);
    if (!blob) {
      setOpening(false);
      setError("We couldn't open the photo in the editor. Please download it instead.");
      return;
    }
    setHandoff(new File([blob], `portrait.${fileType === "png" ? "png" : "jpg"}`, { type: blob.type }));
    router.push("/editor");
  }

  const changed = JSON.stringify(settings) !== JSON.stringify(DEFAULT_SETTINGS);

  return (
    <>
      <title>Portrait tools | StyleScan AI</title>
      <AppShell
        wide
        title="Portrait tools"
        description="Blur, change or remove the background, and gently smooth skin. It all runs in your browser, so your photo never leaves your device."
      >
        {error && <Alert className="mb-6">{error}</Alert>}

        {stage !== "ready" ? (
          <div className="mx-auto max-w-2xl">
            {stage === "analysing" ? (
              <Card className="py-16 text-center" role="status" aria-live="polite">
                <p className="font-display text-3xl font-semibold tracking-tight">Finding you in the photo...</p>
                <p className="mx-auto mt-2 max-w-sm text-muted">
                  The first time, a small AI model is downloaded. It is kept in your browser after that.
                </p>
              </Card>
            ) : (
              <UploadBox onSelect={handleSelect} />
            )}
            <p className="mt-4 text-sm text-muted">
              Works best with one person, clearly visible, in a photo from the chest up.
            </p>
          </div>
        ) : (
          <div className="grid items-start gap-x-6 gap-y-4 lg:grid-cols-[minmax(0,1fr)_360px]">
            {/* The photo. On a phone it stays at the top while you move the sliders below it. */}
            <div className="sticky top-14 z-10 -mx-5 bg-paper px-5 pb-2 lg:static lg:mx-0 lg:p-0">
              <div className="flex items-center justify-center rounded-xl border border-line bg-surface p-2 sm:p-5 lg:min-h-[300px]">
                <canvas
                  ref={canvasRef}
                  role="img"
                  aria-label="Your portrait with the changes applied"
                  className="block h-auto max-h-[36vh] w-auto max-w-full rounded-md sm:max-h-[50vh] lg:max-h-[68vh]"
                  style={transparent && !peek ? CHECKERS : undefined}
                />
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onPointerDown={() => setPeek(true)}
                  onPointerUp={() => setPeek(false)}
                  onPointerLeave={() => setPeek(false)}
                  onPointerCancel={() => setPeek(false)}
                  onKeyDown={(event) => (event.key === " " || event.key === "Enter") && setPeek(true)}
                  onKeyUp={() => setPeek(false)}
                  onBlur={() => setPeek(false)}
                  aria-label="Hold to see the original"
                >
                  <Eye className="size-4" aria-hidden="true" />
                  Hold to compare
                </Button>
                <Button variant="ghost" size="sm" disabled={!changed} onClick={() => setSettings(DEFAULT_SETTINGS)}>
                  Reset all
                </Button>
                <Button variant="ghost" size="sm" onClick={startOver} className="sm:ml-auto">
                  New photo
                </Button>
              </div>
            </div>

            {/* The tools */}
            <aside className="space-y-6">
              <Card className="p-5">
                <div role="tablist" aria-label="Portrait tools" className="grid grid-cols-2 gap-1 rounded-lg bg-paper p-1">
                  {TABS.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        role="tab"
                        aria-selected={tab === item.id}
                        onClick={() => setTab(item.id)}
                        className={`flex flex-col items-center gap-1 rounded-md py-2 text-xs font-medium transition-colors ${
                          tab === item.id ? "bg-surface text-ink shadow-sm" : "text-muted hover:text-ink"
                        }`}
                      >
                        <Icon className="size-[18px]" aria-hidden="true" />
                        {item.label}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-5 space-y-5" role="tabpanel">
                  {tab === "background" && (
                    <>
                      <div className="flex flex-wrap gap-2" role="group" aria-label="Background style">
                        {MODES.map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            aria-pressed={settings.mode === item.id}
                            onClick={() => change({ mode: item.id })}
                            className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                              settings.mode === item.id ? "border-ink bg-ink text-white" : "border-line hover:border-ink"
                            }`}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>

                      {settings.mode === "blur" && (
                        <Slider
                          label="Blur"
                          min={0}
                          max={100}
                          resetTo={60}
                          value={settings.blur}
                          onChange={(value) => change({ blur: value })}
                          onCommit={() => {}}
                        />
                      )}

                      {settings.mode === "colour" && (
                        <div>
                          <p className="text-sm font-medium">Colour</p>
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            {SWATCHES.map((hex) => (
                              <button
                                key={hex}
                                type="button"
                                aria-label={`Use colour ${hex}`}
                                aria-pressed={settings.colour === hex}
                                onClick={() => change({ colour: hex })}
                                className={`size-9 rounded-full border-2 transition-transform hover:scale-105 ${
                                  settings.colour === hex ? "border-ink" : "border-line"
                                }`}
                                style={{ backgroundColor: hex }}
                              />
                            ))}
                            <input
                              type="color"
                              aria-label="Pick any colour"
                              value={settings.colour}
                              onChange={(event) => change({ colour: event.target.value })}
                              className="size-9 cursor-pointer rounded-full border border-line bg-transparent p-0.5"
                            />
                          </div>
                        </div>
                      )}

                      {settings.mode === "image" && (
                        <div>
                          <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-line px-4 py-2 text-sm font-medium transition-colors hover:border-ink">
                            <ImagePlus className="size-4" aria-hidden="true" />
                            {backdrop ? "Choose another image" : "Choose a background image"}
                            <input
                              type="file"
                              accept="image/jpeg,image/png,image/webp"
                              aria-label="Choose a background image"
                              className="sr-only"
                              onChange={(event) => {
                                chooseBackdrop(event.target.files?.[0]);
                                event.target.value = "";
                              }}
                            />
                          </label>
                          {!backdrop && <p className="mt-2 text-sm text-muted">Pick any photo to put behind you.</p>}
                        </div>
                      )}

                      {settings.mode !== "original" && (
                        <div>
                          <Slider
                            label="Edge softness"
                            min={0}
                            max={100}
                            resetTo={30}
                            value={settings.feather}
                            onChange={(value) => change({ feather: value })}
                            onCommit={() => {}}
                          />
                          <p className="mt-1 text-xs text-muted">
                            Raise it if the edge around you looks too sharp. Lower it if it looks fuzzy.
                          </p>
                        </div>
                      )}
                    </>
                  )}

                  {tab === "retouch" && (
                    <>
                      <Slider
                        label="Smooth skin"
                        min={0}
                        max={100}
                        value={settings.smooth}
                        onChange={(value) => change({ smooth: value })}
                        onCommit={() => {}}
                      />
                      <Slider
                        label="Even skin tone"
                        min={0}
                        max={100}
                        value={settings.even}
                        onChange={(value) => change({ even: value })}
                        onCommit={() => {}}
                      />
                      <p className="text-sm text-muted">
                        Only skin the AI finds is changed, and sharp details are kept. Use a light touch for a natural
                        look.
                      </p>
                    </>
                  )}
                </div>
              </Card>

              <Card className="p-5">
                <h2 className="font-display text-2xl font-semibold tracking-tight">Save your photo</h2>
                <p className="mt-1 text-sm text-muted">
                  Saves at {work.width} × {work.height} pixels.
                </p>
                {transparent ? (
                  <p className="mt-3 text-sm text-muted">A see-through background is saved as PNG.</p>
                ) : (
                  <div className="mt-4 flex gap-2" role="group" aria-label="File type">
                    {[
                      { id: "jpeg", label: "JPG" },
                      { id: "png", label: "PNG" },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        aria-pressed={format === item.id}
                        onClick={() => setFormat(item.id)}
                        className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                          format === item.id ? "border-ink bg-ink text-white" : "border-line hover:border-ink"
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                )}
                <Button className="mt-5 w-full" onClick={handleDownload} loading={saving}>
                  <Download className="size-4" aria-hidden="true" />
                  {saving ? "Saving..." : "Download photo"}
                </Button>
                <Button className="mt-3 w-full" variant="secondary" onClick={openInEditor} loading={opening}>
                  <PencilRuler className="size-4" aria-hidden="true" />
                  Open in the editor
                </Button>
              </Card>
            </aside>
          </div>
        )}
      </AppShell>
    </>
  );
}

// The size a photo should be shrunk to, so its longest side is at most "side"
function fit(canvas, side) {
  const shrink = Math.min(1, side / Math.max(canvas.width, canvas.height));
  return [Math.max(1, Math.round(canvas.width * shrink)), Math.max(1, Math.round(canvas.height * shrink))];
}