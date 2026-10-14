// Finds a face in a photo and measures it. Everything here runs in the user's browser.
// The photo is never sent to the server. Only the final ratios are.

const TASKS_VERSION = "1.1.0"; // must match "@mediapipe/tasks-vision" in package.json
const WASM_URL = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${TASKS_VERSION}/wasm`;
const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task";

const MAX_SIDE = 1024; // big photos are shrunk first so they are quick to analyse
const MAX_FILE_MB = 10;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

// Numbers of the face points we measure (from MediaPipe's 468-point face map)
const POINT = {
  foreheadLeft: 54,
  foreheadRight: 284,
  cheekLeft: 234,
  cheekRight: 454,
  jawLeft: 172,
  jawRight: 397,
  top: 10,
  chin: 152,
  nose: 1,
  eyeLeft: 33,
  eyeRight: 263,
};

// A message that is safe to show to the user as it is
export class FaceError extends Error {
  constructor(message) {
    super(message);
    this.name = "FaceError";
  }
}

export function checkFile(file) {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return "Please choose a JPG, PNG or WebP photo.";
  }
  if (file.size > MAX_FILE_MB * 1024 * 1024) {
    return `This photo is too large. Please choose one under ${MAX_FILE_MB} MB.`;
  }
  return "";
}

// Opens the photo and draws it on a canvas, shrunk if it is very large
export async function readPhoto(file) {
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = url;
    try {
      await image.decode();
    } catch {
      throw new FaceError("We couldn't open that photo. Try a different JPG or PNG file.");
    }

    const scale = Math.min(1, MAX_SIDE / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas;
  } finally {
    URL.revokeObjectURL(url);
  }
}

// ---------- Maths helpers ----------

// A point in pixels. The depth (z) uses the same scale as the width.
const pointAt = (face, index, width, height) => ({
  x: face[index].x * width,
  y: face[index].y * height,
  z: (face[index].z ?? 0) * width,
});

// Distance in 3D, so turning or tilting the head changes the result much less than a flat distance
const distance3 = (a, b) => Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);

const degrees = (radians) => (radians * 180) / Math.PI;

// How far the head is rolled (tilted towards a shoulder), from the line between the eyes
function rollOf(face, width, height) {
  const a = pointAt(face, POINT.eyeLeft, width, height);
  const b = pointAt(face, POINT.eyeRight, width, height);
  return degrees(Math.atan2(b.y - a.y, b.x - a.x));
}

// Turns the face points so the eye line is level. Used to measure turning and nodding.
function levelled(face, width, height) {
  const roll = (rollOf(face, width, height) * Math.PI) / 180;
  const cos = Math.cos(-roll);
  const sin = Math.sin(-roll);
  return (index) => {
    const p = pointAt(face, index, width, height);
    return { x: p.x * cos - p.y * sin, y: p.x * sin + p.y * cos, z: p.z };
  };
}

// The head turned left or right, in degrees (0 means looking straight at the camera)
function yawOf(face, width, height) {
  const at = levelled(face, width, height);
  const a = at(POINT.cheekLeft);
  const b = at(POINT.cheekRight);
  return degrees(Math.atan2(b.z - a.z, Math.abs(b.x - a.x)));
}

// The head nodding up or down, in degrees
function pitchOf(face, width, height) {
  const at = levelled(face, width, height);
  const a = at(POINT.top);
  const b = at(POINT.chin);
  return degrees(Math.atan2(b.z - a.z, Math.abs(b.y - a.y)));
}

function cheekWidth(face, width, height) {
  return distance3(
    pointAt(face, POINT.cheekLeft, width, height),
    pointAt(face, POINT.cheekRight, width, height)
  );
}

function largestFace(faces, width, height) {
  return faces.reduce((best, face) =>
    cheekWidth(face, width, height) > cheekWidth(best, width, height) ? face : best
  );
}

// ---------- Face model ----------

// MediaPipe prints harmless "INFO:" lines as errors, which some browsers show as red warnings.
// This hides only those lines while the model runs.
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

// The face model is loaded once and then reused
let landmarkerPromise = null;

function getLandmarker() {
  if (!landmarkerPromise) {
    landmarkerPromise = quietly(async () => {
      const { FaceLandmarker, FilesetResolver } = await import("@mediapipe/tasks-vision");
      const files = await FilesetResolver.forVisionTasks(WASM_URL);
      return FaceLandmarker.createFromOptions(files, {
        baseOptions: { modelAssetPath: MODEL_URL, delegate: "CPU" },
        runningMode: "IMAGE",
        numFaces: 4, // so photos with several people still work
      });
    }).catch((error) => {
      landmarkerPromise = null; // allow another try
      throw error;
    });
  }
  return landmarkerPromise;
}

// Turns a picture a quarter or half turn (for photos saved sideways)
function rotateCanvas(source, turn) {
  const sideways = turn === 90 || turn === 270;
  const canvas = document.createElement("canvas");
  canvas.width = sideways ? source.height : source.width;
  canvas.height = sideways ? source.width : source.height;
  const context = canvas.getContext("2d");
  context.translate(canvas.width / 2, canvas.height / 2);
  context.rotate((turn * Math.PI) / 180);
  context.drawImage(source, -source.width / 2, -source.height / 2);
  return canvas;
}

// Looks for faces. If the photo was saved sideways or upside down, it turns the photo
// until the face is upright. Returns the faces and the picture they were found on.
// "detect" and "rotate" can be replaced, which makes this easy to test.
export async function findFaces(canvas, detect, rotate = rotateCanvas) {
  let best = null;

  for (const turn of [0, 90, 270, 180]) {
    const view = turn === 0 ? canvas : rotate(canvas, turn);
    const faces = await detect(view);
    if (!faces || faces.length === 0) continue;

    const face = largestFace(faces, view.width, view.height);
    const roll = Math.abs(rollOf(face, view.width, view.height));
    const chinIsLow = face[POINT.chin].y > face[POINT.top].y;

    // A photo that is already close to upright needs no more tries
    if (turn === 0 && chinIsLow && roll < 35) return { faces, canvas: view };

    const score = (chinIsLow ? 0 : 1000) + roll;
    if (!best || score < best.score) best = { faces, canvas: view, score };
  }

  return best ? { faces: best.faces, canvas: best.canvas } : { faces: [], canvas };
}

// Returns { faces, canvas }. Each face is a list of points with x, y and z.
export async function detectFaces(canvas) {
  let landmarker;
  try {
    landmarker = await getLandmarker();
  } catch {
    throw new FaceError(
      "We couldn't load the face model. Check your internet connection and try again."
    );
  }
  return findFaces(canvas, (view) => quietly(() => landmarker.detect(view).faceLandmarks));
}

// Turns the face points into ratios. Every ratio is compared with the cheekbone width.
// Returns the ratios, lines for the picture, and a list of warnings to show the user.
export function analyseFaces(faces, width, height) {
  if (!faces || faces.length === 0) {
    throw new FaceError(
      "We couldn't find a face in this photo. Use a photo where your face is clear and not covered."
    );
  }

  const warnings = [];
  if (faces.length > 1) {
    warnings.push("We found more than one face and used the biggest one.");
  }

  const face = largestFace(faces, width, height);
  const at = (index) => pointAt(face, index, width, height);

  // The whole face must be inside the photo
  const keyPoints = Object.values(POINT);
  if (keyPoints.some((i) => face[i].x < 0 || face[i].x > 1 || face[i].y < 0 || face[i].y > 1)) {
    throw new FaceError("Part of your face is cut off. Use a photo that shows your whole face.");
  }

  // Heads turned a little are measured in 3D, so they still work. We only warn or refuse
  // when the head is turned so far that the measurements cannot be trusted.
  const yaw = Math.abs(yawOf(face, width, height));
  const pitch = Math.abs(pitchOf(face, width, height));
  if (yaw > 55 || pitch > 50) {
    throw new FaceError(
      "Your head is turned too far. Use a photo where you look towards the camera."
    );
  }
  if (yaw > 25 || pitch > 25) {
    warnings.push("Your head was turned a little, so the numbers may be less exact.");
  }

  const cheek = cheekWidth(face, width, height);
  if (cheek < 80) {
    throw new FaceError("Your face is too small in this photo. Move closer or crop the photo.");
  }

  const round = (value) => Math.round(value * 1000) / 1000;
  const ratios = {
    forehead: round(distance3(at(POINT.foreheadLeft), at(POINT.foreheadRight)) / cheek),
    jaw: round(distance3(at(POINT.jawLeft), at(POINT.jawRight)) / cheek),
    length: round(distance3(at(POINT.top), at(POINT.chin)) / cheek),
  };

  // Lines for the picture, as positions between 0 and 1 so they fit any image size
  const line = (name, from, to) => ({
    name,
    from: { x: face[from].x, y: face[from].y },
    to: { x: face[to].x, y: face[to].y },
  });
  const lines = [
    line("Forehead", POINT.foreheadLeft, POINT.foreheadRight),
    line("Cheekbones", POINT.cheekLeft, POINT.cheekRight),
    line("Jaw", POINT.jawLeft, POINT.jawRight),
    line("Length", POINT.top, POINT.chin),
  ];

  return { ratios, lines, warnings };
}