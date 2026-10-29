// The photo enhancer's engine, on the page side.
//
// How it works
// ------------
// The AI model is small, so it cannot look at a whole photo at once. We cut the photo into
// small squares ("tiles"), send them one by one to a background worker that runs the model,
// and paste the sharper pieces back together. Each tile is cut a little bigger than needed
// (the "margin") so the model can see the pixels around it. The margin is thrown away after,
// which hides the seams between tiles.
//
// The worker file is "frontend/public/enhance-worker.js".

export const TILE = 96; // the part of the photo each tile is responsible for, on the processor
export const TILE_GPU = 176; // bigger pieces on the graphics chip: fewer round trips, so it is faster
export const MARGIN = 8; // extra pixels around it, for context (a multiple of 8, which the model likes)
export const TILE_INPUT = TILE + 2 * MARGIN;

// The tile size to use for the device that loaded the model
export const tileFor = (device) => (device === "webgpu" ? TILE_GPU : TILE);
export const MAX_OUTPUT_SIDE = 3072; // the biggest enhanced photo we make, in pixels

// Three models of different strength. All are Swin2SR super-resolution models (Apache-2.0)
// from Hugging Face. They download the first time and are then kept in the browser.
export const MODELS = [
  {
    id: "quick",
    label: "Quick",
    scale: 2,
    repo: "Xenova/swin2SR-lightweight-x2-64",
    about: "The fastest choice. A gentle 2× upscale and clean-up.",
  },
  {
    id: "clean",
    label: "Clean",
    scale: 2,
    repo: "Xenova/swin2SR-classical-sr-x2-64",
    about: "A sharper 2× upscale for photos that are only a little soft.",
  },
  {
    id: "real",
    label: "Real photo",
    scale: 4,
    repo: "onnx-community/swin2SR-realworld-sr-x4-64-bsrgan-psnr-ONNX",
    about: "Made for blurry, noisy or heavily compressed photos. A 4× upscale. Slow on devices without a graphics chip.",
  },
];

// A message that is safe to show to the user as it is
export class EnhanceError extends Error {
  constructor(message, { cancelled = false } = {}) {
    super(message);
    this.name = "EnhanceError";
    this.cancelled = cancelled;
  }
}

const clamp = (value, low, high) => Math.min(high, Math.max(low, value));

// The biggest photo we send to the model. Weaker devices get a smaller limit, so it does not take forever.
export function inputLimit(model, hasGpu) {
  const byDevice = hasGpu ? 1024 : 512;
  return Math.min(byDevice, Math.floor(MAX_OUTPUT_SIDE / model.scale));
}

// How big the photo is when it goes to the model, and how big the result will be
export function plannedSize(width, height, model, hasGpu) {
  const shrink = Math.min(1, inputLimit(model, hasGpu) / Math.max(width, height));
  const w = Math.max(1, Math.round(width * shrink));
  const h = Math.max(1, Math.round(height * shrink));
  return { input: { w, h }, output: { w: w * model.scale, h: h * model.scale }, shrunk: shrink < 1 };
}

// ---------- Keeping the wait short on every device ----------

export const TIME_BUDGET_MS = 35000; // how long we aim for the AI work to take
const MIN_SIDE = 256; // we never shrink the photo below this (longest side), however slow the device is

export const tileCount = (width, height, tileSize) => Math.ceil(width / tileSize) * Math.ceil(height / tileSize);

// Times the model on one tile. The first run is only a warm-up (the engine prepares itself), so the second is timed.
export async function measureTileMs(enhancer, source, tileSize) {
  const tile = { x: 0, y: 0, w: Math.min(tileSize, source.width), h: Math.min(tileSize, source.height) };
  const size = tileSize + 2 * MARGIN;
  await enhancer.runTile(cutTile(source, tile, tileSize), size);
  const started = performance.now();
  await enhancer.runTile(cutTile(source, tile, tileSize), size);
  return Math.max(1, performance.now() - started);
}

