import type { Track } from '../data/playlists';

/** Switching stations drops you into a song already in progress, like a radio that was playing all along. */
export const JOIN_LATE_SECONDS = 30;

/** Where a track should start: its own `startAt`, or at least JOIN_LATE_SECONDS in when tuning to a new station. */
export function startOffset(track: Pick<Track, 'startAt'>, joinLate: boolean): number {
  const base = track.startAt ?? 0;
  return joinLate ? Math.max(base, JOIN_LATE_SECONDS) : base;
}
