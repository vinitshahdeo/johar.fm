// localStorage can be missing, full, or throw on access (private mode, blocked site data).
// Every read and write goes through here and falls back to defaults.

import type { WorldId } from './data/worlds';

export interface Prefs {
  world: WorldId;
  volume: number; // 0–100
  ambience: boolean;
}

export const STORAGE_KEY = 'joharfm:v1';

export const DEFAULT_PREFS: Prefs = { world: 'akhra', volume: 70, ambience: true };

const WORLDS: readonly string[] = ['akhra', 'trekker', 'biha', 'parab'];

function getStore(): Storage | null {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

/** Returns saved prefs, or null if this is a first visit (or storage is unavailable). */
export function loadPrefs(): Prefs | null {
  try {
    const raw = getStore()?.getItem(STORAGE_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as Partial<Prefs>;
    return {
      world: WORLDS.includes(p.world as string) ? (p.world as WorldId) : DEFAULT_PREFS.world,
      volume:
        typeof p.volume === 'number' && p.volume >= 0 && p.volume <= 100
          ? Math.round(p.volume)
          : DEFAULT_PREFS.volume,
      ambience: typeof p.ambience === 'boolean' ? p.ambience : DEFAULT_PREFS.ambience,
    };
  } catch {
    return null;
  }
}

export function savePrefs(prefs: Prefs): void {
  try {
    getStore()?.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // Storage full or blocked: preferences just won't persist.
  }
}
