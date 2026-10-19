import { describe, expect, it } from 'vitest';
import { JOIN_LATE_SECONDS, startOffset } from '../src/player/offset';

describe('startOffset', () => {
  it('plays from the start (or startAt) normally', () => {
    expect(startOffset({}, false)).toBe(0);
    expect(startOffset({ startAt: 12 }, false)).toBe(12);
  });
  it('joins mid-song after a station switch', () => {
    expect(startOffset({}, true)).toBe(JOIN_LATE_SECONDS);
    expect(startOffset({ startAt: 6 }, true)).toBe(JOIN_LATE_SECONDS);
  });
  it('keeps a later startAt when joining', () => {
    expect(startOffset({ startAt: 44 }, true)).toBe(44);
  });
});
