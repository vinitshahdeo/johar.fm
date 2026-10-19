import type { WorldId } from '../data/worlds';
import type { Phase } from '../time/dayPhase';
import type { LayerId } from './layers';

type Levels = Partial<Record<LayerId, number>>;

/** Which layers play, and how loud (0–1), for each world and time of day. */
export const RECIPES: Record<WorldId, Record<Phase, Levels>> = {
  akhra: {
    morning: { birds: 1, wind: 0.6, crickets: 0.1 },
    afternoon: { birds: 0.6, wind: 0.8, crickets: 0.1 },
    dusk: { birds: 0.3, wind: 0.5, crickets: 0.7, mandar: 0.8, fire: 0.6, crowd: 0.25 },
    night: { crickets: 1, wind: 0.4, mandar: 0.6, fire: 0.8, crowd: 0.15 },
  },
  trekker: {
    morning: { engine: 1, horn: 0.9, wind: 0.7, birds: 0.3, crowd: 0.2 },
    afternoon: { engine: 1, horn: 0.9, wind: 0.8, birds: 0.2, crowd: 0.2 },
    dusk: { engine: 1, horn: 0.9, wind: 0.7, crickets: 0.2, crowd: 0.2 },
    night: { engine: 1, horn: 0.7, wind: 0.6, crickets: 0.35, crowd: 0.1 },
  },
  biha: {
    morning: { crowd: 0.7, nagara: 0.8, shehnai: 0.6, birds: 0.4 },
    afternoon: { crowd: 0.8, nagara: 0.9, shehnai: 0.6, birds: 0.2 },
    dusk: { crowd: 0.8, nagara: 1, shehnai: 0.6, crickets: 0.3 },
    night: { crowd: 0.7, nagara: 1, shehnai: 0.5, crickets: 0.5, fire: 0.3 },
  },
  parab: {
    morning: { crowd: 0.5, mandar: 0.9, birds: 0.6, wind: 0.3 },
    afternoon: { crowd: 0.6, mandar: 1, birds: 0.4, wind: 0.4 },
    dusk: { crowd: 0.6, mandar: 1, crickets: 0.5, wind: 0.3, fire: 0.4 },
    night: { crowd: 0.5, mandar: 1, crickets: 0.7, fire: 0.6 },
  },
};
