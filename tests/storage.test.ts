import { afterEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_PREFS, loadPrefs, savePrefs, STORAGE_KEY } from '../src/storage';

function memoryStorage(): Storage {
  const m = new Map<string, string>();
  return {
    get length() {
      return m.size;
    },
    clear: () => m.clear(),
    getItem: (k) => m.get(k) ?? null,
    key: (i) => [...m.keys()][i] ?? null,
    removeItem: (k) => void m.delete(k),
    setItem: (k, v) => void m.set(k, String(v)),
  };
}

afterEach(() => vi.unstubAllGlobals());

describe('storage', () => {
  it('returns null on first visit', () => {
    vi.stubGlobal('localStorage', memoryStorage());
    expect(loadPrefs()).toBeNull();
  });

  it('round-trips prefs', () => {
    vi.stubGlobal('localStorage', memoryStorage());
    savePrefs({ world: 'travel', volume: 42, ambience: false });
    expect(loadPrefs()).toEqual({ world: 'travel', volume: 42, ambience: false });
  });

  it('sanitises bad values field by field', () => {
    const s = memoryStorage();
    s.setItem(STORAGE_KEY, JSON.stringify({ world: 'mars', volume: 500, ambience: 'yes' }));
    vi.stubGlobal('localStorage', s);
    expect(loadPrefs()).toEqual(DEFAULT_PREFS);
  });

  it('survives corrupt JSON', () => {
    const s = memoryStorage();
    s.setItem(STORAGE_KEY, '{nope');
    vi.stubGlobal('localStorage', s);
    expect(loadPrefs()).toBeNull();
  });

  it('survives storage that throws on every call', () => {
    const throwing = {
      getItem() {
        throw new Error('SecurityError');
      },
      setItem() {
        throw new Error('QuotaExceededError');
      },
    };
    vi.stubGlobal('localStorage', throwing);
    expect(loadPrefs()).toBeNull();
    expect(() => savePrefs(DEFAULT_PREFS)).not.toThrow();
  });

  it('survives localStorage being undefined', () => {
    vi.stubGlobal('localStorage', undefined);
    expect(loadPrefs()).toBeNull();
    expect(() => savePrefs(DEFAULT_PREFS)).not.toThrow();
  });
});
