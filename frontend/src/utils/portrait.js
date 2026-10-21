// Background tools for portraits: cut the person out, then blur, colour or replace what is behind them.
//
// The AI model (see segment.js) gives one number from 0 to 1 per pixel: how likely it is that the pixel is the person.
// Everything here is plain maths on those numbers, so it is easy to test.

import { blur } from "@/utils/blur";
import { retouchSkin } from "@/utils/retouch";

const clamp = (value, low, high) => Math.min(high, Math.max(low, value));

// Makes the edge of the person cleaner. Values near 0 or 1 are pushed to 0 or 1,
// then the edge is softened a little so it does not look cut out with scissors.
// feather is 0 to 100.
export function refineAlpha(person, width, height, feather = 30) {
  const sharp = new Float32Array(person.length);
  for (let i = 0; i < person.length; i++) {
    const t = clamp((person[i] - 0.3) / 0.4, 0, 1);
    sharp[i] = t * t * (3 - 2 * t);
  }
  const radius = (Math.max(width, height) / 400) * (feather / 100) * 3;
  return radius < 1 ? sharp : blur(sharp, width, height, 1, radius);
}

// A copy of a mask at a new size (smooth scaling)
export function resizePlane(plane, width, height, newWidth, newHeight) {
  if (width === newWidth && height === newHeight) return plane;
  const out = new Float32Array(newWidth * newHeight);
  for (let y = 0; y < newHeight; y++) {
    const fy = ((y + 0.5) * height) / newHeight - 0.5;
    const y0 = clamp(Math.floor(fy), 0, height - 1);
    const y1 = Math.min(height - 1, y0 + 1);
    const ty = clamp(fy - y0, 0, 1);
    for (let x = 0; x < newWidth; x++) {
      const fx = ((x + 0.5) * width) / newWidth - 0.5;
      const x0 = clamp(Math.floor(fx), 0, width - 1);
      const x1 = Math.min(width - 1, x0 + 1);
      const tx = clamp(fx - x0, 0, 1);
      const top = plane[y0 * width + x0] * (1 - tx) + plane[y0 * width + x1] * tx;
      const bottom = plane[y1 * width + x0] * (1 - tx) + plane[y1 * width + x1] * tx;
      out[y * newWidth + x] = top * (1 - ty) + bottom * ty;
    }
  }
  return out;
}

// What share of the photo the AI thinks is a person
export function coverage(person) {
  let sum = 0;
  for (let i = 0; i < person.length; i++) sum += person[i] > 0.5 ? 1 : 0;
  return sum / person.length;
}

export const BACKGROUND_MODES = ["original", "blur", "colour", "image", "transparent"];

// Draws the finished portrait.
//   image    - { data, width, height } the photo
//   person   - the person map (0 to 1 per pixel)
//   skin     - the skin map (0 to 1 per pixel)
//   backdrop - { data } a picture the same size as the photo, used when mode is "image"
//   settings - { mode, blur (0-100), colour ([r,g,b]), feather (0-100), smooth (0-100), even (0-100) }
// Returns the pixels (RGBA). For "transparent", the area behind the person has alpha 0.
export function renderPortrait({ image, person, skin, backdrop, settings }) {
  const { width, height } = image;
  const retouched =
    settings.smooth > 0 || settings.even > 0
      ? { data: retouchSkin(image, skin, { smooth: settings.smooth, even: settings.even }), width, height }
      : image;

  if (settings.mode === "original") return new Uint8ClampedArray(retouched.data);

  const alpha = refineAlpha(person, width, height, settings.feather);
  const source = retouched.data;
  const out = new Uint8ClampedArray(source.length);

  if (settings.mode === "transparent") {
    for (let p = 0; p < alpha.length; p++) {
      out[p * 4] = source[p * 4];
      out[p * 4 + 1] = source[p * 4 + 1];
      out[p * 4 + 2] = source[p * 4 + 2];
      out[p * 4 + 3] = alpha[p] * 255;
    }
    return out;
  }

  let behind = null;
  if (settings.mode === "blur") {
    const radius = Math.max(1, (Math.max(width, height) * 0.045 * settings.blur) / 100);
    behind = blur(source, width, height, 4, radius);
  } else if (settings.mode === "image" && backdrop) {
    behind = backdrop.data;
  }
  const [cr, cg, cb] = settings.colour;

  for (let p = 0; p < alpha.length; p++) {
    const a = alpha[p];
    const i = p * 4;
    const br = behind ? behind[i] : cr;
    const bg = behind ? behind[i + 1] : cg;
    const bb = behind ? behind[i + 2] : cb;
    out[i] = source[i] * a + br * (1 - a);
    out[i + 1] = source[i + 1] * a + bg * (1 - a);
    out[i + 2] = source[i + 2] * a + bb * (1 - a);
    out[i + 3] = 255;
  }
  return out;
}

// A copy of a picture that fills a width x height frame (the extra is cropped off, like a wallpaper)
export function coverFit(source, width, height) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  const scale = Math.max(width / source.width, height / source.height);
  const w = source.width * scale;
  const h = source.height * scale;
  context.imageSmoothingQuality = "high";
  context.drawImage(source, (width - w) / 2, (height - h) / 2, w, h);
  return canvas;
}

export function hexToRgb(hex) {
  const value = /^#?([0-9a-f]{6})$/i.exec(hex)?.[1] ?? "ffffff";
  return [0, 2, 4].map((at) => parseInt(value.slice(at, at + 2), 16));
}