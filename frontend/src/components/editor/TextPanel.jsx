"use client";

import { Plus, Trash2 } from "lucide-react";
import Button from "@/components/ui/Button";
import Slider from "@/components/editor/Slider";
import { TEXT_COLORS, newTextId } from "@/utils/editor";

const MAX_TEXTS = 8;

// Add words to the photo and change how they look
export default function TextPanel({ texts, selectedId, onSelect, onLive, onEnd, onApply }) {
  const selected = texts.find((item) => item.id === selectedId) || null;

  function addText() {
    const id = newTextId();
    onApply((edit) => ({
      ...edit,
      texts: [
        ...edit.texts,
        { id, text: "Your text", x: 0.5, y: 0.5, size: 0.08, color: "#ffffff", bold: true, shadow: true },
      ],
    }));
    onSelect(id);
  }

  // Changes one thing about the selected words
  const set = (patch) => (edit) => ({
    ...edit,
    texts: edit.texts.map((item) => (item.id === selectedId ? { ...item, ...patch } : item)),
  });

  return (
    <div className="space-y-5">
      <Button variant="secondary" size="sm" onClick={addText} disabled={texts.length >= MAX_TEXTS}>
        <Plus className="size-4" aria-hidden="true" />
        Add text
      </Button>

      {texts.length === 0 && (
        <p className="text-sm text-muted">Add words to your photo, then drag them where you want them.</p>
      )}

      {texts.length > 1 && (
        <ul className="flex flex-wrap gap-2" aria-label="Your texts">
          {texts.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                aria-pressed={selectedId === item.id}
                onClick={() => onSelect(item.id)}
                className={`max-w-32 truncate rounded-full border px-3 py-1 text-sm transition-colors ${
                  selectedId === item.id ? "border-ink bg-ink text-white" : "border-line hover:border-ink"
                }`}
              >
                {item.text || "(empty)"}
              </button>
            </li>
          ))}
        </ul>
      )}

      {selected && (
        <div className="space-y-5 border-t border-line pt-5">
          <div>
            <label htmlFor="text-words" className="text-sm font-medium">
              Words
            </label>
            <input
              id="text-words"
              type="text"
              maxLength={60}
              value={selected.text}
              onChange={(event) => onLive(set({ text: event.target.value }))}
              onBlur={onEnd}
              className="mt-1 h-11 w-full rounded-lg border border-line bg-surface px-3 outline-none transition-colors focus:border-ink"
            />
          </div>

          <Slider
            label="Size"
            min={2}
            max={25}
            resetTo={8}
            suffix="%"
            value={Math.round(selected.size * 100)}
            onChange={(value) => onLive(set({ size: value / 100 }))}
            onCommit={onEnd}
          />

          <div>
            <p className="text-sm font-medium">Colour</p>
            <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="Text colour">
              {TEXT_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  aria-label={`Colour ${color}`}
                  aria-pressed={selected.color === color}
                  onClick={() => onApply(set({ color }))}
                  style={{ backgroundColor: color }}
                  className={`size-8 rounded-full border transition-transform hover:scale-110 ${
                    selected.color === color ? "border-ink ring-2 ring-ink ring-offset-2" : "border-line"
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-4 text-sm">
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={selected.bold}
                onChange={() => onApply(set({ bold: !selected.bold }))}
                className="size-4 accent-ink"
              />
              Bold
            </label>
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={selected.shadow}
                onChange={() => onApply(set({ shadow: !selected.shadow }))}
                className="size-4 accent-ink"
              />
              Shadow
            </label>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              onApply((edit) => ({ ...edit, texts: edit.texts.filter((item) => item.id !== selectedId) }));
              onSelect(null);
            }}
          >
            <Trash2 className="size-4" aria-hidden="true" />
            Delete this text
          </Button>
        </div>
      )}
    </div>
  );
}