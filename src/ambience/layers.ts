// Synthesised ambience layers. No recorded audio: everything here is generated in the browser,
// so there's nothing to license and nothing to download. See CREDITS.md.
//
// Each layer writes into its own `out` gain node. Continuous layers run all the time; event layers
// implement `tick(from, to)`, which schedules sounds in the [from, to) window of context time.
// The engine calls tick() from a timer in real time; the balance test calls it once for a whole
// offline render.

export type LayerId =
  | 'crickets' | 'wind' | 'birds' | 'mandar' | 'nagara' | 'shehnai'
  | 'crowd' | 'fire' | 'engine' | 'horn';

export interface Layer {
  out: GainNode;
  tick?(from: number, to: number): void;
}

export interface Shared {
  ctx: BaseAudioContext;
  white: AudioBuffer;
  pink: AudioBuffer;
  reverb: AudioNode; // input of a shared reverb send
}

export type Rand = () => number;

const rand = (r: Rand, lo: number, hi: number) => lo + r() * (hi - lo);

export function makeNoise(ctx: BaseAudioContext, seconds: number, pink: boolean, r: Rand): AudioBuffer {
  const len = Math.floor(ctx.sampleRate * seconds);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
  for (let i = 0; i < len; i++) {
    const w = r() * 2 - 1;
    if (!pink) {
      d[i] = w;
      continue;
    }
    // Paul Kellet's refined pink filter.
    b0 = 0.99886 * b0 + w * 0.0555179;
    b1 = 0.99332 * b1 + w * 0.0750759;
    b2 = 0.969 * b2 + w * 0.153852;
    b3 = 0.8665 * b3 + w * 0.3104856;
    b4 = 0.55 * b4 + w * 0.5329522;
    b5 = -0.7616 * b5 - w * 0.016898;
    d[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11;
    b6 = w * 0.115926;
  }
  return buf;
}

export function makeReverb(ctx: BaseAudioContext, seconds: number, r: Rand): ConvolverNode {
  const len = Math.floor(ctx.sampleRate * seconds);
  const ir = ctx.createBuffer(2, len, ctx.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = ir.getChannelData(ch);
    for (let i = 0; i < len; i++) d[i] = (r() * 2 - 1) * Math.pow(1 - i / len, 3);
  }
  const conv = ctx.createConvolver();
  conv.buffer = ir;
  return conv;
}

function loopNoise(s: Shared, which: 'white' | 'pink', offset = 0): AudioBufferSourceNode {
  const src = s.ctx.createBufferSource();
  src.buffer = s[which];
  src.loop = true;
  src.start(0, offset % src.buffer.duration);
  return src;
}

function lfo(ctx: BaseAudioContext, freq: number, depth: number, target: AudioParam, type: OscillatorType = 'sine') {
  const o = ctx.createOscillator();
  o.type = type;
  o.frequency.value = freq;
  const g = ctx.createGain();
  g.gain.value = depth;
  o.connect(g).connect(target);
  o.start();
  return o;
}

function panner(ctx: BaseAudioContext, pan: number): AudioNode {
  if (typeof ctx.createStereoPanner !== 'function') return ctx.createGain();
  const p = ctx.createStereoPanner();
  p.pan.value = pan;
  return p;
}

/** Envelope helper: attack/decay on a gain param. */
function env(p: AudioParam, t: number, peak: number, a: number, d: number) {
  p.setValueAtTime(0, t);
  p.linearRampToValueAtTime(peak, t + a);
  p.exponentialRampToValueAtTime(0.0001, t + a + d);
}

// ---------------------------------------------------------------------------------------------

/** Crickets: two gated high sines. A fast square gate makes the pulses, a slow one makes the chirps. */
function crickets(s: Shared): Layer {
  const { ctx } = s;
  const out = ctx.createGain();
  const voice = (freq: number, pulse: number, chirp: number, pan: number) => {
    const o = ctx.createOscillator();
    o.frequency.value = freq;
    const g1 = ctx.createGain();
    g1.gain.value = 0.5;
    lfo(ctx, pulse, 0.5, g1.gain, 'square');
    const g2 = ctx.createGain();
    g2.gain.value = 0.5;
    lfo(ctx, chirp, 0.5, g2.gain, 'square');
    o.connect(g1).connect(g2).connect(panner(ctx, pan)).connect(out);
    o.start();
  };
  voice(4450, 31, 1.7, -0.5);
  voice(4720, 27, 2.3, 0.4);
  voice(4100, 35, 1.1, 0.05);
  return { out };
}

/** Wind through sal leaves: band-passed pink noise with slow gusts, plus a leafy hiss. */
function wind(s: Shared): Layer {
  const { ctx } = s;
  const out = ctx.createGain();
  const bp = ctx.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.value = 600;
  bp.Q.value = 0.7;
  lfo(ctx, 0.07, 260, bp.frequency);
  const gust = ctx.createGain();
  gust.gain.value = 0.6;
  lfo(ctx, 0.11, 0.35, gust.gain);
  loopNoise(s, 'pink').connect(bp).connect(gust).connect(out);

  const hp = ctx.createBiquadFilter();
  hp.type = 'highpass';
  hp.frequency.value = 3500;
  const leaves = ctx.createGain();
  leaves.gain.value = 0.12;
  lfo(ctx, 0.17, 0.09, leaves.gain);
  loopNoise(s, 'white', 0.7).connect(hp).connect(leaves).connect(out);
  return { out };
}

/** Birds: short FM-ish chirp phrases from random directions. */
function birds(s: Shared, r: Rand): Layer {
  const { ctx } = s;
  const out = ctx.createGain();
  let next = 0;
  const phrase = (t: number) => {
    const p = panner(ctx, rand(r, -0.8, 0.8));
    p.connect(out);
    const base = rand(r, 2200, 3600);
    const n = 2 + Math.floor(r() * 4);
    for (let i = 0; i < n; i++) {
      const t0 = t + i * rand(r, 0.09, 0.16);
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.frequency.setValueAtTime(base, t0);
      o.frequency.exponentialRampToValueAtTime(base * rand(r, 1.2, 1.6), t0 + 0.05);
      o.frequency.exponentialRampToValueAtTime(base * 0.9, t0 + 0.09);
      env(g.gain, t0, 0.5, 0.01, 0.08);
      o.connect(g).connect(p);
      o.start(t0);
      o.stop(t0 + 0.12);
    }
  };
  return {
    out,
    tick(from, to) {
      if (next < from) next = from + rand(r, 0.2, 2);
      while (next < to) {
        phrase(next);
        next += rand(r, 1.2, 5.5);
      }
    },
  };
}

/** Membrane hit: pitched sine with a falling pitch, plus a noise slap. */
function drumHit(
  s: Shared, dest: AudioNode, t: number, f0: number, f1: number, decay: number, amp: number, slap: number,
) {
  const { ctx } = s;
  t = Math.max(t, 0); // humanising jitter can land just before zero
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.frequency.setValueAtTime(f0, t);
  o.frequency.exponentialRampToValueAtTime(f1, t + decay * 0.4);
  env(g.gain, t, amp, 0.004, decay);
  o.connect(g).connect(dest);
  o.start(t);
  o.stop(t + decay + 0.05);
  if (slap > 0) {
    const n = ctx.createBufferSource();
    n.buffer = s.white;
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = f0 * 6;
    bp.Q.value = 1.2;
    const ng = ctx.createGain();
    env(ng.gain, t, slap, 0.002, 0.06);
    n.connect(bp).connect(ng).connect(dest);
    n.start(t, Math.random() * 1.5);
    n.stop(t + 0.1);
  }
}

/**
 * Distant mandar: a bass head ("dhin") and a treble head ("ta") in a lilting 6-beat cycle, played for
 * a few cycles every so often, through a low-pass and the shared reverb so it sounds far away.
 */
function mandarLayer(s: Shared, r: Rand, gapLo: number, gapHi: number): Layer {
  const { ctx } = s;
  const out = ctx.createGain();
  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 1400;
  lp.connect(out);
  const send = ctx.createGain();
  send.gain.value = 0.6;
  lp.connect(send).connect(s.reverb);
  // 1 = dhin (bass), 2 = ta (treble), 0 = rest. Two-bar jhumar-ish lilt.
  const patterns = [
    [1, 0, 2, 1, 2, 0, 1, 0, 2, 2, 1, 0],
    [1, 2, 0, 1, 2, 2, 1, 0, 2, 1, 2, 0],
  ];
  let next = 0;
  const play = (t: number) => {
    const bpm = rand(r, 150, 180);
    const step = 60 / bpm / 2;
    const pat = patterns[Math.floor(r() * patterns.length)];
    const cycles = 3 + Math.floor(r() * 4);
    for (let c = 0; c < cycles; c++) {
      pat.forEach((h, i) => {
        const tt = t + (c * pat.length + i) * step + rand(r, -0.008, 0.008);
        if (h === 1) drumHit(s, lp, tt, 150, 82, 0.45, 0.9, 0.12);
        if (h === 2) drumHit(s, lp, tt, 420, 360, 0.16, 0.45, 0.35);
      });
    }
    return cycles * pat.length * step;
  };
  return {
    out,
    tick(from, to) {
      if (next < from) next = from + rand(r, 1, 6);
      while (next < to) next += play(next) + rand(r, gapLo, gapHi);
    },
  };
}

/** Wedding drums: nagara (deep kettle) with dhak rolls on top. Busier than the mandar. */
function nagaraLayer(s: Shared, r: Rand): Layer {
  const { ctx } = s;
  const out = ctx.createGain();
  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 1800;
  lp.connect(out);
  const send = ctx.createGain();
  send.gain.value = 0.4;
  lp.connect(send).connect(s.reverb);
  let next = 0;
  const play = (t: number) => {
    const step = 60 / rand(r, 120, 140) / 4;
    const bars = 2 + Math.floor(r() * 3);
    let tt = t;
    for (let b = 0; b < bars * 16; b++) {
      const beat = b % 16;
      if (beat % 4 === 0) drumHit(s, lp, tt, 95, 50, 0.6, 1, 0.1);
      if (beat === 6 || beat === 14) drumHit(s, lp, tt, 95, 55, 0.4, 0.6, 0.1);
      if (beat % 2 === 1 || r() < 0.35) drumHit(s, lp, tt, 260, 200, 0.12, 0.35 + r() * 0.2, 0.45);
      tt += step;
    }
    // finishing roll
    for (let i = 0; i < 10; i++) drumHit(s, lp, tt + i * step * 0.5, 280, 220, 0.1, 0.2 + i * 0.04, 0.4);
    return tt + 10 * step * 0.5 - t;
  };
  return {
    out,
    tick(from, to) {
      if (next < from) next = from + rand(r, 0.5, 3);
      while (next < to) next += play(next) + rand(r, 4, 14);
    },
  };
}

/** A reedy, shehnai-like line far off: two filtered saws with vibrato, gliding between scale notes. */
function shehnai(s: Shared, r: Rand): Layer {
  const { ctx } = s;
  const out = ctx.createGain();
  const bp = ctx.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.value = 1300;
  bp.Q.value = 1.6;
  const amp = ctx.createGain();
  amp.gain.value = 0;
  bp.connect(amp).connect(out);
  const send = ctx.createGain();
  send.gain.value = 0.7;
  amp.connect(send).connect(s.reverb);
  const root = 293.66; // D4
  const scale = [0, 2, 3, 5, 7, 8, 10, 12].map((st) => root * Math.pow(2, st / 12));
  const oscs = [0, 7].map((detune) => {
    const o = ctx.createOscillator();
    o.type = 'sawtooth';
    o.frequency.value = root;
    o.detune.value = detune;
    lfo(ctx, 5.6, 7, o.frequency);
    o.connect(bp);
    o.start();
    return o;
  });
  let next = 0;
  const phrase = (t: number) => {
    let tt = t;
    const notes = 4 + Math.floor(r() * 6);
    amp.gain.setTargetAtTime(0.35, tt, 0.15);
    for (let i = 0; i < notes; i++) {
      const f = scale[Math.floor(r() * scale.length)];
      oscs.forEach((o) => o.frequency.setTargetAtTime(f, tt, 0.05));
      tt += rand(r, 0.25, 0.8);
    }
    amp.gain.setTargetAtTime(0, tt, 0.3);
    return tt - t + 1;
  };
  return {
    out,
    tick(from, to) {
      if (next < from) next = from + rand(r, 1, 5);
      while (next < to) next += phrase(next) + rand(r, 3, 10);
    },
  };
}

/** Crowd murmur: pink noise through three wandering vowel-ish band-passes. */
function crowd(s: Shared): Layer {
  const { ctx } = s;
  const out = ctx.createGain();
  [
    [320, 0.13, 0.9],
    [850, 0.21, 0.6],
    [1600, 0.29, 0.35],
  ].forEach(([f, rate, lvl], i) => {
    const bp = ctx.createBiquadFilter();
    bp.type = 'bandpass';
    bp.frequency.value = f;
    bp.Q.value = 3;
    lfo(ctx, rate * 3.1, f * 0.25, bp.frequency);
    const g = ctx.createGain();
    g.gain.value = lvl;
    lfo(ctx, rate * 5.3, lvl * 0.6, g.gain);
    loopNoise(s, 'pink', i * 1.3).connect(bp).connect(g).connect(out);
  });
  return { out };
}

/** Fire: a low rumble bed plus random crackles. */
function fire(s: Shared, r: Rand): Layer {
  const { ctx } = s;
  const out = ctx.createGain();
  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 220;
  const bed = ctx.createGain();
  bed.gain.value = 0.5;
  loopNoise(s, 'pink', 2.1).connect(lp).connect(bed).connect(out);
  const hp = ctx.createBiquadFilter();
  hp.type = 'highpass';
  hp.frequency.value = 1800;
  hp.connect(out);
  let next = 0;
  return {
    out,
    tick(from, to) {
      if (next < from) next = from;
      while (next < to) {
        const src = ctx.createBufferSource();
        src.buffer = s.white;
        const g = ctx.createGain();
        env(g.gain, next, rand(r, 0.2, 1) ** 2, 0.001, rand(r, 0.004, 0.03));
        src.connect(g).connect(hp);
        src.start(next, r() * 1.5);
        src.stop(next + 0.05);
        next += r() < 0.15 ? rand(r, 0.01, 0.04) : rand(r, 0.08, 0.5);
      }
    },
  };
}

/** Trekker engine: detuned low saw/square through a low-pass, with piston chug and rpm drift. */
function engine(s: Shared, r: Rand): Layer {
  const { ctx } = s;
  const out = ctx.createGain();
  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 320;
  lp.Q.value = 2;
  const chug = ctx.createGain();
  chug.gain.value = 0.7;
  lfo(ctx, 7.5, 0.25, chug.gain);
  lp.connect(chug).connect(out);
  const oscs = (
    [
      ['sawtooth', 46, 0],
      ['square', 92, 6],
      ['sawtooth', 46.7, -8],
    ] as [OscillatorType, number, number][]
  ).map(([type, f, det]) => {
    const o = ctx.createOscillator();
    o.type = type;
    o.frequency.value = f;
    o.detune.value = det;
    o.connect(lp);
    o.start();
    return [o, f] as const;
  });
  const rumble = ctx.createBiquadFilter();
  rumble.type = 'lowpass';
  rumble.frequency.value = 160;
  const rg = ctx.createGain();
  rg.gain.value = 0.8;
  loopNoise(s, 'pink', 3.3).connect(rumble).connect(rg).connect(out);
  let next = 0;
  return {
    out,
    tick(from, to) {
      if (next < from) next = from + rand(r, 2, 6);
      while (next < to) {
        // Change gear / climb: rev up and settle.
        const k = rand(r, 1.15, 1.5);
        oscs.forEach(([o, base]) => {
          o.frequency.setTargetAtTime(base * k, next, 0.6);
          o.frequency.setTargetAtTime(base, next + rand(r, 1.5, 3), 0.8);
        });
        lp.frequency.setTargetAtTime(480, next, 0.6);
        lp.frequency.setTargetAtTime(320, next + 2, 0.8);
        next += rand(r, 6, 16);
      }
    },
  };
}

/** Horn: a two-tone "paa-paa", now and then. */
function horn(s: Shared, r: Rand): Layer {
  const { ctx } = s;
  const out = ctx.createGain();
  const lp = ctx.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = 2200;
  lp.connect(out);
  let next = 0;
  const honk = (t: number, len: number) => {
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.5, t + 0.02);
    g.gain.setValueAtTime(0.5, t + len - 0.04);
    g.gain.linearRampToValueAtTime(0, t + len);
    g.connect(lp);
    [392, 494].forEach((f) => {
      const o = ctx.createOscillator();
      o.type = 'square';
      o.frequency.value = f;
      o.connect(g);
      o.start(t);
      o.stop(t + len + 0.02);
    });
  };
  return {
    out,
    tick(from, to) {
      if (next < from) next = from + rand(r, 4, 14);
      while (next < to) {
        const n = 1 + Math.floor(r() * 3);
        for (let i = 0; i < n; i++) honk(next + i * 0.32, i === n - 1 ? rand(r, 0.25, 0.6) : 0.18);
        next += rand(r, 14, 40);
      }
    },
  };
}

export function createLayer(id: LayerId, s: Shared, r: Rand): Layer {
  switch (id) {
    case 'crickets': return crickets(s);
    case 'wind': return wind(s);
    case 'birds': return birds(s, r);
    case 'mandar': return mandarLayer(s, r, 25, 70);
    case 'nagara': return nagaraLayer(s, r);
    case 'shehnai': return shehnai(s, r);
    case 'crowd': return crowd(s);
    case 'fire': return fire(s, r);
    case 'engine': return engine(s, r);
    case 'horn': return horn(s, r);
  }
}

/**
 * Per-layer trims so each layer at level 1 sits at a similar loudness (about −24 dBFS RMS for
 * continuous layers; intermittent ones like birds, horn and drums are matched by peak instead,
 * since their average includes silence). Measured with dev/ambience-balance.html; re-run it after
 * changing a layer.
 */
export const TRIM: Record<LayerId, number> = {
  crickets: 0.08, wind: 0.6, birds: 0.8, mandar: 0.5, nagara: 0.4, shehnai: 0.8,
  crowd: 1.1, fire: 0.6, engine: 0.08, horn: 0.35,
};
