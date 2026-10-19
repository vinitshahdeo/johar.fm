import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  getActiveFestival,
  parseDay,
  validateFestivals,
  type FestivalEntry,
} from '../src/time/festival';

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

// Fixture dates are made up for testing; they are not real festival dates.
const karam: FestivalEntry = { id: 'karam', year: 2026, start: '2026-09-10' };
const jitiya: FestivalEntry = { id: 'jitiya', year: 2026, start: '2026-09-20', end: '2026-09-21' };
const fagua: FestivalEntry = { id: 'fagua', year: 2027, start: '2027-01-02', leadDays: 3, trailDays: 0 };

function on(y: number, m: number, d: number, h = 12) {
  vi.setSystemTime(new Date(y, m - 1, d, h, 0, 0));
  return new Date();
}

describe('getActiveFestival', () => {
  it('returns null for an empty config', () => {
    expect(getActiveFestival(on(2026, 9, 10), [])).toBeNull();
  });

  it('is active on the day itself', () => {
    expect(getActiveFestival(on(2026, 9, 10), [karam])?.id).toBe('karam');
  });

  it('starts exactly leadDays (default 7) before', () => {
    expect(getActiveFestival(on(2026, 9, 3), [karam])?.id).toBe('karam');
    expect(getActiveFestival(on(2026, 9, 2, 23), [karam])).toBeNull();
  });

  it('ends exactly trailDays (default 2) after end', () => {
    expect(getActiveFestival(on(2026, 9, 12, 23), [karam])?.id).toBe('karam');
    expect(getActiveFestival(on(2026, 9, 13, 0), [karam])).toBeNull();
  });

  it('counts trailDays from end for multi-day festivals', () => {
    expect(getActiveFestival(on(2026, 9, 23), [jitiya])?.id).toBe('jitiya');
    expect(getActiveFestival(on(2026, 9, 24), [jitiya])).toBeNull();
  });

  it('respects custom lead/trail', () => {
    expect(getActiveFestival(on(2026, 12, 30), [fagua])?.id).toBe('fagua');
    expect(getActiveFestival(on(2026, 12, 29), [fagua])).toBeNull();
    expect(getActiveFestival(on(2027, 1, 3), [fagua])).toBeNull();
  });

  it('handles windows that cross a year boundary', () => {
    expect(getActiveFestival(on(2026, 12, 31), [fagua])?.id).toBe('fagua');
    expect(getActiveFestival(on(2027, 1, 1), [fagua])?.id).toBe('fagua');
  });

  it('picks the nearest start when windows overlap', () => {
    // Karam window: Sep 3–12. Jitiya window: Sep 13–23. Make them overlap with a long lead.
    const longLead = { ...jitiya, leadDays: 10 }; // Sep 10–23
    expect(getActiveFestival(on(2026, 9, 11), [karam, longLead])?.id).toBe('karam');
    expect(getActiveFestival(on(2026, 9, 12), [karam, longLead])?.id).toBe('karam');
    expect(getActiveFestival(on(2026, 9, 16), [karam, longLead])?.id).toBe('jitiya');
  });

  it('ignores malformed entries', () => {
    const bad = { id: 'karam', year: 2026, start: '2026-02-30' } as FestivalEntry;
    expect(getActiveFestival(on(2026, 2, 28), [bad])).toBeNull();
  });

  it('uses local calendar date, not UTC', () => {
    // 00:30 local on Sep 13 is outside Karam's window regardless of the UTC date.
    vi.setSystemTime(new Date(2026, 8, 13, 0, 30));
    expect(getActiveFestival(new Date(), [karam])).toBeNull();
  });
});

describe('parseDay', () => {
  it('rejects impossible dates', () => {
    expect(parseDay('2026-13-01')).toBeNull();
    expect(parseDay('2026-02-29')).toBeNull();
    expect(parseDay('2028-02-29')).not.toBeNull();
    expect(parseDay('26-1-1')).toBeNull();
  });
});

describe('validateFestivals', () => {
  it('accepts empty and valid configs', () => {
    expect(validateFestivals([])).toEqual([]);
    expect(validateFestivals([karam, jitiya, fagua])).toEqual([]);
  });

  it('reports problems', () => {
    expect(validateFestivals({})).toHaveLength(1);
    const errs = validateFestivals([
      { id: 'diwali', year: 2026, start: '2026-11-01' },
      { id: 'karam', year: 2026, start: '2026-09-10', end: '2026-09-01' },
      { id: 'sarhul', year: 2027, start: '2026-04-01' },
    ]);
    expect(errs).toHaveLength(3);
  });
});
