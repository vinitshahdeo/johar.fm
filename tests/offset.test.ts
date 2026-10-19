import { describe, expect, it } from 'vitest';
import { JOIN_LATE_MAX, JOIN_LATE_MIN, startOffset } from '../src/player/offset';

describe('startOffset', () => {
  it('plays from the start (or startAt) normally', () => {
    expect(startOffset({}, false)).toBe(0);
    expect(startOffset({ startAt: 12 }, false)).toBe(12);
  });

  it('joins at a random point from 0:30 to 1:30 after a station switch', () => {
    expect(startOffset({}, true, () => 0)).toBe(30);
    expect(startOffset({}, true, () => 0.5)).toBe(60);
    expect(startOffset({}, true, () => 0.999999)).toBe(90);
    for (let i = 0; i < 500; i++) {
      const s = startOffset({ startAt: 6 }, true);
      expect(Number.isInteger(s)).toBe(true);
      expect(s).toBeGreaterThanOrEqual(JOIN_LATE_MIN);
      expect(s).toBeLessThanOrEqual(JOIN_LATE_MAX);
    }
  });

  it('never starts before a later startAt', () => {
    expect(startOffset({ startAt: 44 }, true, () => 0)).toBe(44);
    expect(startOffset({ startAt: 44 }, true, () => 0.999999)).toBe(90);
    expect(startOffset({ startAt: 120 }, true, () => 0.999999)).toBe(120);
  });
});
