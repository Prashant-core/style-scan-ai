// Finds the person in a photo, using MediaPipe's "selfie multiclass" model.
// It labels every pixel as background, hair, body skin, face skin, clothes or other.
// From that we make two maps (one number from 0 to 1 per pixel):
//   person - how likely the pixel is part of the person (everything except the background)
//   skin   - how likely the pixel is skin (face skin counts fully, body skin like neck and arms counts half)
//
// The model file (about 16 MB) is downloaded the first time and kept by the browser.
// It runs in the browser, so the photo is never uploaded.

import { FaceError } from "@/utils/faceMeasure";

const TASKS_VERSION = "1.1.0"; // must match "@mediapipe/tasks-vision" in package.json
const WASM_URL = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${TASKS_VERSION}/wasm`;
const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_multiclass_256x256/float32/latest/selfie_multiclass_256x256.tflite";

// MediaPipe prints harmless "INFO:" lines as errors. This hides only those lines.
async function quietly(task) {
  const original = console.error;
  console.error = (...args) => {
    if (typeof args[0] === "string" && args[0].startsWith("INFO:")) return;
    original.apply(console, args);
  };
  try {
    return await task();
  } finally {
    console.error = original;
  }
}

let segmenterPromise = null;

function getSegmenter() {
  if (!segmenterPromise) {
    segmenterPromise = quietly(async () => {
      const { ImageSegmenter, FilesetResolver } = await import("@mediapipe/tasks-vision");
      const files = await FilesetResolver.forVisionTasks(WASM_URL);
      return ImageSegmenter.createFromOptions(files, {
        baseOptions: { modelAssetPath: MODEL_URL, delegate: "CPU" },
        runningMode: "IMAGE",
        outputConfidenceMasks: true,
        outputCategoryMask: false,
      });
    }).catch((error) => {
      segmenterPromise = null; // allow another try
      throw error;
    });
  }
  return segmenterPromise;
}

// The picture sent to the model is kept small. The model works on 256 x 256 anyway.
const MODEL_SIDE = 1024;

// Returns { width, height, person, skin }. Both maps are Float32Arrays of width x height.
export async function segmentPortrait(canvas) {
  let segmenter;
  try {
    segmenter = await getSegmenter();
  } catch {
    throw new FaceError("We couldn't load the person-finding model. Please check your internet connection and try again.");
  }

  const shrink = Math.min(1, MODEL_SIDE / Math.max(canvas.width, canvas.height));
  const small = document.createElement("canvas");
  small.width = Math.max(1, Math.round(canvas.width * shrink));
  small.height = Math.max(1, Math.round(canvas.height * shrink));
  small.getContext("2d").drawImage(canvas, 0, 0, small.width, small.height);

  let result;
  try {
    result = await quietly(async () => segmenter.segment(small));
  } catch {
    throw new FaceError("We couldn't analyse this photo. Please try another one.");
  }

  try {
    const masks = result.confidenceMasks;
    const labels = segmenter.getLabels();
    const find = (pattern, fallback) => {
      const found = labels.findIndex((label) => pattern.test(label));
      return found >= 0 ? found : fallback;
    };
    const background = masks[find(/background/i, 0)];
    const faceSkin = masks[find(/face/i, 3)];
    const bodySkin = masks[find(/body/i, 2)];
    if (!background || !faceSkin || !bodySkin) throw new Error("unexpected model output");

    const back = background.getAsFloat32Array();
    const face = faceSkin.getAsFloat32Array();
    const body = bodySkin.getAsFloat32Array();
    const person = new Float32Array(back.length);
    const skin = new Float32Array(back.length);
    for (let i = 0; i < back.length; i++) {
      person[i] = 1 - back[i];
      skin[i] = Math.min(1, face[i] + body[i] * 0.5);
    }
    return { width: background.width, height: background.height, person, skin };
  } catch {
    throw new FaceError("We couldn't analyse this photo. Please try another one.");
  } finally {
    result.close();
  }
}