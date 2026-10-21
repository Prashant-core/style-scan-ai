"use client";

import { useEffect, useReducer, useRef, useState } from "react";
import { Crop, Download, Eye, Redo2, SlidersHorizontal, Sparkles, Type, Undo2, Wand2 } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import UploadBox from "@/components/features/UploadBox";
import AdjustPanel from "@/components/editor/AdjustPanel";
import CropOverlay from "@/components/editor/CropOverlay";
import CropPanel from "@/components/editor/CropPanel";
import FilterPanel from "@/components/editor/FilterPanel";
import Slider from "@/components/editor/Slider";
import TextLayer from "@/components/editor/TextLayer";
import TextPanel from "@/components/editor/TextPanel";
import {
  DEFAULT_ADJUST,
  DEFAULT_EDIT,
  MAX_PREVIEW_SIDE,
  boxForRatio,
  downloadBlob,
  exportBlob,
  frameSize,
  loadPhoto,
  lockRatio,
  outputSize,
  renderEdit,
} from "@/utils/editor";
import { historyReducer, startHistory } from "@/utils/editorState";
import { friendlyError } from "@/utils/photo";
import { clearHandoff, peekHandoff } from "@/utils/handoff";
import { suggestAdjust } from "@/utils/autofix";

const TABS = [
  { id: "adjust", label: "Adjust", icon: SlidersHorizontal },
  { id: "filters", label: "Filters", icon: Sparkles },
  { id: "crop", label: "Crop", icon: Crop },
  { id: "text", label: "Text", icon: Type },
];

const FULL_BOX = { x: 0, y: 0, w: 1, h: 1 };

const isFullBox = (rect) => rect.x < 0.002 && rect.y < 0.002 && rect.w > 0.996 && rect.h > 0.996;

