import type { WorldId } from './worlds';
import type { FestivalId } from '../time/festival';
import raw from './playlists.json';

export interface Track {
  world: WorldId;
  title: string;
  artist: string;
  /** "" = placeholder; skipped by the player and reported by `npm run verify`. */
  youtubeId: string;
  /** Seconds to skip at the start (long intros). */
  startAt?: number;
  notes?: string;
  /** Parab only: weighted up while this festival is active. */
  festival?: FestivalId;
  /** Override for the verify script's title match: a substring of the real YouTube title. */
  titleMatch?: string;
}

export const TRACKS: readonly Track[] = raw as Track[];

export function tracksFor(world: WorldId): Track[] {
  return TRACKS.filter((t) => t.world === world);
}
