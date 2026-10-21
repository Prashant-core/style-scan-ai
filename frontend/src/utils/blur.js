// A fast blur that works on any list of numbers laid out as rows of pixels.
// It slides a window along each row and then along each column, and does that twice,
// which looks very close to a smooth (Gaussian) blur.
//
// "channels" is how many numbers each pixel has: 4 for a colour photo, 1 for a mask.

function blurLine(source, target, start, stride, length, radius) {
  const size = 2 * radius + 1;
  const last = length - 1;
  let sum = 0;
  for (let k = -radius; k <= radius; k++) {
    sum += source[start + Math.min(last, Math.max(0, k)) * stride];
  }
  for (let i = 0; i < length; i++) {
    target[start + i * stride] = sum / size;
    sum +=
      source[start + Math.min(last, i + radius + 1) * stride] -
      source[start + Math.max(0, i - radius) * stride];
  }
}

function pass(source, target, width, height, channels, radius, horizontal) {
  for (let c = 0; c < channels; c++) {
    if (horizontal) {
      for (let y = 0; y < height; y++) {
        blurLine(source, target, y * width * channels + c, channels, width, radius);
      }
    } else {
      for (let x = 0; x < width; x++) {
        blurLine(source, target, x * channels + c, width * channels, height, radius);
      }
    }
  }
}

// Returns a new, blurred copy. The input is not changed.
// Pass the same kind of list you give in: a Uint8ClampedArray gives a Uint8ClampedArray back,
// and a Float32Array gives a Float32Array back.
export function blur(data, width, height, channels, radius) {
  const r = Math.round(radius);
  const first = new data.constructor(data.length);
  if (r < 1) {
    first.set(data);
    return first;
  }
  const second = new data.constructor(data.length);
  pass(data, first, width, height, channels, r, true);
  pass(first, second, width, height, channels, r, false);
  pass(second, first, width, height, channels, r, true);
  pass(first, second, width, height, channels, r, false);
  return second;
}