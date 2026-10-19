"use client";

import Button from "@/components/ui/Button";
import Slider from "@/components/editor/Slider";
import { ADJUSTMENTS, DEFAULT_ADJUST } from "@/utils/editor";

// The sliders: brightness, contrast, colour and so on
export default function AdjustPanel({ adjust, onLive, onEnd, onApply }) {
  const changed = ADJUSTMENTS.some((item) => adjust[item.key] !== 0);

  return (
    <div className="space-y-4">
      {ADJUSTMENTS.map((item) => (
        <Slider
          key={item.key}
          label={item.label}
          min={item.min}
          value={adjust[item.key]}
          onChange={(value) =>
            onLive((edit) => ({ ...edit, adjust: { ...edit.adjust, [item.key]: value } }))
          }
          onCommit={onEnd}
        />
      ))}
      <p className="text-xs text-muted">Tip: double-click a slider to reset it.</p>
      <Button
        variant="secondary"
        size="sm"
        disabled={!changed}
        onClick={() => onApply((edit) => ({ ...edit, adjust: DEFAULT_ADJUST }))}
      >
        Reset sliders
      </Button>
    </div>
  );
}