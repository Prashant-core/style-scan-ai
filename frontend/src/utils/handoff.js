// Passes one photo from one page to the next (for example from the enhancer to the editor).
// The photo stays in the browser's memory. It is never uploaded.
// It only works while the person moves around inside the app, and is forgotten on a page reload.

let waiting = null;

export function setHandoff(file) {
  waiting = file;
}

// Looks at the waiting photo without removing it
export function peekHandoff() {
  return waiting;
}

export function clearHandoff() {
  waiting = null;
}