import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getDayPhase } from '../src/time/dayPhase';

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

// Local-time constructor, so these hold in any TZ the tests run in.
const at = (h: number, m: number) => new Date(2026, 9, 19, h, m, 0);

describe('getDayPhase', () => {
  it.each([
    [0, 0, 'night'],
    [4, 59, 'night'],
    [5, 0, 'morning'],
    [10, 59, 'morning'],
    [11, 0, 'afternoon'],
    [15, 59, 'afternoon'],
    [16, 0, 'dusk'],
    [18, 59, 'dusk'],
    [19, 0, 'night'],
    [23, 59, 'night'],
  ] as const)('%i:%i → %s', (h, m, expected) => {
    vi.setSystemTime(at(h, m));
    expect(getDayPhase()).toBe(expected);
  });

  it('uses an explicit date over the clock', () => {
    vi.setSystemTime(at(12, 0));
    expect(getDayPhase(at(20, 0))).toBe('night');
  });
});
