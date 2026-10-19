// The photo editor's engine. Everything here runs in the user's browser.
// Photos are never sent to the server by the editor.
//
// An "edit" is a small plain object that describes every change:
//   adjust  - slider values (brightness, contrast and so on)
//   filter  - the name of a look, and how strong it is
//   geo     - turns, flips, a small straighten angle and an optional crop
//   texts   - words placed on the photo
// The original photo is never changed. We redraw it from the edit each time.

import { FaceError } from "@/utils/faceMeasure";

export const MAX_FULL_SIDE = 4096; // the biggest size we keep for saving
export const MAX_PREVIEW_SIDE = 1280; // the size used on screen, so sliders feel instant
const THUMB_SIDE = 160; // the size used for filter previews

export const FONT_STACK = 'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

// ---------- The settings an edit can hold ----------

export const ADJUSTMENTS = [
  { key: "brightness", label: "Brightness", min: -100 },
  { key: "contrast", label: "Contrast", min: -100 },
  { key: "saturation", label: "Colour", min: -100 },
  { key: "warmth", label: "Warmth", min: -100 },
  { key: "shadows", label: "Shadows", min: -100 },
  { key: "highlights", label: "Highlights", min: -100 },
  { key: "fade", label: "Fade", min: 0 },
  { key: "sharpness", label: "Sharpness", min: 0 },
  { key: "vignette", label: "Vignette", min: 0 },
];

export const DEFAULT_ADJUST = Object.fromEntries(ADJUSTMENTS.map((item) => [item.key, 0]));

export const DEFAULT_GEO = { turns: 0, flipH: false, flipV: false, straighten: 0, crop: null };

export const DEFAULT_EDIT = {
  adjust: DEFAULT_ADJUST,
  filter: "none",
  filterAmount: 100,
  geo: DEFAULT_GEO,
  texts: [],
};

// A filter is a small set of changes added on top of the sliders.
// "gray" and "sepia" turn the colours to black and white or brown.
export const FILTERS = [
  { id: "none", label: "Original" },
  { id: "vivid", label: "Vivid", tweak: { contrast: 14, saturation: 28, shadows: 6 } },
  { id: "warm", label: "Warm", tweak: { warmth: 30, saturation: 8, brightness: 4 } },
  { id: "cool", label: "Cool", tweak: { warmth: -30, saturation: 4 } },
  { id: "film", label: "Film", tweak: { warmth: 14, contrast: -6, saturation: -12, fade: 28, vignette: 18 } },
  { id: "faded", label: "Faded", tweak: { contrast: -14, saturation: -18, fade: 40, brightness: 6 } },
  { id: "drama", label: "Drama", tweak: { contrast: 30, saturation: -14, shadows: -18, highlights: -8, vignette: 28 } },
  { id: "sepia", label: "Sepia", tweak: { warmth: 8, fade: 14 }, sepia: 1 },
  { id: "mono", label: "Mono", tweak: { contrast: 10 }, gray: 1 },
  { id: "noir", label: "Noir", tweak: { contrast: 34, brightness: -6, vignette: 30 }, gray: 1 },
];

export const TEXT_COLORS = ["#ffffff", "#0f1a2a", "#f2c230", "#e5484d", "#3b82f6", "#22c55e"];

// Crop shapes. "value" is width divided by height.
export const ASPECTS = [
  { id: "free", label: "Free" },
  { id: "original", label: "Original" },
  { id: "1:1", label: "1:1", value: 1 },
  { id: "4:5", label: "4:5", value: 4 / 5 },
  { id: "5:4", label: "5:4", value: 5 / 4 },
  { id: "3:4", label: "3:4", value: 3 / 4 },
  { id: "4:3", label: "4:3", value: 4 / 3 },
  { id: "9:16", label: "9:16", value: 9 / 16 },
  { id: "16:9", label: "16:9", value: 16 / 9 },
];

// ---------- Opening a photo ----------

// Draws any image onto a canvas, shrunk so its longest side is at most maxSide
function shrink(source, maxSide) {
  const scale = Math.min(1, maxSide / Math.max(source.width, source.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(source.width * scale));
  canvas.height = Math.max(1, Math.round(source.height * scale));
  const context = canvas.getContext("2d");
  context.imageSmoothingQuality = "high";
  context.drawImage(source, 0, 0, canvas.width, canvas.height);
  return canvas;
}

// Older browsers: open the photo with a normal image element
async function decodeImage(file) {
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    return shrink(image, MAX_FULL_SIDE);
  } finally {
    URL.revokeObjectURL(url);
  }
}

// Opens a photo file. Photos saved sideways by a phone are turned upright.
// Returns three sizes: "full" for saving, "preview" for the screen and "thumb" for filter previews.
export async function loadPhoto(file) {
  let full = null;
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    full = shrink(bitmap, MAX_FULL_SIDE);
    bitmap.close();
  } catch {
    try {
      full = await decodeImage(file);
    } catch {
      throw new FaceError("We couldn't open that photo. Try a different JPG or PNG file.");
    }
  }
  const preview = shrink(full, MAX_PREVIEW_SIDE);
  const thumb = shrink(preview, THUMB_SIDE);
  return { full, preview, thumb };
}

