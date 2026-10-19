"use client";

import { Crop, FlipHorizontal2, FlipVertical2, RotateCcw, RotateCw } from "lucide-react";
import Button from "@/components/ui/Button";
import Slider from "@/components/editor/Slider";
import { ASPECTS } from "@/utils/editor";

const toolButton =
  "flex flex-col items-center gap-1 rounded-lg border border-line px-1 py-3 text-center text-xs font-medium leading-tight transition-colors hover:border-ink disabled:pointer-events-none disabled:opacity-50";

// Turn, flip, straighten and crop
export default function CropPanel({
  geo,
  cropping,
  aspectId,
  onAspect,
  onStartCrop,
  onApplyCrop,
  onCancelCrop,
  onLive,
  onEnd,
  onApply,
}) {
  // Turning or flipping makes an old crop box wrong, so the crop is cleared
  const change = (update) => onApply((edit) => ({ ...edit, geo: { ...update(edit.geo), crop: null } }));

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold">Turn and flip</h3>
        <div className="mt-2 grid grid-cols-4 gap-2">
          <button
            type="button"
            disabled={cropping}
            onClick={() => change((g) => ({ ...g, turns: (g.turns + 3) % 4 }))}
            className={toolButton}
          >
            <RotateCcw className="size-5" aria-hidden="true" />
            Turn left
          </button>
          <button
            type="button"
            disabled={cropping}
            onClick={() => change((g) => ({ ...g, turns: (g.turns + 1) % 4 }))}
            className={toolButton}
          >
            <RotateCw className="size-5" aria-hidden="true" />
            Turn right
          </button>
          <button
            type="button"
            disabled={cropping}
            onClick={() => change((g) => ({ ...g, flipH: !g.flipH }))}
            className={toolButton}
          >
            <FlipHorizontal2 className="size-5" aria-hidden="true" />
            Flip sideways
          </button>
          <button
            type="button"
            disabled={cropping}
            onClick={() => change((g) => ({ ...g, flipV: !g.flipV }))}
            className={toolButton}
          >
            <FlipVertical2 className="size-5" aria-hidden="true" />
            Flip upside down
          </button>
        </div>
      </div>

      <Slider
        label="Straighten"
        min={-30}
        max={30}
        step={0.5}
        suffix="°"
        value={geo.straighten}
        onChange={(value) => onLive((edit) => ({ ...edit, geo: { ...edit.geo, straighten: value } }))}
        onCommit={onEnd}
      />

      <div className="border-t border-line pt-5">
        <h3 className="text-sm font-semibold">Crop</h3>

        {cropping ? (
          <>
            <p className="mt-1 text-sm text-muted">Drag the box or its corners on the photo.</p>
            <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Crop shape">
              {ASPECTS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={aspectId === item.id}
                  onClick={() => onAspect(item.id)}
                  className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                    aspectId === item.id ? "border-ink bg-ink text-white" : "border-line hover:border-ink"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <Button size="sm" onClick={onApplyCrop}>
                Apply crop
              </Button>
              <Button size="sm" variant="ghost" onClick={onCancelCrop}>
                Cancel
              </Button>
            </div>
          </>
        ) : (
          <div className="mt-3 flex flex-wrap gap-2">
            <Button size="sm" variant="secondary" onClick={onStartCrop}>
              <Crop className="size-4" aria-hidden="true" />
              {geo.crop ? "Change crop" : "Crop photo"}
            </Button>
            {geo.crop && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onApply((edit) => ({ ...edit, geo: { ...edit.geo, crop: null } }))}
              >
                Remove crop
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}