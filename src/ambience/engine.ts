import type { WorldId } from '../data/worlds';
import type { Phase } from '../time/dayPhase';
import type { Ambience } from './types';
import { RECIPES } from './recipes';
import { TRIM, createLayer, makeNoise, makeReverb, type Layer, type LayerId, type Shared } from './layers';

/**
 * Master level for the ambience bus. A typical world mixes 3–5 layers at ~−24 dBFS each, so 0.4 lands the
 * bus around −28 dBFS: roughly 14 dB under a mastered song at the same volume setting. Ducks ~3 dB more
 * while a song is actually playing.
 */
const AMBIENCE_LEVEL = 0.4;
const DUCK = 0.7;
const FADE = 0.6; // setTargetAtTime constant, ≈ 1.5–2 s to settle
const LOOKAHEAD = 1.0; // seconds of events scheduled ahead
const TICK_MS = 250;

export function createAmbience(ctx: AudioContext): Ambience {
  const r = Math.random;
  const master = ctx.createGain();
  master.gain.value = 0;
  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -18;
  comp.ratio.value = 3;
  master.connect(comp).connect(ctx.destination);

  const reverb = makeReverb(ctx, 2.8, r);
  const wet = ctx.createGain();
  wet.gain.value = 0.35;
  reverb.connect(wet).connect(master);

  const shared: Shared = {
    ctx,
    white: makeNoise(ctx, 2, false, r),
    pink: makeNoise(ctx, 4, true, r),
    reverb,
  };

  const layers = new Map<LayerId, Layer>();
  const levels = new Map<LayerId, number>();
  let world: WorldId = 'love';
  let phase: Phase = 'dusk';
  let volume = 70;
  let enabled = true;
  let ducked = false;
  let timer: ReturnType<typeof setInterval> | undefined;
  let scheduledTo = 0;

  const applyMaster = () => {
    const v = enabled ? (volume / 100) * AMBIENCE_LEVEL * (ducked ? DUCK : 1) : 0;
    master.gain.setTargetAtTime(v, ctx.currentTime, 0.25);
  };

  const applyRecipe = () => {
    const want = RECIPES[world][phase];
    const t = ctx.currentTime;
    for (const [id, lvl] of Object.entries(want) as [LayerId, number][]) {
      if (!layers.has(id)) {
        const layer = createLayer(id, shared, r);
        layer.out.gain.value = 0;
        layer.out.connect(master);
        layers.set(id, layer);
      }
      levels.set(id, lvl);
    }
    for (const [id, layer] of layers) {
      const lvl = want[id] ?? 0;
      levels.set(id, lvl);
      layer.out.gain.setTargetAtTime(lvl * TRIM[id], t, FADE);
    }
  };

  const tick = () => {
    const now = ctx.currentTime;
    const from = Math.max(scheduledTo, now);
    const to = now + LOOKAHEAD;
    if (to <= from) return;
    for (const [id, layer] of layers) if ((levels.get(id) ?? 0) > 0) layer.tick?.(from, to);
    scheduledTo = to;
  };

  // Browsers suspend audio in background tabs on some platforms; resume on return.
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && ctx.state !== 'running') void ctx.resume();
  });

  return {
    start(w, p) {
      world = w;
      phase = p;
      applyRecipe();
      applyMaster();
      if (!timer) timer = setInterval(tick, TICK_MS);
      tick();
    },
    setWorld(w) {
      world = w;
      applyRecipe();
    },
    setPhase(p) {
      phase = p;
      applyRecipe();
    },
    setVolume(v) {
      volume = v;
      applyMaster();
    },
    setEnabled(on) {
      enabled = on;
      applyMaster();
      if (on && ctx.state !== 'running') void ctx.resume();
    },
    duck(on) {
      ducked = on;
      applyMaster();
    },
    crackle() {
      // Radio static when the dial moves. Plays even with village sounds off: it's UI feedback.
      const t = ctx.currentTime;
      const src = ctx.createBufferSource();
      src.buffer = shared.white;
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.value = 2400;
      bp.Q.value = 0.6;
      const g = ctx.createGain();
      const peak = (volume / 100) * 0.12;
      g.gain.setValueAtTime(0, t);
      for (let i = 0; i < 8; i++) g.gain.setValueAtTime(peak * (0.3 + Math.random() * 0.7), t + i * 0.035);
      g.gain.linearRampToValueAtTime(0, t + 0.35);
      src.connect(bp).connect(g).connect(ctx.destination);
      src.start(t, Math.random());
      src.stop(t + 0.4);
    },
  };
}