export default function EditorPage() {
  const [photo, setPhoto] = useState(null); // { full, preview, thumb }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("adjust");
  const [crop, setCrop] = useState(null); // { rect, aspectId } while the person is choosing a crop
  const [selectedText, setSelectedText] = useState(null);
  const [peek, setPeek] = useState(false); // true while "Hold to compare" is pressed
  const [format, setFormat] = useState("jpeg");
  const [quality, setQuality] = useState(92);
  const [saving, setSaving] = useState(false);
  const [autoNote, setAutoNote] = useState(""); // what Auto-fix just did, in words

  const [history, dispatch] = useReducer(historyReducer, DEFAULT_EDIT, startHistory);
  const edit = history.present;
  const dirty = history.past.length > 0 || history.anchor !== null;
  const cropping = crop !== null;

  const canvasRef = useRef(null);

  // Helpers the panels use to change the edit
  const live = (update) => dispatch({ type: "live", update });
  const end = () => dispatch({ type: "end" });
  const apply = (update) => dispatch({ type: "apply", update });

  // Draws the photo each time the edit changes
  useEffect(() => {
    if (!photo || !canvasRef.current) return;
    const shown = peek ? { ...edit, adjust: DEFAULT_ADJUST, filter: "none" } : edit;
    const frame = requestAnimationFrame(() => {
      renderEdit(photo.preview, shown, {
        maxSide: MAX_PREVIEW_SIDE,
        target: canvasRef.current,
        withText: false,
        ignoreCrop: cropping,
      });
    });
    return () => cancelAnimationFrame(frame);
  }, [photo, edit, peek, cropping]);

  // Ctrl+Z to undo, Ctrl+Shift+Z or Ctrl+Y to redo
  useEffect(() => {
    function onKey(event) {
      if (!(event.ctrlKey || event.metaKey)) return;
      const typing = event.target.tagName === "INPUT" && event.target.type !== "range";
      if (typing) return;
      const key = event.key.toLowerCase();
      if (key === "z") {
        event.preventDefault();
        dispatch({ type: event.shiftKey ? "redo" : "undo" });
      } else if (key === "y") {
        event.preventDefault();
        dispatch({ type: "redo" });
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Opens a photo sent from another page (for example the enhancer).
  // It looks first and clears inside the promise, so it still works when React runs effects twice in development.
  useEffect(() => {
    const waiting = peekHandoff();
    if (!waiting) return;
    let active = true;
    loadPhoto(waiting)
      .then((opened) => {
        if (!active) return;
        clearHandoff();
        setPhoto(opened);
      })
      .catch(() => {
        if (!active) return;
        clearHandoff();
        setError("We couldn't open that photo. Please choose it again.");
      });
    return () => {
      active = false;
    };
  }, []);

  // Warns before leaving the page with edits that were not saved
  useEffect(() => {
    if (!dirty) return;
    const warn = (event) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  async function handleSelect(file) {
    setError("");
    setLoading(true);
    try {
      const opened = await loadPhoto(file);
      dispatch({ type: "reset", present: DEFAULT_EDIT });
      setCrop(null);
      setSelectedText(null);
      setTab("adjust");
      setAutoNote("");
      setPhoto(opened);
    } catch (err) {
      setError(friendlyError(err, "We couldn't open that photo. Please try another one."));
    } finally {
      setLoading(false);
    }
  }

  // Looks at the photo and sets the sliders for you. You can still change them after.
  function autoFix() {
    const thumb = photo.thumb;
    const pixels = thumb.getContext("2d").getImageData(0, 0, thumb.width, thumb.height).data;
    const { adjust: suggested, notes } = suggestAdjust(pixels);
    if (notes.length === 0) {
      setAutoNote("This photo already looks balanced, so nothing was changed.");
      return;
    }
    setCrop(null);
    apply((current) => ({ ...current, adjust: { ...current.adjust, ...suggested } }));
    setTab("adjust");
    setAutoNote(`Auto-fix ${notes.join(", ")}. Use Undo or the sliders to change it.`);
  }

  function startOver() {
    setAutoNote("");
    setPhoto(null);
    setCrop(null);
    setSelectedText(null);
    dispatch({ type: "reset", present: DEFAULT_EDIT });
  }

  function chooseTab(id) {
    setCrop(null); // leaving the crop tab drops an unfinished crop
    setTab(id);
  }

  // ----- Crop -----

  const frame = photo ? frameSize(photo.preview.width, photo.preview.height, edit.geo.turns) : null;
  const ratio = crop && frame ? lockRatio(crop.aspectId, frame) : null;

  function startCrop() {
    setCrop({ rect: edit.geo.crop || FULL_BOX, aspectId: "free" });
  }

  function chooseAspect(aspectId) {
    const nextRatio = lockRatio(aspectId, frame);
    setCrop({ aspectId, rect: nextRatio ? boxForRatio(nextRatio) : crop.rect });
  }

  function applyCrop() {
    const rect = crop.rect;
    apply((current) => ({ ...current, geo: { ...current.geo, crop: isFullBox(rect) ? null : rect } }));
    setCrop(null);
  }

  // ----- Saving -----

  async function handleDownload() {
    setSaving(true);
    setError("");
    try {
      const blob = await exportBlob(photo, edit, {
        type: format === "png" ? "image/png" : "image/jpeg",
        quality: quality / 100,
      });
      downloadBlob(blob, `stylescan-photo.${format === "png" ? "png" : "jpg"}`);
    } catch (err) {
      setError(friendlyError(err, "We couldn't save the photo. Please try again."));
    } finally {
      setSaving(false);
    }
  }

  const saved = photo ? outputSize(photo.full, edit) : null;

  return (
    <>
      <title>Photo editor | StyleScan AI</title>
      <AppShell
        wide
        title="Photo editor"
        description="Crop, adjust, add filters and text. Your photo stays on your device while you edit."
      >
        {error && <Alert className="mb-6">{error}</Alert>}

        {!photo ? (
          <div className="mx-auto max-w-2xl">
            {loading ? (
              <Card className="py-16 text-center">
                <p className="font-display text-3xl font-semibold tracking-tight">Opening your photo...</p>
              </Card>
            ) : (
              <UploadBox onSelect={handleSelect} />
            )}
            <p className="mt-4 text-sm text-muted">
              Editing happens in your browser. Nothing is uploaded until you choose to save it.
            </p>
          </div>
        ) : (
          <div className="grid items-start gap-x-6 gap-y-4 lg:grid-cols-[minmax(0,1fr)_360px] lg:grid-rows-[auto_1fr]">
            {/* Buttons above the photo */}
            <div className="flex flex-wrap items-center gap-2 lg:col-start-1 lg:row-start-1">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => dispatch({ type: "undo" })}
                disabled={history.past.length === 0 && history.anchor === null}
                aria-label="Undo"
                title="Undo (Ctrl+Z)"
              >
                <Undo2 className="size-4" aria-hidden="true" />
                Undo
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => dispatch({ type: "redo" })}
                disabled={history.future.length === 0}
                aria-label="Redo"
                title="Redo (Ctrl+Shift+Z)"
              >
                <Redo2 className="size-4" aria-hidden="true" />
                Redo
              </Button>
              <Button
                variant="ghost"
                size="sm"
                disabled={!dirty}
                onClick={() => {
                  setCrop(null);
                  apply(() => DEFAULT_EDIT);
                }}
              >
                Reset all
              </Button>
              <Button
                variant="ghost"
                size="sm"
                disabled={cropping}
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
              <Button variant="secondary" size="sm" onClick={autoFix} disabled={cropping}>
                <Wand2 className="size-4" aria-hidden="true" />
                Auto-fix
              </Button>
              <Button variant="ghost" size="sm" onClick={startOver} className="sm:ml-auto">
                New photo
              </Button>
              {autoNote && (
                <p className="basis-full text-sm text-muted" role="status">
                  {autoNote}
                </p>
              )}
            </div>

            {/* The photo. On a phone it stays at the top while you move the sliders below it. */}
            <div className="sticky top-14 z-10 -mx-5 bg-paper px-5 pb-2 lg:static lg:col-start-1 lg:row-start-2 lg:mx-0 lg:p-0">
              <div className="flex items-center justify-center rounded-xl border border-line bg-surface p-2 sm:p-5 lg:min-h-[300px]">
                <div className="relative w-fit max-w-full">
                  <canvas
                    ref={canvasRef}
                    role="img"
                    aria-label="Your photo with the edits applied"
                    className="block h-auto max-h-[36vh] w-auto max-w-full rounded-md sm:max-h-[50vh] lg:max-h-[68vh]"
                  />
                  {cropping ? (
                    <CropOverlay
                      rect={crop.rect}
                      ratio={ratio}
                      onChange={(rect) => setCrop((current) => ({ ...current, rect }))}
                    />
                  ) : (
                    <TextLayer
                      texts={edit.texts}
                      selectedId={tab === "text" ? selectedText : null}
                      onSelect={(id) => {
                        setSelectedText(id);
                        if (id) setTab("text");
                      }}
                      onMove={(id, x, y) =>
                        live((current) => ({
                          ...current,
                          texts: current.texts.map((item) => (item.id === id ? { ...item, x, y } : item)),
                        }))
                      }
                      onMoveEnd={end}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* The tools */}
            <aside className="space-y-6 lg:col-start-2 lg:row-span-2 lg:row-start-1">
              <Card className="p-5">
                <div role="tablist" aria-label="Editing tools" className="grid grid-cols-4 gap-1 rounded-lg bg-paper p-1">
                  {TABS.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        role="tab"
                        aria-selected={tab === item.id}
                        onClick={() => chooseTab(item.id)}
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

                <div className="mt-5" role="tabpanel">
                  {tab === "adjust" && (
                    <AdjustPanel adjust={edit.adjust} onLive={live} onEnd={end} onApply={apply} />
                  )}
                  {tab === "filters" && (
                    <FilterPanel
                      thumb={photo.thumb}
                      filter={edit.filter}
                      amount={edit.filterAmount}
                      onApply={apply}
                      onLive={live}
                      onEnd={end}
                    />
                  )}
                  {tab === "crop" && (
                    <CropPanel
                      geo={edit.geo}
                      cropping={cropping}
                      aspectId={crop?.aspectId}
                      onAspect={chooseAspect}
                      onStartCrop={startCrop}
                      onApplyCrop={applyCrop}
                      onCancelCrop={() => setCrop(null)}
                      onLive={live}
                      onEnd={end}
                      onApply={apply}
                    />
                  )}
                  {tab === "text" && (
                    <TextPanel
                      texts={edit.texts}
                      selectedId={selectedText}
                      onSelect={setSelectedText}
                      onLive={live}
                      onEnd={end}
                      onApply={apply}
                    />
                  )}
                </div>
              </Card>

              <Card className="p-5">
                <h2 className="font-display text-2xl font-semibold tracking-tight">Save your photo</h2>
                <p className="mt-1 text-sm text-muted">
                  Saves at {saved.w} × {saved.h} pixels.
                </p>
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
                {format === "jpeg" ? (
                  <div className="mt-4">
                    <Slider
                      label="Quality"
                      min={60}
                      max={100}
                      resetTo={92}
                      suffix="%"
                      value={quality}
                      onChange={setQuality}
                      onCommit={() => {}}
                    />
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-muted">PNG keeps every detail but makes a bigger file.</p>
                )}
                <Button className="mt-5 w-full" onClick={handleDownload} loading={saving}>
                  <Download className="size-4" aria-hidden="true" />
                  {saving ? "Saving..." : "Download photo"}
                </Button>
              </Card>
            </aside>
          </div>
        )}
      </AppShell>
    </>
  );
}