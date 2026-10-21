// Skin retouching. It only touches pixels the "skin" map says are skin.
//
// Smooth skin   - blends each pixel toward a softly blurred copy, but only where the difference is small.
//                 Small differences are pores and tiny spots. Big differences are real edges (eyes, lips,
//                 hair lines), so those stay sharp.
// Even skin tone - moves the colour of each skin pixel toward the average colour of the skin around it,
//                 and keeps its brightness. This calms redness and patchy colour.
//
// "image" is { data (RGBA bytes), width, height }. "skin" is one number from 0 to 1 per pixel.

import { blur } from "@/utils/blur";

const luma = (r, g, b) => 0.299 * r + 0.587 * g + 0.114 * b;

export function retouchSkin(image, skin, { smooth = 0, even = 0 } = {}) {
  const { data, width, height } = image;
  const out = new Uint8ClampedArray(data);
  const smoothAmount = Math.min(1, Math.max(0, smooth / 100));
  const evenAmount = Math.min(1, Math.max(0, even / 100));
  if (smoothAmount === 0 && evenAmount === 0) return out;

  const longSide = Math.max(width, height);
  const fine = smoothAmount > 0 ? blur(data, width, height, 4, Math.max(2, longSide / 260)) : null;

  // The average skin colour around each pixel. Pixels that are not skin are left out,
  // so the background does not leak into the face.
  let average = null;
  let weight = null;
  if (evenAmount > 0) {
    const weighted = new Uint8ClampedArray(width * height * 4);
    for (let p = 0; p < width * height; p++) {
      const m = skin[p];
      weighted[p * 4] = data[p * 4] * m;
      weighted[p * 4 + 1] = data[p * 4 + 1] * m;
      weighted[p * 4 + 2] = data[p * 4 + 2] * m;
      weighted[p * 4 + 3] = 255 * m;
    }
    average = blur(weighted, width, height, 4, Math.max(4, longSide / 45));
    weight = average; // the 4th number of each pixel is the amount of skin nearby
  }

  const tolerance = 14 + 26 * smoothAmount; // how big a difference still counts as "just texture"

  for (let p = 0; p < width * height; p++) {
    const m = skin[p];
    if (m < 0.02) continue;
    const i = p * 4;
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];

    if (fine) {
      const difference = luma(r, g, b) - luma(fine[i], fine[i + 1], fine[i + 2]);
      const keepEdges = Math.exp(-((difference / tolerance) ** 2));
      const k = smoothAmount * m * keepEdges * 0.92;
      r += (fine[i] - r) * k;
      g += (fine[i + 1] - g) * k;
      b += (fine[i + 2] - b) * k;
    }

    if (average && weight[i + 3] > 12) {
      const scale = 255 / weight[i + 3];
      const ar = average[i] * scale;
      const ag = average[i + 1] * scale;
      const ab = average[i + 2] * scale;
      const own = luma(r, g, b);
      const target = luma(ar, ag, ab);
      const k = evenAmount * m * 0.75;
      // Keep the pixel's own brightness. Only its colour moves.
      r += (own + (ar - target) - r) * k;
      g += (own + (ag - target) - g) * k;
      b += (own + (ab - target) - b) * k;
    }

    out[i] = r;
    out[i + 1] = g;
    out[i + 2] = b;
  }
  return out;
}