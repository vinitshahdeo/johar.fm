import { describe, expect, it } from 'vitest';
import { ShuffleBag, weightedShuffle } from '../src/player/queue';
import type { Track } from '../src/data/playlists';

// Deterministic PRNG (mulberry32) so failures are reproducible.
function seeded(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const mk = (id: string, extra: Partial<Track> = {}): Track => ({
  world: 'akhra',
  title: id,
  artist: 'x',
  youtubeId: id,
  ...extra,
});

const five = ['a', 'b', 'c', 'd', 'e'].map((id) => mk(id));

describe('ShuffleBag', () => {
  it('plays every track once before any repeat', () => {
    for (let seed = 1; seed <= 50; seed++) {
      const bag = new ShuffleBag(five, seeded(seed));
      const round = Array.from({ length: 5 }, () => bag.next()!.youtubeId);
      expect(new Set(round).size).toBe(5);
    }
  });

  it('never repeats across a reshuffle boundary', () => {
    for (let seed = 1; seed <= 200; seed++) {
      const bag = new ShuffleBag(five, seeded(seed));
      let prev = '';
      for (let i = 0; i < 25; i++) {
        const id = bag.next()!.youtubeId;
        expect(id).not.toBe(prev);
        prev = id;
      }
    }
  });

  it('skips placeholders with empty IDs', () => {
    const bag = new ShuffleBag([mk(''), mk('a'), mk('')], seeded(1));
    expect(bag.next()!.youtubeId).toBe('a');
    expect(bag.next()!.youtubeId).toBe('a'); // single playable track loops
  });

  it('returns null when nothing can play', () => {
    expect(new ShuffleBag([], seeded(1)).next()).toBeNull();
    expect(new ShuffleBag([mk('')], seeded(1)).next()).toBeNull();
  });

  it('drops failed tracks for the rest of the session, including from the current bag', () => {
    const bag = new ShuffleBag(five, seeded(7));
    const first = bag.next()!.youtubeId;
    const victim = five.map((t) => t.youtubeId).find((id) => id !== first)!;
    bag.markFailed(victim);
    const seen = Array.from({ length: 20 }, () => bag.next()!.youtubeId);
    expect(seen).not.toContain(victim);
    expect(new Set(seen).size).toBe(4);
  });

  it('returns null once every track has failed', () => {
    const bag = new ShuffleBag(five, seeded(3));
    five.forEach((t) => bag.markFailed(t.youtubeId));
    expect(bag.next()).toBeNull();
  });
});

describe('weightedShuffle', () => {
  it('is a permutation', () => {
    const out = weightedShuffle(five, () => 1, seeded(9));
    expect(out.map((t) => t.youtubeId).sort()).toEqual(['a', 'b', 'c', 'd', 'e']);
  });

  it('puts heavier items first more often', () => {
    const rng = seeded(42);
    let heavyFirst = 0;
    for (let i = 0; i < 2000; i++) {
      const out = weightedShuffle(five, (t) => (t.youtubeId === 'c' ? 3 : 1), rng);
      if (out[0].youtubeId === 'c') heavyFirst++;
    }
    // Expected 3/7 ≈ 0.43 vs 1/5 = 0.2 unweighted.
    expect(heavyFirst / 2000).toBeGreaterThan(0.38);
    expect(heavyFirst / 2000).toBeLessThan(0.48);
  });
});
