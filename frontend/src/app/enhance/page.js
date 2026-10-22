"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { Cpu, Download, PencilRuler, Wand2, Zap } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import UploadBox from "@/components/features/UploadBox";
import CompareSlider from "@/components/enhance/CompareSlider";
import Slider from "@/components/editor/Slider";
import { downloadBlob, loadPhoto } from "@/utils/editor";
import {
  EnhanceError,
  Enhancer,
  MODELS,
  blend,
  enhanceImageData,
  formatDuration,
  plannedSize,
  scaledCopy,
} from "@/utils/enhance";
import { setHandoff } from "@/utils/handoff";
import SaveToGallery from "@/components/features/SaveToGallery";
import { friendlyError } from "@/utils/photo";

// Whether this browser offers WebGPU (a fast way to use the graphics chip).
// useSyncExternalStore gives the right answer on the page without a flash of the wrong one.
const noSubscription = () => () => {};
const detectGpu = () => Boolean(navigator.gpu);
const serverGuess = () => false;

const megabytes = (bytes) => (bytes / 1024 / 1024).toFixed(1);

export default function EnhancePage() {
  const router = useRouter();
  const hasGpu = useSyncExternalStore(noSubscription, detectGpu, serverGuess);

  const [photo, setPhoto] = useState(null); // { full (canvas), url (preview link) }
  const [picked, setPicked] = useState(null); // the model the person chose
  const [phase, setPhase] = useState("idle"); // idle, loading, working or done
  const [progress, setProgress] = useState({ text: "", percent: 0, etaMs: null });
  const [result, setResult] = useState(null); // { before, after } canvases
  const [device, setDevice] = useState("");
  const [strength, setStrength] = useState(100);
  const [format, setFormat] = useState("jpeg");
  const [error, setError] = useState("");
  const [opening, setOpening] = useState(false);

  const enhancerRef = useRef(null);
  const dataRef = useRef(null); // the plain and enhanced pixels, so the strength slider can mix them

  // Faster devices start on the strongest model. Others start on the quickest.
  const modelId = picked ?? (hasGpu ? "real" : "quick");
  const model = MODELS.find((item) => item.id === modelId);
  const busy = phase === "loading" || phase === "working";
  const plan = photo ? plannedSize(photo.full.width, photo.full.height, model, hasGpu) : null;

  // Frees the preview link when the photo changes or the page closes
  useEffect(() => {
    const url = photo?.url;
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [photo]);

  // Stops the background worker if the person leaves the page
  useEffect(() => {
    const holder = enhancerRef;
    return () => holder.current?.terminate();
  }, []);

  async function handleSelect(file) {
    setError("");
    setResult(null);
    setPhase("idle");
    try {
      const full = await loadPhoto(file);
      setPhoto({ full: full.full, url: URL.createObjectURL(file) });
    } catch (err) {
      setError(friendlyError(err, "We couldn't open that photo. Please try another one."));
    }
  }

  async function startEnhance() {
    setError("");
    setResult(null);
    setStrength(100);

    // The photo that goes to the model, the plain upscale to compare with, and the empty result
    const source = scaledCopy(photo.full, plan.input.w, plan.input.h);
    const sourceData = source.getContext("2d").getImageData(0, 0, plan.input.w, plan.input.h);
    const before = scaledCopy(source, plan.output.w, plan.output.h);
    const baseData = before.getContext("2d").getImageData(0, 0, plan.output.w, plan.output.h);
    const after = document.createElement("canvas");
    after.width = plan.output.w;
    after.height = plan.output.h;
    const afterContext = after.getContext("2d", { willReadFrequently: true });
    afterContext.putImageData(baseData, 0, 0);
    // Pieces that are not finished yet show the plain upscale
    const enhancedData = new ImageData(new Uint8ClampedArray(baseData.data), baseData.width, baseData.height);
    dataRef.current = { base: baseData, enhanced: enhancedData, context: afterContext };

    const enhancer = new Enhancer();
    enhancerRef.current = enhancer;
    setPhase("loading");
    setProgress({ text: "Getting the AI model ready...", percent: 0, etaMs: null });

    try {
      // The model is downloaded the first time. We add up all its files for one progress bar.
      const files = {};
      const used = await enhancer.load(model, (info) => {
        files[info.file] = info;
        const list = Object.values(files);
        const loaded = list.reduce((sum, item) => sum + item.loaded, 0);
        const total = list.reduce((sum, item) => sum + item.total, 0);
        setProgress({
          text: `Downloading the AI model: ${megabytes(loaded)} of ${megabytes(total)} MB`,
          percent: total ? (loaded / total) * 100 : 0,
          etaMs: null,
        });
      });
      setDevice(used.device);
      setResult({ before, after });
      setPhase("working");

      await enhanceImageData({
        source: sourceData,
        target: enhancedData,
        scale: model.scale,
        runTile: (rgb) => enhancer.runTile(rgb),
        isStopped: () => enhancer.stopped,
        onTile: ({ done, total, dirty, etaMs }) => {
          afterContext.putImageData(enhancedData, 0, 0, dirty.x, dirty.y, dirty.w, dirty.h);
          setProgress({ text: `Enhancing: piece ${done} of ${total}`, percent: (done / total) * 100, etaMs });
        },
      });
      setPhase("done");
    } catch (err) {
      if (!err.cancelled) {
        setError(err instanceof EnhanceError ? err.message : "Something went wrong while enhancing. Please try again.");
      }
      setResult(null);
      setPhase("idle");
    } finally {
      enhancer.terminate();
      enhancerRef.current = null;
    }
  }

  function cancel() {
    enhancerRef.current?.terminate();
  }

  // Mixes the plain photo and the AI result. 100 is all AI, 0 is all plain.
  function changeStrength(value) {
    setStrength(value);
    const { base, enhanced, context } = dataRef.current;
    context.putImageData(new ImageData(blend(base, enhanced, value), base.width, base.height), 0, 0);
  }

  function toBlob(type, quality) {
    return new Promise((resolve) => result.after.toBlob(resolve, type, quality));
  }

  async function handleDownload() {
    setError("");
    const blob = await toBlob(format === "png" ? "image/png" : "image/jpeg", 0.95);
    if (!blob) {
      setError("We couldn't save the photo. Please try again.");
      return;
    }
    downloadBlob(blob, `stylescan-enhanced.${format === "png" ? "png" : "jpg"}`);
  }

  async function openInEditor() {
    setOpening(true);
    const blob = await toBlob("image/jpeg", 0.97);
    if (!blob) {
      setOpening(false);
      setError("We couldn't open the photo in the editor. Please download it instead.");
      return;
    }
    setHandoff(new File([blob], "enhanced.jpg", { type: "image/jpeg" }));
    router.push("/editor");
  }

  function startOver() {
    setPhoto(null);
    setResult(null);
    setPhase("idle");
    setError("");
  }

  return (
    <>
      <title>Photo enhancer | StyleScan AI</title>
      <AppShell
        wide
        title="Photo enhancer"
        description="Make a small, soft or noisy photo sharper. The AI runs in your browser, so your photo never leaves your device."
      >
        {error && <Alert className="mb-6">{error}</Alert>}

        {!photo ? (
          <div className="mx-auto max-w-2xl">
            <UploadBox onSelect={handleSelect} />
            <p className="mt-4 text-sm text-muted">
              Works best on small, blurry or old photos. The first time, an AI model of a few dozen megabytes is
              downloaded. It is kept in your browser after that.
            </p>
          </div>
        ) : (
          <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
            {/* The picture */}
            <div>
              {result ? (
                <CompareSlider before={result.before} after={result.after} />
              ) : (
                <div className="flex justify-center rounded-xl border border-line bg-surface p-3 sm:p-5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.url}
                    alt="Your photo, before enhancing"
                    className="block max-h-[68vh] w-auto max-w-full rounded-md"
                  />
                </div>
              )}

              {busy && (
                <div className="mt-4" role="status" aria-live="polite">
                  <div className="flex items-baseline justify-between gap-4 text-sm">
                    <p className="font-medium">{progress.text}</p>
                    {progress.etaMs !== null && (
                      <p className="shrink-0 text-muted">about {formatDuration(progress.etaMs)} left</p>
                    )}
                  </div>
                  <div
                    className="mt-2 h-2 overflow-hidden rounded-full bg-line"
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={Math.round(progress.percent)}
                  >
                    <div
                      className="h-full rounded-full bg-tape transition-[width] duration-300"
                      style={{ width: `${progress.percent}%` }}
                    />
                  </div>
                  {progress.etaMs !== null && progress.etaMs > 5 * 60 * 1000 && (
                    <p className="mt-2 text-sm text-muted">
                      This will take a while on this device. You can cancel and try the Quick model.
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* The controls */}
            <aside className="space-y-6">
              {phase === "done" ? (
                <>
                  <Card className="p-5">
                    <h2 className="font-display text-2xl font-semibold tracking-tight">Your enhanced photo</h2>
                    <p className="mt-1 text-sm text-muted">
                      {result.after.width} × {result.after.height} pixels. Enhanced with{" "}
                      {device === "webgpu" ? "your graphics chip" : "your processor"}. Drag across the photo to
                      compare.
                    </p>

                    <div className="mt-5">
                      <Slider
                        label="Strength"
                        min={0}
                        max={100}
                        resetTo={100}
                        suffix="%"
                        value={strength}
                        onChange={changeStrength}
                        onCommit={() => {}}
                      />
                      <p className="mt-1 text-xs text-muted">
                        Lower it if the AI result looks too smooth. 0% is the plain enlarged photo.
                      </p>
                    </div>

                    <div className="mt-5 flex gap-2" role="group" aria-label="File type">
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

                    <Button className="mt-5 w-full" onClick={handleDownload}>
                      <Download className="size-4" aria-hidden="true" />
                      Download photo
                    </Button>
                    <Button className="mt-3 w-full" variant="secondary" onClick={openInEditor} loading={opening}>
                      <PencilRuler className="size-4" aria-hidden="true" />
                      Open in the editor
                    </Button>
                    <SaveToGallery className="mt-3" source="enhancer" getBlob={() => toBlob("image/jpeg", 0.92)} />
                  </Card>

                  <div className="flex flex-wrap gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setPhase("idle")}>
                      Try another model
                    </Button>
                    <Button variant="ghost" size="sm" onClick={startOver}>
                      New photo
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <Card className="p-5">
                    <fieldset disabled={busy}>
                      <legend className="font-display text-2xl font-semibold tracking-tight">Choose a model</legend>
                      <div className="mt-4 space-y-3">
                        {MODELS.map((item) => (
                          <label
                            key={item.id}
                            className={`flex cursor-pointer gap-3 rounded-lg border p-3 transition-colors ${
                              modelId === item.id ? "border-ink bg-tape-soft" : "border-line hover:border-ink"
                            } ${busy ? "cursor-not-allowed opacity-60" : ""}`}
                          >
                            <input
                              type="radio"
                              name="model"
                              value={item.id}
                              checked={modelId === item.id}
                              onChange={() => setPicked(item.id)}
                              className="mt-1 size-4 accent-ink"
                            />
                            <span>
                              <span className="block font-semibold">
                                {item.label} <span className="font-normal text-muted">· {item.scale}×</span>
                              </span>
                              <span className="mt-0.5 block text-sm text-muted">{item.about}</span>
                            </span>
                          </label>
                        ))}
                      </div>
                    </fieldset>

                    <p className="mt-4 flex gap-2 text-sm text-muted">
                      {hasGpu ? (
                        <Zap className="mt-0.5 size-4 shrink-0 text-ink" aria-hidden="true" />
                      ) : (
                        <Cpu className="mt-0.5 size-4 shrink-0 text-ink" aria-hidden="true" />
                      )}
                      {hasGpu
                        ? "Your browser can use the graphics chip (WebGPU), so this should run faster."
                        : "Your browser can't use the graphics chip, so the AI runs on the processor. It is slower, so smaller photos are used."}
                    </p>

                    <p className="mt-4 border-t border-line pt-4 text-sm">
                      Your photo is {photo.full.width} × {photo.full.height}.{" "}
                      {plan.shrunk
                        ? `It will first be shrunk to ${plan.input.w} × ${plan.input.h} so it can be processed in a reasonable time. `
                        : ""}
                      The result will be {plan.output.w} × {plan.output.h} pixels.
                    </p>

                    {busy ? (
                      <Button className="mt-5 w-full" variant="secondary" onClick={cancel}>
                        Cancel
                      </Button>
                    ) : (
                      <Button className="mt-5 w-full" onClick={startEnhance}>
                        <Wand2 className="size-4" aria-hidden="true" />
                        Enhance photo
                      </Button>
                    )}
                  </Card>

                  {!busy && (
                    <Button variant="ghost" size="sm" onClick={startOver}>
                      Choose another photo
                    </Button>
                  )}
                </>
              )}
            </aside>
          </div>
        )}
      </AppShell>
    </>
  );
}