// ---------- Sizes ----------

const clamp = (value, low, high) => Math.min(high, Math.max(low, value));

// The size of the photo after quarter turns (a turn of 1 or 3 swaps width and height)
export function frameSize(width, height, turns) {
  return turns % 2 === 0 ? { w: width, h: height } : { w: height, h: width };
}

// How big the finished picture will be, and which part of the photo it shows
export function outputSize(source, edit, maxSide = Infinity, ignoreCrop = false) {
  const frame = frameSize(source.width, source.height, edit.geo.turns);
  const crop = ignoreCrop ? null : edit.geo.crop;
  const rect = crop
    ? { x: crop.x * frame.w, y: crop.y * frame.h, w: Math.max(1, crop.w * frame.w), h: Math.max(1, crop.h * frame.h) }
    : { x: 0, y: 0, w: frame.w, h: frame.h };
  const scale = Math.min(1, maxSide / Math.max(rect.w, rect.h));
  return {
    w: Math.max(1, Math.round(rect.w * scale)),
    h: Math.max(1, Math.round(rect.h * scale)),
    scale,
    rect,
    frame,
  };
}

// For a crop shape, the box's width divided by its height as shares of the photo (or null for "free")
export function lockRatio(aspectId, frame) {
  if (aspectId === "free") return null;
  const aspect = aspectId === "original" ? frame.w / frame.h : ASPECTS.find((a) => a.id === aspectId).value;
  return (aspect * frame.h) / frame.w;
}

// The biggest centred crop box with this width-to-height ratio
export function boxForRatio(ratio) {
  const w = Math.min(1, ratio);
  const h = w / ratio;
  return { x: (1 - w) / 2, y: (1 - h) / 2, w, h };
}

// ---------- Drawing ----------

// The slider values and the filter, added together
export function effectiveSettings(edit) {
  const settings = { ...edit.adjust, gray: 0, sepia: 0 };
  const filter = FILTERS.find((item) => item.id === edit.filter);
  if (filter && filter.id !== "none") {
    const strength = edit.filterAmount / 100;
    for (const [key, value] of Object.entries(filter.tweak || {})) {
      settings[key] = (settings[key] || 0) + value * strength;
    }
    settings.gray = (filter.gray || 0) * strength;
    settings.sepia = (filter.sepia || 0) * strength;
  }
  return settings;
}

function isNeutral(settings) {
  return Object.values(settings).every((value) => Math.abs(value) < 0.001);
}

// Changes the colours of every pixel
function applyTone(data, settings) {
  const { brightness, contrast, saturation, warmth, shadows, highlights, fade, gray, sepia } = settings;
  const lift = brightness * 0.9;
  const contrastFactor = 1 + (contrast >= 0 ? contrast / 100 : contrast / 110);
  const colourFactor = 1 + saturation / 100;
  const warmShift = warmth * 0.35;
  const shadowLift = shadows * 0.6;
  const highlightLift = highlights * 0.6;
  const fadeAmount = clamp(fade / 100, 0, 1);
  const useRegions = shadows !== 0 || highlights !== 0;

  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];

    // Shadows lift the dark parts. Highlights change the bright parts.
    if (useRegions) {
      const light = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      const change = shadowLift * (1 - light) * (1 - light) + highlightLift * light * light;
      r += change;
      g += change;
      b += change;
    }

    r += lift;
    g += lift;
    b += lift;

    r = (r - 128) * contrastFactor + 128;
    g = (g - 128) * contrastFactor + 128;
    b = (b - 128) * contrastFactor + 128;

    const luma = 0.299 * r + 0.587 * g + 0.114 * b;
    r = luma + (r - luma) * colourFactor;
    g = luma + (g - luma) * colourFactor;
    b = luma + (b - luma) * colourFactor;

    r += warmShift;
    b -= warmShift;

    // Fade lifts the blacks, which gives the soft, washed look
    if (fadeAmount > 0) {
      r = r * (1 - 0.2 * fadeAmount) + 40 * fadeAmount;
      g = g * (1 - 0.2 * fadeAmount) + 40 * fadeAmount;
      b = b * (1 - 0.2 * fadeAmount) + 40 * fadeAmount;
    }

    if (sepia > 0) {
      const sr = 0.393 * r + 0.769 * g + 0.189 * b;
      const sg = 0.349 * r + 0.686 * g + 0.168 * b;
      const sb = 0.272 * r + 0.534 * g + 0.131 * b;
      r += (sr - r) * sepia;
      g += (sg - g) * sepia;
      b += (sb - b) * sepia;
    }

    if (gray > 0) {
      const l = 0.299 * r + 0.587 * g + 0.114 * b;
      r += (l - r) * gray;
      g += (l - g) * gray;
      b += (l - b) * gray;
    }

    // The array clamps every value to 0-255 for us
    data[i] = r;
    data[i + 1] = g;
    data[i + 2] = b;
  }
}