// The photo size to send to the model so the work finishes in about the time budget.
// Fast devices keep the full size. Slow devices get a smaller photo, so nobody waits for minutes.
export function fitToBudget({ width, height, tileSize, msPerTile, budgetMs = TIME_BUDGET_MS }) {
  let factor = 1;
  for (;;) {
    const w = Math.max(1, Math.round(width * factor));
    const h = Math.max(1, Math.round(height * factor));
    const fits = tileCount(w, h, tileSize) * msPerTile <= budgetMs;
    if (fits || Math.max(w, h) <= MIN_SIDE) return { w, h, shrunk: factor < 1 };
    factor *= 0.92;
    if (Math.max(width, height) * factor < MIN_SIDE) factor = MIN_SIDE / Math.max(width, height);
  }
}

// ---------- Tiles (plain functions, so they are easy to test) ----------

export function planTiles(width, height, TILE = 96) {
  const tiles = [];
  for (let y = 0; y < height; y += TILE) {
    for (let x = 0; x < width; x += TILE) {
      tiles.push({ x, y, w: Math.min(TILE, width - x), h: Math.min(TILE, height - y) });
    }
  }
  return tiles;
}

// Cuts one tile out of the photo as red-green-blue bytes.
// Near the photo's edge, the missing pixels are copied from the nearest edge pixel.
// "source" is { data (RGBA bytes), width, height }.
export function cutTile(source, tile, TILE = 96) {
  const TILE_INPUT = TILE + 2 * MARGIN;
  const out = new Uint8Array(TILE_INPUT * TILE_INPUT * 3);
  let at = 0;
  for (let j = 0; j < TILE_INPUT; j++) {
    const y = clamp(tile.y - MARGIN + j, 0, source.height - 1);
    for (let i = 0; i < TILE_INPUT; i++) {
      const x = clamp(tile.x - MARGIN + i, 0, source.width - 1);
      const from = (y * source.width + x) * 4;
      out[at++] = source.data[from];
      out[at++] = source.data[from + 1];
      out[at++] = source.data[from + 2];
    }
  }
  return out;
}

// Pastes the middle of an enhanced tile into the big result and says which area changed.
// "target" is { data (RGBA bytes), width }. "result" is { data (RGB bytes), width, height }.
export function placeTile(target, result, tile, scale, TILE = 96) {
  const TILE_INPUT = TILE + 2 * MARGIN;
  const expected = TILE_INPUT * scale;
  if (result.width !== expected || result.height !== expected || result.data.length !== expected * expected * 3) {
    throw new EnhanceError("The AI model gave an answer in an unexpected size. Please try a different model.");
  }

  const margin = MARGIN * scale;
  for (let j = 0; j < tile.h * scale; j++) {
    let to = ((tile.y * scale + j) * target.width + tile.x * scale) * 4;
    let from = ((margin + j) * result.width + margin) * 3;
    for (let i = 0; i < tile.w * scale; i++) {
      target.data[to++] = result.data[from++];
      target.data[to++] = result.data[from++];
      target.data[to++] = result.data[from++];
      target.data[to++] = 255;
    }
  }
  return { x: tile.x * scale, y: tile.y * scale, w: tile.w * scale, h: tile.h * scale };
}

// Enhances a whole photo, one tile at a time.
//   source    - { data, width, height } of the photo going in
//   target    - { data, width, height } of the result (filled in as tiles finish)
//   tileSize  - the size of each piece (bigger on the graphics chip)
//   runTile   - async (rgbBytes, inputSize) => { data, width, height }, which sends one tile to the model
//   onTile    - called after every tile with { done, total, dirty, etaMs }
//   isStopped - returns true when the person pressed Cancel
export async function enhanceImageData({ source, target, scale, runTile, onTile, isStopped, tileSize = TILE }) {
  const tiles = planTiles(source.width, source.height, tileSize);
  const started = Date.now();

  for (let n = 0; n < tiles.length; n++) {
    if (isStopped?.()) throw new EnhanceError("Cancelled", { cancelled: true });
    const result = await runTile(cutTile(source, tiles[n], tileSize), tileSize + 2 * MARGIN);
    const dirty = placeTile(target, result, tiles[n], scale, tileSize);
    const done = n + 1;
    const etaMs = ((Date.now() - started) / done) * (tiles.length - done);
    onTile?.({ done, total: tiles.length, dirty, etaMs });
  }
}

