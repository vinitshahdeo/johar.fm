import type { Track } from '../data/playlists';

export type Rng = () => number;

/**
 * Weighted random permutation (Efraimidis–Spirakis): each item gets key u^(1/w) and we sort
 * descending. Heavier items tend to come earlier, but every item still appears exactly once.
 */
export function weightedShuffle<T>(items: readonly T[], weight: (t: T) => number, rng: Rng): T[] {
  return items
    .map((item) => ({ item, key: Math.pow(rng() || Number.MIN_VALUE, 1 / Math.max(weight(item), 1e-6)) }))
    .sort((a, b) => b.key - a.key)
    .map((x) => x.item);
}

/**
 * A per-world shuffle bag. Plays every playable track once before reshuffling,
 * never starts a new bag with the track that just played, and permanently drops
 * tracks that failed this session.
 */
export class ShuffleBag {
  private bag: Track[] = [];
  private last: Track | null = null;
  private readonly failed = new Set<string>();

  constructor(
    private readonly tracks: readonly Track[],
    private readonly rng: Rng = Math.random,
    private weight: (t: Track) => number = () => 1,
  ) {}

  setWeight(weight: (t: Track) => number): void {
    this.weight = weight;
  }

  playable(): Track[] {
    return this.tracks.filter((t) => t.youtubeId && !this.failed.has(t.youtubeId));
  }

  /** Next track, or null if nothing in this world can play. */
  next(): Track | null {
    this.bag = this.bag.filter((t) => !this.failed.has(t.youtubeId));
    if (this.bag.length === 0) {
      const pool = this.playable();
      if (pool.length === 0) return null;
      this.bag = weightedShuffle(pool, this.weight, this.rng);
      if (this.bag.length > 1 && this.last && this.bag[0].youtubeId === this.last.youtubeId) {
        this.bag.push(this.bag.shift()!);
      }
    }
    this.last = this.bag.shift()!;
    return this.last;
  }

  markFailed(youtubeId: string): void {
    this.failed.add(youtubeId);
  }

  current(): Track | null {
    return this.last;
  }
}
