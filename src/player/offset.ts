import type { Track } from '../data/playlists';

/**
 * Switching stations drops you into a song already in progress, like a radio that was playing all
 * along. The join point is random within this window (seconds), so flipping between bands never
 * lands on the same moment twice.
 */
export const JOIN_LATE_MIN = 30;
export const JOIN_LATE_MAX = 90;

/** Where a track should start: its own `startAt`, or a random point in the join window after a station switch. */
export function startOffset(track: Pick<Track, 'startAt'>, joinLate: boolean, rng: () => number = Math.random): number {
  const base = track.startAt ?? 0;
  if (!joinLate) return base;
  const join = JOIN_LATE_MIN + Math.floor(rng() * (JOIN_LATE_MAX - JOIN_LATE_MIN + 1));
  return Math.max(base, join);
}
