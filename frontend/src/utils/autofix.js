// "Auto-fix" for the photo editor. It looks at the photo and suggests slider values.
// It is plain maths, not AI, so it is instant and works offline.
//
// What it checks:
//   brightness  - is the middle of the photo too dark or too bright?
//   contrast    - do the darkest and brightest parts use the full range?
//   shadows     - are many pixels almost black?
//   highlights  - are many pixels almost white?
//   warmth      - do the grey-looking parts lean blue or orange? (Skin is ignored on purpose,
//                 because a face is supposed to be orange.)
//   colour      - is the photo very dull, or very over-saturated?
// Each fix is only partial (about 60%), so the result looks natural and you can still adjust it.

const clamp = (value, low, high) => Math.min(high, Math.max(low, value));

// "data" is RGBA bytes
export function suggestAdjust(data) {
  const pixels = data.length / 4;
  const step = Math.max(1, Math.floor(pixels / 40000));
  const histogram = new Uint32Array(256);
  let count = 0;
  let saturationSum = 0;
  let neutral = 0;
  let neutralRed = 0;
  let neutralBlue = 0;

  for (let p = 0; p < pixels; p += step) {
    const r = data[p * 4];
    const g = data[p * 4 + 1];
    const b = data[p * 4 + 2];
    const l = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
    histogram[l]++;
    count++;
    const high = Math.max(r, g, b);
    const low = Math.min(r, g, b);
    const saturation = high === 0 ? 0 : (high - low) / high;
    if (l > 30) saturationSum += saturation;
    if (saturation < 0.08 && l > 60 && l < 220) {
      neutral++;
      neutralRed += r;
      neutralBlue += b;
    }
  }

  const percentile = (share) => {
    const target = count * share;
    let seen = 0;
    for (let level = 0; level < 256; level++) {
      seen += histogram[level];
      if (seen >= target) return level;
    }
    return 255;
  };

  const low = percentile(0.01);
  const middle = percentile(0.5);
  const high = percentile(0.99);
  let dark = 0;
  let bright = 0;
  for (let level = 0; level < 256; level++) {
    if (level < 40) dark += histogram[level];
    if (level > 235) bright += histogram[level];
  }
  dark /= count;
  bright /= count;

  const adjust = { brightness: 0, contrast: 0, shadows: 0, highlights: 0, warmth: 0, saturation: 0, sharpness: 0 };
  const notes = [];

  // Brightness: bring the middle toward a comfortable level (about 118 of 255)
  const brightness = clamp(Math.round(((118 - middle) / 0.9) * 0.6), -35, 35);
  if (Math.abs(brightness) >= 7) {
    adjust.brightness = brightness;
    notes.push(brightness > 0 ? "made it brighter" : "made it darker");
  }

  // Contrast: stretch a flat photo
  const spread = Math.max(1, high - low);
  if (spread < 215) {
    adjust.contrast = clamp(Math.round((225 / spread - 1) * 100 * 0.6), 0, 35);
    if (adjust.contrast >= 4) notes.push("added contrast");
    else adjust.contrast = 0;
  }

  if (dark > 0.2) {
    adjust.shadows = clamp(Math.round(dark * 110), 0, 40);
    notes.push("lifted the dark parts");
  }
  if (bright > 0.06) {
    adjust.highlights = -clamp(Math.round(bright * 220), 0, 40);
    notes.push("calmed the very bright parts");
  }

  // Warmth: only from grey-looking pixels, and only if there are enough of them
  if (neutral / count > 0.03) {
    const cast = (neutralRed - neutralBlue) / neutral; // above 0 is orange, below 0 is blue
    const warmth = clamp(Math.round((-cast / 0.7) * 0.6), -18, 18);
    if (Math.abs(warmth) >= 6) {
      adjust.warmth = warmth;
      notes.push(warmth > 0 ? "warmed the colours" : "cooled the colours");
    }
  }

  // Colour strength
  const saturation = saturationSum / Math.max(1, count);
  if (saturation > 0.04 && saturation < 0.25) {
    // (Black and white photos have almost no colour, so they are left alone.)
    adjust.saturation = clamp(Math.round((0.25 - saturation) * 150), 0, 25);
    if (adjust.saturation >= 4) notes.push("made the colours richer");
    else adjust.saturation = 0;
  } else if (saturation > 0.55) {
    adjust.saturation = -clamp(Math.round((saturation - 0.55) * 100), 0, 20);
    if (adjust.saturation <= -4) notes.push("toned down strong colours");
    else adjust.saturation = 0;
  }

  if (notes.length > 0) adjust.sharpness = 15;
  return { adjust, notes };
}