import type { WorldId } from '../data/worlds';
import type { Phase } from '../time/dayPhase';

export interface Ambience {
  start(world: WorldId, phase: Phase): void;
  setWorld(world: WorldId): void;
  setPhase(phase: Phase): void;
  /** Music volume 0–100; ambience follows it at a fixed level below. */
  setVolume(v: number): void;
  setEnabled(on: boolean): void;
  /** Lower the ambience a little more while a song is actually playing. */
  duck(on: boolean): void;
  /** Short radio-static burst when the dial moves. */
  crackle(): void;
}
