export type Phase = 'morning' | 'afternoon' | 'dusk' | 'night';

export const PHASES: readonly Phase[] = ['morning', 'afternoon', 'dusk', 'night'];

/** Maps the device's local time to a scene phase. Boundaries are documented in SPEC.md §5.1. */
export function getDayPhase(date: Date = new Date()): Phase {
  const h = date.getHours();
  if (h >= 5 && h < 11) return 'morning';
  if (h >= 11 && h < 16) return 'afternoon';
  if (h >= 16 && h < 19) return 'dusk';
  return 'night';
}

export function isPhase(v: unknown): v is Phase {
  return typeof v === 'string' && (PHASES as readonly string[]).includes(v);
}