// ---------- The background worker ----------

export class Enhancer {
  constructor() {
    this.worker = null;
    this.pending = new Map();
    this.nextId = 1;
    this.onDownload = null;
    this.stopped = false;
  }

  send(message, transfer = []) {
    return new Promise((resolve, reject) => {
      const id = this.nextId++;
      this.pending.set(id, { resolve, reject });
      this.worker.postMessage({ ...message, id }, transfer);
    });
  }

  handle(message) {
    if (message.type === "download") {
      this.onDownload?.(message);
      return;
    }
    const entry = this.pending.get(message.id);
    if (!entry) return;
    this.pending.delete(message.id);
    if (message.type === "error") {
      entry.reject(new EnhanceError(friendlyWorkerError(message.message)));
    } else {
      entry.resolve(message);
    }
  }

  failAll(error) {
    for (const entry of this.pending.values()) entry.reject(error);
    this.pending.clear();
  }

  // Starts the worker and loads the model. Resolves with { device, dtype }.
  async load(model, onDownload) {
    this.onDownload = onDownload;
    this.worker = new Worker("/enhance-worker.js", { type: "module" });
    this.worker.onmessage = (event) => this.handle(event.data);
    this.worker.onerror = () =>
      this.failAll(new EnhanceError("The AI engine could not start. Please check your internet connection and try again."));
    return this.send({ type: "load", repo: model.repo });
  }

  // Sends one tile (red-green-blue bytes) and gets the enhanced tile back
  async runTile(rgb, size = TILE_INPUT) {
    const buffer = rgb.buffer;
    const reply = await this.send({ type: "tile", size, data: buffer }, [buffer]);
    return { data: new Uint8Array(reply.data), width: reply.width, height: reply.height };
  }

  terminate() {
    this.stopped = true;
    this.worker?.terminate();
    this.worker = null;
    this.failAll(new EnhanceError("Cancelled", { cancelled: true }));
  }
}

// Turns the engine's technical messages into something a person can act on
function friendlyWorkerError(text) {
  const lower = String(text).toLowerCase();
  if (lower.includes("fetch") || lower.includes("network") || lower.includes("failed to load") || lower.includes("404")) {
    return "We couldn't download the AI model. Please check your internet connection and try again.";
  }
  if (lower.includes("memory") || lower.includes("alloc")) {
    return "This device ran out of memory. Try the Quick model or a smaller photo.";
  }
  return "The AI model could not process this photo. Please try again or choose another model.";
}

// ---------- Drawing helpers ----------

// A copy of a canvas at a new size (smooth scaling). Used for the "before" picture.
export function scaledCopy(source, width, height) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(source, 0, 0, width, height);
  return canvas;
}

// Mixes the plain upscaled photo ("base") with the AI result ("enhanced").
// strength 0 = only the plain photo. strength 100 = only the AI result.
export function blend(base, enhanced, strength) {
  const out = new Uint8ClampedArray(base.data.length);
  const k = clamp(strength, 0, 100) / 100;
  for (let i = 0; i < out.length; i++) {
    out[i] = base.data[i] + (enhanced.data[i] - base.data[i]) * k;
  }
  return out;
}

export function formatDuration(ms) {
  const seconds = Math.max(1, Math.round(ms / 1000));
  if (seconds < 60) return seconds === 1 ? "1 second" : `${seconds} seconds`;
  const minutes = Math.round(seconds / 60);
  return minutes === 1 ? "1 minute" : `${minutes} minutes`;
}