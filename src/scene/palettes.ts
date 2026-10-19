import type { Phase } from '../time/dayPhase';

// Everything that changes with time of day. Land colours are fixed; a multiply-blended tint layer
// darkens/warms them, and a "lights" layer above the tint (fire, lamps, stars) carries the glow.

interface Palette {
  sky1: string; // top
  sky2: string;
  sky3: string; // horizon
  sun: string;
  sunY: number; // px offset in scene units
  sunO: number;
  moonO: number;
  starO: number;
  tint: string;
  tintO: number;
  glow: number; // lamps, fire glow
  fire: number; // flames
  smoke: number;
  birds: number;
  firefly: number;
  cloud: string;
  cloudO: number;
  haze: string; // mist over far hills
  hazeO: number;
}

export const PALETTES: Record<Phase, Palette> = {
  morning: {
    sky1: '#9cc7e0', sky2: '#f2d9b1', sky3: '#f7c98f', sun: '#fff1c4', sunY: -60, sunO: 1,
    moonO: 0, starO: 0, tint: '#ffe9c7', tintO: 0.12, glow: 0, fire: 0, smoke: 0.55, birds: 1,
    firefly: 0, cloud: '#fff8ec', cloudO: 0.85, haze: '#fdf3e2', hazeO: 0.55,
  },
  afternoon: {
    sky1: '#6fb1dc', sky2: '#a9d3ea', sky3: '#e8eedb', sun: '#fffbe8', sunY: -300, sunO: 1,
    moonO: 0, starO: 0, tint: '#ffffff', tintO: 0, glow: 0, fire: 0, smoke: 0.35, birds: 0.8,
    firefly: 0, cloud: '#ffffff', cloudO: 0.9, haze: '#f4f7f2', hazeO: 0.25,
  },
  dusk: {
    sky1: '#3d3f78', sky2: '#c75f5a', sky3: '#f7a54b', sun: '#ffcf7a', sunY: 90, sunO: 1,
    moonO: 0.25, starO: 0.25, tint: '#c4708a', tintO: 0.38, glow: 0.7, fire: 1, smoke: 0.5,
    birds: 0.35, firefly: 0.35, cloud: '#f2a07a', cloudO: 0.75, haze: '#e7927a', hazeO: 0.35,
  },
  night: {
    sky1: '#0b1030', sky2: '#1a2452', sky3: '#2c3466', sun: '#ffcf7a', sunY: 300, sunO: 0,
    moonO: 1, starO: 1, tint: '#1f2a5c', tintO: 0.72, glow: 1, fire: 1, smoke: 0.3, birds: 0,
    firefly: 1, cloud: '#3a4478', cloudO: 0.5, haze: '#2a3366', hazeO: 0.3,
  },
};

const kebab = (k: string) => k.replace(/[A-Z]/g, (c) => '-' + c.toLowerCase());

export function paletteVars(p: Palette): string {
  return Object.entries(p)
    .map(([k, v]) => `--${kebab(k)}:${typeof v === 'number' && k === 'sunY' ? `${v}px` : v}`)
    .join(';');
}

/** CSS that sets the custom properties for each phase on <html data-phase="…">. */
export function paletteCss(): string {
  return (Object.keys(PALETTES) as Phase[])
    .map((ph) => `:root[data-phase=${ph}]{${paletteVars(PALETTES[ph])}}`)
    .join('\n');
}
