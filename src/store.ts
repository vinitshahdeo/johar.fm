export type Listener<T> = (state: T, prev: T) => void;

/** Minimal observable store: shallow-merged updates, synchronous listeners. */
export function createStore<T extends object>(initial: T) {
  let state = initial;
  const listeners = new Set<Listener<T>>();
  return {
    get: () => state,
    set(patch: Partial<T>) {
      const prev = state;
      state = { ...state, ...patch };
      listeners.forEach((l) => l(state, prev));
    },
    subscribe(l: Listener<T>) {
      listeners.add(l);
      return () => listeners.delete(l);
    },
  };
}
