// Dev-only: renders each ambience layer offline at level 1 and prints its RMS (dBFS).
// Use the numbers to set TRIM in src/ambience/layers.ts so every layer sits near TARGET_DB.
import { createLayer, makeNoise, makeReverb, TRIM, type LayerId } from '../src/ambience/layers';

const TARGET_DB = -24;
const SECONDS = 40;
const ids: LayerId[] = ['crickets', 'wind', 'birds', 'mandar', 'nagara', 'shehnai', 'crowd', 'fire', 'engine', 'horn'];

function seeded(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}

async function measure(id: LayerId, trimmed: boolean) {
  const ctx = new OfflineAudioContext(2, 44100 * SECONDS, 44100);
  const r = seeded(42);
  const reverb = makeReverb(ctx, 2.8, r);
  const wet = ctx.createGain();
  wet.gain.value = 0.35;
  reverb.connect(wet).connect(ctx.destination);
  const layer = createLayer(id, { ctx, white: makeNoise(ctx, 2, false, r), pink: makeNoise(ctx, 4, true, r), reverb }, r);
  layer.out.gain.value = trimmed ? TRIM[id] : 1;
  layer.out.connect(ctx.destination);
  layer.tick?.(0, SECONDS);
  const buf = await ctx.startRendering();
  let sum = 0;
  let peak = 0;
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) {
    sum += d[i] * d[i];
    peak = Math.max(peak, Math.abs(d[i]));
  }
  const rms = Math.sqrt(sum / d.length);
  return { rmsDb: 20 * Math.log10(rms), peakDb: 20 * Math.log10(peak) };
}

const out = document.getElementById('out')!;
const rows: string[] = [];
for (const id of ids) {
  const raw = await measure(id, false);
  const trimmed = await measure(id, true);
  const suggest = Math.pow(10, (TARGET_DB - raw.rmsDb) / 20);
  rows.push(
    `${id.padEnd(9)} raw ${raw.rmsDb.toFixed(1)} dB (peak ${raw.peakDb.toFixed(1)})  trimmed ${trimmed.rmsDb.toFixed(1)} dB (peak ${trimmed.peakDb.toFixed(1)})  suggested TRIM ${suggest.toFixed(3)}`,
  );
}
out.textContent = rows.join('\n') + '\nDONE';
