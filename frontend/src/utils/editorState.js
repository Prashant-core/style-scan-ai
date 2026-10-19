// Keeps the editor's undo and redo history.
//
// "live" changes happen while a slider is being dragged. They update the picture at once,
// but the whole drag counts as ONE step in the history. "end" closes that step.
// "apply" is for one-click changes, like turning the photo or choosing a filter.

const MAX_STEPS = 60;

export function startHistory(present) {
  return { past: [], present, future: [], anchor: null };
}

const sameEdit = (a, b) => JSON.stringify(a) === JSON.stringify(b);

export function historyReducer(state, action) {
  switch (action.type) {
    case "live":
      return {
        ...state,
        present: action.update(state.present),
        anchor: state.anchor ?? state.present,
      };

    case "end":
      if (!state.anchor) return state;
      if (sameEdit(state.anchor, state.present)) return { ...state, anchor: null };
      return {
        past: [...state.past, state.anchor].slice(-MAX_STEPS),
        present: state.present,
        future: [],
        anchor: null,
      };

    case "apply":
      return {
        past: [...state.past, state.anchor ?? state.present].slice(-MAX_STEPS),
        present: action.update(state.present),
        future: [],
        anchor: null,
      };

    case "undo": {
      if (state.anchor) return { ...state, present: state.anchor, anchor: null };
      if (state.past.length === 0) return state;
      const previous = state.past[state.past.length - 1];
      return {
        past: state.past.slice(0, -1),
        present: previous,
        future: [state.present, ...state.future],
        anchor: null,
      };
    }

    case "redo": {
      if (state.future.length === 0) return state;
      const [next, ...rest] = state.future;
      return { past: [...state.past, state.present], present: next, future: rest, anchor: null };
    }

    case "reset":
      return startHistory(action.present);

    default:
      return state;
  }
}