// Makes edges crisper by adding back the difference between each pixel and its blurred neighbours
function applySharpen(image, sharpness) {
  const { width, height, data } = image;
  const original = new Uint8ClampedArray(data);
  const amount = (sharpness / 100) * 1.2;
  // On big pictures we look a little further, so the result matches the smaller preview
  const step = Math.max(1, Math.round(Math.max(width, height) / 1400));
  const row = width * 4;

  for (let y = step; y < height - step; y++) {
    for (let x = step; x < width - step; x++) {
      const index = (y * width + x) * 4;
      for (let channel = 0; channel < 3; channel++) {
        const at = index + channel;
        const blur =
          (original[at - step * row - step * 4] +
            original[at - step * row] +
            original[at - step * row + step * 4] +
            original[at - step * 4] +
            original[at] +
            original[at + step * 4] +
            original[at + step * row - step * 4] +
            original[at + step * row] +
            original[at + step * row + step * 4]) /
          9;
        data[at] = original[at] + amount * (original[at] - blur);
      }
    }
  }
}

// Darkens the corners
function applyVignette(image, vignette) {
  const { width, height, data } = image;
  const amount = clamp(vignette / 100, 0, 1) * 0.9;
  const halfW = width / 2;
  const halfH = height / 2;

  for (let y = 0; y < height; y++) {
    const dy = (y - halfH) / halfH;
    for (let x = 0; x < width; x++) {
      const dx = (x - halfW) / halfW;
      const distance = Math.hypot(dx, dy) / Math.SQRT2;
      const falloff = clamp((distance - 0.35) / 0.65, 0, 1);
      const factor = 1 - amount * falloff * falloff;
      const index = (y * width + x) * 4;
      data[index] *= factor;
      data[index + 1] *= factor;
      data[index + 2] *= factor;
    }
  }
}

function drawTexts(context, texts, width, height) {
  for (const item of texts) {
    if (!item.text) continue;
    const size = item.size * width;
    context.font = `${item.bold ? 700 : 500} ${size}px ${FONT_STACK}`;
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillStyle = item.color;
    if (item.shadow) {
      context.shadowColor = "rgba(0, 0, 0, 0.5)";
      context.shadowBlur = size * 0.12;
      context.shadowOffsetY = size * 0.04;
    }
    context.fillText(item.text, item.x * width, item.y * height);
    context.shadowColor = "transparent";
    context.shadowBlur = 0;
    context.shadowOffsetY = 0;
  }
}

// Draws the photo with every edit applied.
//   source     - a canvas made by loadPhoto
//   maxSide    - the longest side of the result, in pixels
//   target     - an existing canvas to draw on (otherwise a new one is made)
//   withText   - false when the words are shown on top as page elements instead
//   ignoreCrop - true while the person is choosing the crop
export function renderEdit(source, edit, options = {}) {
  const { maxSide = Infinity, target = null, withText = true, ignoreCrop = false } = options;
  const size = outputSize(source, edit, maxSide, ignoreCrop);
  const { frame, rect, scale } = size;
  const { turns, flipH, flipV, straighten } = edit.geo;

  const canvas = target || document.createElement("canvas");
  if (canvas.width !== size.w) canvas.width = size.w;
  if (canvas.height !== size.h) canvas.height = size.h;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  context.setTransform(1, 0, 0, 1, 0, 0);
  context.clearRect(0, 0, size.w, size.h);
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";

  // When the photo is straightened we zoom in just enough to hide the empty corners
  const angle = (straighten * Math.PI) / 180;
  const tilt = Math.abs(angle);
  const cover = Math.cos(tilt) + Math.max(frame.h / frame.w, frame.w / frame.h) * Math.sin(tilt);

  // Steps are listed from the outside in: place the crop, centre, straighten, zoom, flip, turn
  context.setTransform(scale, 0, 0, scale, -rect.x * scale, -rect.y * scale);
  context.translate(frame.w / 2, frame.h / 2);
  context.rotate(angle);
  context.scale(cover, cover);
  context.scale(flipH ? -1 : 1, flipV ? -1 : 1);
  context.rotate((turns * Math.PI) / 2);
  context.drawImage(source, -source.width / 2, -source.height / 2);
  context.setTransform(1, 0, 0, 1, 0, 0);

  const settings = effectiveSettings(edit);
  if (!isNeutral(settings)) {
    const image = context.getImageData(0, 0, size.w, size.h);
    applyTone(image.data, settings);
    if (settings.sharpness > 0) applySharpen(image, settings.sharpness);
    if (settings.vignette > 0) applyVignette(image, settings.vignette);
    context.putImageData(image, 0, 0);
  }

  if (withText) drawTexts(context, edit.texts, size.w, size.h);
  return canvas;
}

// ---------- Saving ----------

// Draws the photo at full size and turns it into a file
export async function exportBlob(photo, edit, { type = "image/jpeg", quality = 0.92 } = {}) {
  // A short pause so the "Saving..." button can show before the heavy work starts
  await new Promise((resolve) => setTimeout(resolve, 30));
  const canvas = renderEdit(photo.full, edit);
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, type, quality));
  if (!blob) throw new FaceError("We couldn't save the photo. Try a smaller photo or fewer edits.");
  return blob;
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

// A short random id for a piece of text
export function newTextId() {
  return `t${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}