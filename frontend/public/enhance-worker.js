// Runs the AI photo-enhancing model in the background, away from the page,
// so the page stays smooth while the model works.
//
// The page (frontend/src/utils/enhance.js) talks to this file with messages:
//   { type: "load", id, repo }              -> loads the model, answers { type: "loaded", device, dtype }
//   { type: "tile", id, size, data }        -> enhances one small square piece of the photo
//   { type: "download", file, loaded, total } is sent while the model downloads
//   { type: "error", id, message } is sent if something goes wrong
//
// The AI engine is Transformers.js (Apache-2.0). It is loaded from the jsDelivr CDN.
// Keep this version in step with "frontend/src/utils/enhance.js" if you ever change it.
// The model files come from Hugging Face the first time and are then kept in the browser.

const ENGINE_URL = "https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1";

let engine = null;
let upscaler = null;

async function hasWebGpu() {
  try {
    return Boolean(self.navigator && self.navigator.gpu && (await self.navigator.gpu.requestAdapter()));
  } catch {
    return false;
  }
}

async function loadModel(repo, onDownload) {
  engine = engine || (await import(ENGINE_URL));
  engine.env.allowLocalModels = false;

  // Best first: the graphics chip, then the processor. Full precision first, because it is the most accurate.
  const attempts = [];
  if (await hasWebGpu()) attempts.push({ device: "webgpu", dtype: "fp32" });
  attempts.push({ device: "wasm", dtype: "fp32" }, { device: "wasm", dtype: "q8" });

  let lastError = null;
  for (const attempt of attempts) {
    try {
      upscaler = await engine.pipeline("image-to-image", repo, {
        device: attempt.device,
        dtype: attempt.dtype,
        progress_callback: (info) => {
          if (info.status === "progress") {
            onDownload({ file: info.file, loaded: info.loaded, total: info.total });
          }
        },
      });
      return attempt;
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError || new Error("The model could not be loaded.");
}

self.onmessage = async (event) => {
  const message = event.data;
  try {
    if (message.type === "load") {
      const used = await loadModel(message.repo, (info) => self.postMessage({ type: "download", ...info }));
      self.postMessage({ type: "loaded", id: message.id, device: used.device, dtype: used.dtype });
    } else if (message.type === "tile") {
      // The tile arrives as plain red-green-blue bytes
      const input = new engine.RawImage(new Uint8ClampedArray(message.data), message.size, message.size, 3);
      const output = await upscaler(input);
      // Copy, so the bytes can be handed back without being copied again
      const data = new Uint8Array(output.data);
      self.postMessage(
        { type: "tile", id: message.id, width: output.width, height: output.height, channels: output.channels, data: data.buffer },
        [data.buffer]
      );
    }
  } catch (error) {
    self.postMessage({ type: "error", id: message.id, message: String((error && error.message) || error) });
  }
};