import { ApiError } from "@/utils/api";
import { FaceError, readPhoto } from "@/utils/faceMeasure";

// Shrinks a photo in the browser before it is sent. This makes uploads fast and
// also fixes photos that were saved sideways.
export async function prepareUpload(file) {
  const canvas = await readPhoto(file);
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.9));
  if (!blob) throw new FaceError("We couldn't prepare that photo. Please try another one.");
  return new File([blob], "photo.jpg", { type: "image/jpeg" });
}

// Only messages written for people are shown. Anything else becomes the fallback.
export function friendlyError(error, fallback) {
  return error instanceof ApiError || error instanceof FaceError ? error.message : fallback;
}

export function formatDate(value, withTime = false) {
  if (!value) return "";
  return new Date(value).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  });
}