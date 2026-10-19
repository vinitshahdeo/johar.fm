// Reusable, hand-drawn-in-code scene parts. Each returns an SVG fragment string.
// All artwork is original geometry; motifs are inspired by, not copied from, Sohrai wall painting.

export const C = {
  laal: '#b3202a',
  laalDark: '#7e1219',
  saree: '#f4ebdd',
  sareeShade: '#ddd0bb',
  skin: '#6e4129',
  skinDark: '#4f2d1c',
  hair: '#1a110c',
  leaf: '#3f6b35',
  leafDark: '#2c4a26',
  leafDeep: '#1f3a1c',
  leafLight: '#5d8a45',
  trunk: '#4a3426',
  trunkDark: '#33231a',
  laterite: '#a2482b',
  lateriteDark: '#7e3a22',
  earth: '#b86a43',
  earthLight: '#c98458',
  packed: '#c58a5c',
  wall: '#d9b48a',
  wallLow: '#8f3b22',
  kaolin: '#f3eadb',
  sohraiBlack: '#2a1d16',
  ochre: '#c98a2e',
  roof: '#6d3424',
  roofDark: '#4d2318',
  wood: '#5b3a24',
  clay: '#b5643a',
  leather: '#e5cfa1',
  brass: '#c9a046',
  marigold: '#f2a516',
  marigoldDeep: '#e07b12',
  mango: '#4e7d2f',
};

/** Deterministic PRNG so scenes render identically on server, client and OG render. */
export function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const r1 = (n: number) => Math.round(n * 10) / 10;

export function defs(): string {
  return `<defs>
  <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" style="stop-color:var(--sky1)"/>
    <stop offset=".55" style="stop-color:var(--sky2)"/>
    <stop offset="1" style="stop-color:var(--sky3)"/>
  </linearGradient>
  <radialGradient id="glow">
    <stop offset="0" stop-color="#ffc56b" stop-opacity=".85"/>
    <stop offset=".35" stop-color="#ff9a3d" stop-opacity=".35"/>
    <stop offset="1" stop-color="#ff7a1a" stop-opacity="0"/>
  </radialGradient>
  <radialGradient id="lampglow">
    <stop offset="0" stop-color="#ffe3a0" stop-opacity=".95"/>
    <stop offset=".4" stop-color="#ffb84d" stop-opacity=".3"/>
    <stop offset="1" stop-color="#ffb84d" stop-opacity="0"/>
  </radialGradient>
  <radialGradient id="sunglow">
    <stop offset="0" style="stop-color:var(--sun)" stop-opacity=".9"/>
    <stop offset="1" style="stop-color:var(--sun)" stop-opacity="0"/>
  </radialGradient>
  <linearGradient id="ground" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="${C.earth}"/>
    <stop offset="1" stop-color="${C.lateriteDark}"/>
  </linearGradient>
</defs>`;
}

export function sky(w: number, h: number): string {
  return `<rect width="${w}" height="${h}" fill="url(#sky)"/>`;
}

export function sun(cx: number, cy: number): string {
  return `<g class="sun" style="transform:translateY(var(--sun-y));opacity:var(--sun-o)">
  <circle cx="${cx}" cy="${cy}" r="170" fill="url(#sunglow)"/>
  <circle cx="${cx}" cy="${cy}" r="46" style="fill:var(--sun)"/>
</g>`;
}

export function moon(cx: number, cy: number): string {
  return `<g style="opacity:var(--moon-o)">
  <circle cx="${cx}" cy="${cy}" r="90" fill="#fdf4d8" opacity=".08"/>
  <circle cx="${cx}" cy="${cy}" r="30" fill="#fbf1d2"/>
  <circle cx="${cx + 12}" cy="${cy - 6}" r="27" fill="#e9dcb5" opacity=".35"/>
</g>`;
}

export type Occluder = (x: number, y: number) => boolean;

/** Stars live in the lights layer (above the tint), so skip any that would sit on a tree or roof. */
export function stars(w: number, maxY: number, n: number, seed: number, hidden: Occluder = () => false): string {
  const r = rng(seed);
  let s = '';
  for (let i = 0; i < n; i++) {
    const x = r1(r() * w);
    const y = r1(r() * maxY * (0.3 + 0.7 * r()));
    const rad = r1(0.8 + r() * 1.8);
    if (hidden(x, y)) continue;
    const tw = i % 5 === 0 ? ' class="twinkle" style="animation-delay:-' + r1(r() * 4) + 's"' : '';
    s += `<circle cx="${x}" cy="${y}" r="${rad}"${tw}/>`;
  }
  return `<g fill="#fff8e2" style="opacity:var(--star-o)">${s}</g>`;
}

export function cloud(x: number, y: number, s: number): string {
  return `<g transform="translate(${x} ${y}) scale(${s})">
  <ellipse cx="0" cy="0" rx="90" ry="22"/><ellipse cx="-38" cy="-12" rx="42" ry="26"/>
  <ellipse cx="22" cy="-20" rx="48" ry="32"/><ellipse cx="66" cy="-6" rx="36" ry="20"/>
</g>`;
}

export function clouds(items: [number, number, number][]): string {
  return `<g class="drift" style="fill:var(--cloud);opacity:var(--cloud-o)">${items
    .map(([x, y, s]) => cloud(x, y, s))
    .join('')}</g>`;
}

export function birds(x: number, y: number): string {
  const b = (dx: number, dy: number, s: number) =>
    `<path transform="translate(${dx} ${dy}) scale(${s})" d="M-10 0 Q-5 -6 0 0 Q5 -6 10 0" />`;
  return `<g class="birds" style="opacity:var(--birds)" fill="none" stroke="#2a2420" stroke-width="2" stroke-linecap="round">
  <g transform="translate(${x} ${y})">${b(0, 0, 1.2)}${b(26, -14, 1)}${b(48, 6, 0.9)}${b(-24, 12, 0.8)}${b(70, -8, 0.7)}</g>
</g>`;
}

/** A row of distant, rounded tree crowns along a ridge. */
export function treeLine(
  x0: number,
  x1: number,
  baseY: (x: number) => number,
  color: string,
  seed: number,
): string {
  const r = rng(seed);
  let s = '';
  for (let x = x0; x < x1; x += 14 + r() * 10) {
    const rad = 12 + r() * 16;
    s += `<circle cx="${r1(x)}" cy="${r1(baseY(x) - rad * 0.5)}" r="${r1(rad)}"/>`;
  }
  return `<g fill="${color}">${s}</g>`;
}

/** Rough footprint of a salTree() crown and trunk, for keeping stars off it. */
export function salTreeOccluder(x: number, baseY: number, height: number, spread: number): Occluder {
  const topY = baseY - height;
  const rx = spread * 1.4;
  const ry = spread * 0.85;
  const tw = Math.max(10, height * 0.045) + 4;
  return (px, py) =>
    ((px - x) / rx) ** 2 + ((py - topY) / ry) ** 2 < 1 || (Math.abs(px - x) < tw && py > topY && py < baseY);
}

/**
 * A sal tree: tall straight trunk, dense rounded crown made of clumps.
 * (x, baseY) is where the trunk meets the ground.
 */
export function salTree(x: number, baseY: number, height: number, spread: number, seed: number): string {
  const r = rng(seed);
  const topY = baseY - height;
  const tw = Math.max(10, height * 0.045);
  const trunk = `<path d="M${x - tw} ${baseY} C${x - tw * 0.8} ${baseY - height * 0.5}, ${x - tw * 0.5} ${topY + height * 0.25}, ${x - tw * 0.35} ${topY + 40}
    L${x + tw * 0.35} ${topY + 40} C${x + tw * 0.5} ${topY + height * 0.25}, ${x + tw * 0.8} ${baseY - height * 0.5}, ${x + tw} ${baseY} Z" fill="${C.trunk}"/>
  <path d="M${x + tw * 0.2} ${baseY} C${x + tw * 0.3} ${baseY - height * 0.5}, ${x + tw * 0.25} ${topY + height * 0.3}, ${x + tw * 0.15} ${topY + 60}" stroke="${C.trunkDark}" stroke-width="${r1(tw * 0.35)}" fill="none" opacity=".6"/>
  <path d="M${x} ${topY + height * 0.32} q${-spread * 0.3} -20 ${-spread * 0.45} -70" stroke="${C.trunk}" stroke-width="${r1(tw * 0.4)}" fill="none" stroke-linecap="round"/>
  <path d="M${x} ${topY + height * 0.22} q${spread * 0.3} -16 ${spread * 0.5} -60" stroke="${C.trunk}" stroke-width="${r1(tw * 0.35)}" fill="none" stroke-linecap="round"/>`;
  const clumps = (color: string, n: number, sizeK: number, dy: number) => {
    let s = '';
    for (let i = 0; i < n; i++) {
      const a = r() * Math.PI * 2;
      const d = Math.sqrt(r());
      const cx = x + Math.cos(a) * spread * d;
      const cy = topY + dy + Math.sin(a) * spread * 0.5 * d;
      const rad = spread * (0.18 + r() * 0.16) * sizeK;
      s += `<circle cx="${r1(cx)}" cy="${r1(cy)}" r="${r1(rad)}"/>`;
    }
    return `<g fill="${color}">${s}</g>`;
  };
  const crown = `<g class="sway" style="animation-delay:-${r1(r() * 6)}s">
    ${clumps(C.leafDeep, 16, 1.1, 20)}${clumps(C.leafDark, 18, 1, 6)}${clumps(C.leaf, 16, 0.85, -8)}${clumps(C.leafLight, 9, 0.6, -24)}
  </g>`;
  return `<g>${trunk}${crown}</g>`;
}

/** Sohrai-inspired band: zigzag, dotted rows and a stylised bull. Drawn at (x, y) with width w, height h. */
export function sohraiBand(x: number, y: number, w: number, h: number, seed: number): string {
  const r = rng(seed);
  let zig = `M${x} ${y + h * 0.18}`;
  const step = 14;
  for (let i = 0, xx = x; xx <= x + w; i++, xx += step) zig += ` L${xx} ${y + (i % 2 ? h * 0.06 : h * 0.3)}`;
  let dots = '';
  for (let xx = x + 6; xx < x + w; xx += 12) dots += `<circle cx="${xx}" cy="${y + h * 0.92}" r="2.3"/>`;
  const bull = (bx: number, by: number, s: number, flip = false) =>
    `<g transform="translate(${bx} ${by}) scale(${flip ? -s : s} ${s})" fill="none" stroke="${C.sohraiBlack}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
      <path d="M-22 0 C-20 -12 12 -14 18 -4 L26 -12 M18 -4 L28 -2" />
      <path d="M-16 0 L-18 14 M-8 1 L-8 15 M8 0 L9 14 M14 -1 L17 13" />
      <path d="M-22 0 Q-28 4 -27 12" />
      <path d="M24 -14 q2 -6 -3 -9 M26 -11 q6 -4 3 -10" />
      <path d="M-14 -6 l3 -3 l3 3 l3 -3 l3 3 l3 -3 l3 3" stroke="${C.laal}"/>
    </g>`;
  const plant = (px: number, py: number) =>
    `<g transform="translate(${px} ${py})" fill="none" stroke="${C.sohraiBlack}" stroke-width="2" stroke-linecap="round">
      <path d="M0 14 V-14 M0 6 q-8 -2 -10 -10 M0 6 q8 -2 10 -10 M0 -2 q-6 -2 -8 -8 M0 -2 q6 -2 8 -8"/>
      <circle cx="0" cy="-16" r="3" fill="${C.laal}" stroke="none"/></g>`;
  let motifs = '';
  const n = Math.max(1, Math.floor(w / 90));
  for (let i = 0; i < n; i++) {
    const mx = x + (i + 0.5) * (w / n);
    motifs += i % 2 === 0 ? bull(mx, y + h * 0.58, h / 70, r() > 0.5) : plant(mx, y + h * 0.58);
  }
  return `<g>
  <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${C.kaolin}"/>
  <path d="${zig}" fill="none" stroke="${C.laal}" stroke-width="3"/>
  ${motifs}
  <g fill="${C.sohraiBlack}">${dots}</g>
</g>`;
}

/** Mud house with khapra (clay tile) roof and Sohrai painted wall. */
export function mudHouse(x: number, baseY: number, w: number, seed: number): string {
  const wallH = w * 0.36;
  const top = baseY - wallH;
  const roofH = w * 0.26;
  const over = w * 0.08;
  const doorW = w * 0.15;
  const doorX = x + w * 0.62;
  let rows = '';
  for (let i = 1; i < 5; i++) {
    const yy = top - roofH + (roofH * i) / 5;
    const inset = ((w / 2 + over) * i) / 5;
    rows += `<path d="M${x + w / 2 - inset} ${yy} H${x + w / 2 + inset}" stroke="${C.roofDark}" stroke-width="2.5"/>`;
  }
  return `<g>
  <rect x="${x}" y="${top}" width="${w}" height="${wallH}" fill="${C.wall}"/>
  ${sohraiBand(x, top + wallH * 0.12, w, wallH * 0.42, seed)}
  <rect x="${x}" y="${baseY - wallH * 0.3}" width="${w}" height="${wallH * 0.3}" fill="${C.wallLow}"/>
  <path d="M${x} ${baseY - wallH * 0.3} h${w}" stroke="${C.kaolin}" stroke-width="3" stroke-dasharray="2 7"/>
  <rect x="${doorX}" y="${baseY - wallH * 0.68}" width="${doorW}" height="${wallH * 0.68}" fill="${C.wood}"/>
  <rect class="door-light" x="${doorX + 4}" y="${baseY - wallH * 0.68 + 4}" width="${doorW - 8}" height="${wallH * 0.68 - 4}" fill="#2a1a12"/>
  <rect x="${doorX + 4}" y="${baseY - wallH * 0.68 + 4}" width="${doorW - 8}" height="${wallH * 0.68 - 4}" fill="#ffb347" style="opacity:var(--glow)"/>
  <path d="M${x - over} ${top + 6} L${x + w / 2} ${top - roofH} L${x + w + over} ${top + 6} Z" fill="${C.roof}"/>
  ${rows}
  <path d="M${x - over} ${top + 6} L${x + w / 2} ${top - roofH} L${x + w + over} ${top + 6}" fill="none" stroke="${C.roofDark}" stroke-width="5" stroke-linejoin="round"/>
  <rect x="${x - 4}" y="${baseY - 4}" width="${w + 8}" height="8" fill="${C.lateriteDark}"/>
</g>`;
}

interface FigureOpts {
  s?: number;
  flip?: boolean;
  armUp?: boolean;
  cls?: string;
  delay?: number;
}

/** Woman in a laal paar saree (white with red border), arms out to link hands in a jhumar line. */
export function woman(x: number, y: number, o: FigureOpts = {}): string {
  const s = o.s ?? 1;
  return `<g transform="translate(${x} ${y}) scale(${o.flip ? -s : s} ${s})"><g class="${o.cls ?? ''}" style="animation-delay:-${o.delay ?? 0}s">
  <path d="M-11 -92 L-26 -46 M11 -92 L26 -46" stroke="${C.skin}" stroke-width="6" stroke-linecap="round"/>
  <path d="M-4 0 V-8 M5 0 V-8" stroke="${C.skin}" stroke-width="5" stroke-linecap="round"/>
  <path d="M-12 -96 Q0 -100 12 -96 L18 -40 L24 -6 Q0 -2 -24 -6 L-18 -40 Z" fill="${C.saree}"/>
  <path d="M-24 -6 Q0 -2 24 -6 L23 -14 Q0 -10 -23 -14 Z" fill="${C.laal}"/>
  <path d="M-12 -96 L14 -56 L18 -62 L-4 -98 Z" fill="${C.laal}"/>
  <path d="M-18 -40 L18 -40" stroke="${C.sareeShade}" stroke-width="2"/>
  <rect x="-3" y="-104" width="6" height="8" fill="${C.skin}"/>
  <circle cx="0" cy="-112" r="10" fill="${C.skin}"/>
  <path d="M-10 -114 Q0 -126 10 -114 Q8 -120 0 -121 Q-8 -120 -10 -114Z" fill="${C.hair}"/>
  <circle cx="-9" cy="-114" r="6" fill="${C.hair}"/>
  <circle cx="-12" cy="-118" r="2.5" fill="${C.marigold}"/>
</g></g>`;
}

/** Standing man in dhoti and vest with a red gamchha over the shoulder. */
export function man(x: number, y: number, o: FigureOpts = {}): string {
  const s = o.s ?? 1;
  const arm = o.armUp ? 'M11 -90 L26 -118' : 'M11 -90 L18 -52';
  return `<g transform="translate(${x} ${y}) scale(${o.flip ? -s : s} ${s})"><g class="${o.cls ?? ''}" style="animation-delay:-${o.delay ?? 0}s">
  <path d="M-6 0 L-6 -30 M6 0 L7 -30" stroke="${C.skin}" stroke-width="6" stroke-linecap="round"/>
  <path d="M-13 -50 L13 -50 L15 -26 Q0 -22 -15 -26 Z" fill="${C.saree}"/>
  <path d="M-12 -94 Q0 -98 12 -94 L14 -50 L-14 -50 Z" fill="#e8e2d3"/>
  <path d="M-11 -90 L-18 -52 ${arm}" stroke="${C.skin}" stroke-width="6" stroke-linecap="round" fill="none"/>
  <path d="M-12 -95 L8 -50 L13 -54 L-4 -96 Z" fill="${C.laal}"/>
  <path d="M-8 -85 L-4 -77 M-2 -72 L2 -64" stroke="${C.saree}" stroke-width="1.5"/>
  <rect x="-3" y="-102" width="6" height="8" fill="${C.skin}"/>
  <circle cx="0" cy="-110" r="10" fill="${C.skin}"/>
  <path d="M-10 -112 Q0 -124 10 -112 L10 -116 Q0 -122 -10 -116Z" fill="${C.hair}"/>
</g></g>`;
}

/** Man sitting cross-legged on the ground. */
export function seatedMan(x: number, y: number, o: FigureOpts = {}): string {
  const s = o.s ?? 1;
  return `<g transform="translate(${x} ${y}) scale(${o.flip ? -s : s} ${s})">
  <ellipse cx="0" cy="-8" rx="28" ry="10" fill="${C.saree}"/>
  <path d="M-12 -62 Q0 -66 12 -62 L15 -14 L-15 -14 Z" fill="#e8e2d3"/>
  <path d="M-11 -58 L-20 -24 L-6 -16 M11 -58 L20 -24 L8 -16" stroke="${C.skin}" stroke-width="6" stroke-linecap="round" fill="none"/>
  <path d="M-12 -62 L10 -16 L14 -20 L-4 -64 Z" fill="${C.laal}"/>
  <rect x="-3" y="-70" width="6" height="8" fill="${C.skin}"/>
  <circle cx="0" cy="-78" r="10" fill="${C.skin}"/>
  <path d="M-10 -80 Q0 -92 10 -80 L10 -84 Q0 -90 -10 -84Z" fill="${C.hair}"/>
</g>`;
}

/** Mandar: barrel-shaped clay drum with two leather heads and lacing, lying on its side. */
export function mandar(x: number, y: number, s = 1, rot = 0): string {
  let lace = 'M-50 -13';
  for (let i = 0; i <= 10; i++) lace += ` L${-50 + i * 10} ${i % 2 ? 15 : -15}`;
  return `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">
  <ellipse cx="0" cy="22" rx="62" ry="6" fill="#000" opacity=".2"/>
  <path d="M-56 -14 Q0 -32 54 -12 L54 12 Q0 32 -56 14 Z" fill="${C.clay}"/>
  <path d="M-56 -14 Q0 -32 54 -12 L54 -4 Q0 -22 -56 -6 Z" fill="#cf7c4d" opacity=".7"/>
  <path d="${lace}" fill="none" stroke="#3b2416" stroke-width="1.6"/>
  <path d="M-30 -22 V22 M30 -21 V21" stroke="${C.laal}" stroke-width="4"/>
  <ellipse cx="-56" cy="0" rx="6" ry="14" fill="${C.leather}" stroke="#3b2416" stroke-width="2"/>
  <ellipse cx="54" cy="0" rx="5" ry="12" fill="${C.leather}" stroke="#3b2416" stroke-width="2"/>
  <circle cx="-56" cy="0" r="4" fill="#3b2416"/>
</g>`;
}

/** Nagara: large kettle drum with a pair of sticks resting on it. */
export function nagara(x: number, y: number, s = 1): string {
  return `<g transform="translate(${x} ${y}) scale(${s})">
  <ellipse cx="0" cy="40" rx="46" ry="7" fill="#000" opacity=".2"/>
  <path d="M-42 0 Q-40 40 0 44 Q40 40 42 0 Z" fill="#5a3a22"/>
  <path d="M-42 0 Q-40 40 0 44 Q-24 36 -28 2 Z" fill="#704a2c"/>
  <path d="M-40 10 L40 10 M-36 22 L36 22" stroke="${C.brass}" stroke-width="2" opacity=".7"/>
  <ellipse cx="0" cy="0" rx="42" ry="11" fill="${C.leather}" stroke="#3b2416" stroke-width="2.5"/>
  <path d="M-30 -18 L22 4 M-14 -24 L34 -2" stroke="${C.wood}" stroke-width="4" stroke-linecap="round"/>
</g>`;
}

/** Woven palm mat (patia). */
export function mat(x: number, y: number, w: number, h: number): string {
  let lines = '';
  for (let i = 1; i < 10; i++) lines += `<path d="M${x + (i * w) / 10 - h * 0.4} ${y + h} L${x + (i * w) / 10} ${y}"/>`;
  return `<g>
  <path d="M${x} ${y} L${x + w} ${y} L${x + w - h * 0.4} ${y + h} L${x - h * 0.4} ${y + h} Z" fill="#c9a35d"/>
  <g stroke="#a8823f" stroke-width="2">${lines}</g>
  <path d="M${x} ${y} L${x + w} ${y} L${x + w - h * 0.4} ${y + h} L${x - h * 0.4} ${y + h} Z" fill="none" stroke="${C.laal}" stroke-width="3"/>
</g>`;
}

/** Fire logs (always visible). */
export function fireLogs(x: number, y: number): string {
  return `<g transform="translate(${x} ${y})">
  <ellipse cx="0" cy="6" rx="46" ry="10" fill="#2a1a12" opacity=".6"/>
  <rect x="-40" y="-6" width="80" height="11" rx="5" fill="${C.trunkDark}" transform="rotate(-14)"/>
  <rect x="-40" y="-6" width="80" height="11" rx="5" fill="${C.trunk}" transform="rotate(16)"/>
  <circle cx="0" cy="0" r="10" fill="#3a1f12"/>
</g>`;
}

/** Fire flames + glow (lights layer). */
export function fireLight(x: number, y: number, glowR = 280): string {
  const flame = (dx: number, h: number, w: number, fill: string, d: number) =>
    `<path class="flame" style="animation-delay:-${d}s" d="M${dx} 0 C${dx - w} -${h * 0.2} ${dx - w * 0.7} -${h * 0.6} ${dx} -${h} C${dx + w * 0.7} -${h * 0.6} ${dx + w} -${h * 0.2} ${dx} 0Z" fill="${fill}"/>`;
  return `<g transform="translate(${x} ${y})">
  <circle class="glow-pulse" cx="0" cy="-20" r="${glowR}" fill="url(#glow)" style="opacity:var(--glow)"/>
  <g style="opacity:var(--fire)">
    ${flame(-14, 58, 16, '#ff7a1a', 0.3)}${flame(14, 50, 15, '#ff7a1a', 0.7)}${flame(0, 84, 22, '#ffa33a', 0)}${flame(0, 52, 13, '#ffe08a', 0.5)}
  </g>
</g>`;
}

/** Rising smoke puffs. */
export function smoke(x: number, y: number, n = 4): string {
  let s = '';
  for (let i = 0; i < n; i++) {
    s += `<circle class="smoke" cx="${x + (i % 2 ? 6 : -6)}" cy="${y}" r="${14 + i * 3}" style="animation-delay:-${i * 1.6}s"/>`;
  }
  return `<g fill="#d8d2cc" style="opacity:var(--smoke)">${s}</g>`;
}

/** Hurricane lantern hanging from a string. Body is drawn in the land layer; light in the lights layer. */
export function lantern(x: number, y: number, stringLen = 40): string {
  return `<g transform="translate(${x} ${y})">
  <path d="M0 ${-stringLen} V-18" stroke="#2a1d16" stroke-width="2"/>
  <path d="M-8 -18 Q0 -26 8 -18" fill="none" stroke="#2a1d16" stroke-width="2.5"/>
  <rect x="-10" y="-16" width="20" height="5" fill="${C.laalDark}"/>
  <path d="M-9 -11 Q-13 2 -8 12 L8 12 Q13 2 9 -11 Z" fill="#f6e7c2" opacity=".55"/>
  <rect x="-12" y="12" width="24" height="7" rx="2" fill="${C.laalDark}"/>
</g>`;
}

export function lanternLight(x: number, y: number, r = 90): string {
  return `<g transform="translate(${x} ${y})" style="opacity:var(--glow)">
  <circle class="flicker" cx="0" cy="0" r="${r}" fill="url(#lampglow)"/>
  <path class="flicker" d="M-8 -11 Q-12 2 -7 11 L7 11 Q12 2 8 -11 Z" fill="#ffd27a"/>
  <path d="M0 6 C-3 2 -2 -3 0 -6 C2 -3 3 2 0 6Z" fill="#fff4cf"/>
</g>`;
}

/** Clay diya with a small flame. */
export function diya(x: number, y: number): string {
  return `<g transform="translate(${x} ${y})">
  <path d="M-10 0 Q0 9 10 0 Z" fill="${C.clay}"/>
  <g style="opacity:var(--glow)"><circle class="flicker" cx="0" cy="-6" r="30" fill="url(#lampglow)"/>
  <path class="flame" d="M0 -1 C-4 -5 -2 -10 0 -14 C2 -10 4 -5 0 -1Z" fill="#ffcf5a"/></g>
</g>`;
}

export function fireflies(area: [number, number, number, number], n: number, seed: number): string {
  const r = rng(seed);
  const [x, y, w, h] = area;
  let s = '';
  for (let i = 0; i < n; i++) {
    s += `<circle class="firefly" cx="${r1(x + r() * w)}" cy="${r1(y + r() * h)}" r="2.6" style="animation-delay:-${r1(r() * 5)}s"/>`;
  }
  return `<g fill="#f6ff9e" style="opacity:var(--firefly)">${s}</g>`;
}

export function grassTufts(area: [number, number, number, number], n: number, seed: number, color = '#5d7a32'): string {
  const r = rng(seed);
  const [x, y, w, h] = area;
  let s = '';
  for (let i = 0; i < n; i++) {
    const gx = r1(x + r() * w);
    const gy = r1(y + r() * h);
    const k = 0.6 + r() * 0.8;
    s += `<path d="M${gx} ${gy} l${r1(-6 * k)} ${r1(-14 * k)} M${gx} ${gy} l${r1(1 * k)} ${r1(-18 * k)} M${gx} ${gy} l${r1(7 * k)} ${r1(-12 * k)}"/>`;
  }
  return `<g stroke="${color}" stroke-width="2.4" stroke-linecap="round">${s}</g>`;
}

/** Tint layer: multiply-blends the land toward the phase colour (dusk warmth, night blue). */
export function tint(w: number, h: number): string {
  return `<rect class="tint" width="${w}" height="${h}" style="fill:var(--tint);opacity:var(--tint-o)"/>`;
}

/** A drooping string between two points, as a quadratic curve; returns path + a point sampler. */
export function sag(x1: number, y1: number, x2: number, y2: number, drop: number) {
  const cx = (x1 + x2) / 2;
  const cy = Math.max(y1, y2) + drop;
  const at = (t: number) => {
    const u = 1 - t;
    return [u * u * x1 + 2 * u * t * cx + t * t * x2, u * u * y1 + 2 * u * t * cy + t * t * y2];
  };
  return { d: `M${x1} ${y1} Q${cx} ${cy} ${x2} ${y2}`, at };
}

/** Triangle bunting with small bulbs between flags. Bulb glow goes in the lights layer. */
export function bunting(x1: number, y1: number, x2: number, y2: number, drop: number, n: number) {
  const s = sag(x1, y1, x2, y2, drop);
  const colors = [C.laal, C.marigold, '#2f7d4a', C.saree];
  let flags = '';
  let bulbs = '';
  let glow = '';
  for (let i = 1; i < n; i++) {
    const [x, y] = s.at(i / n);
    flags += `<path d="M${(x - 11).toFixed(1)} ${y.toFixed(1)} L${(x + 11).toFixed(1)} ${y.toFixed(1)} L${x.toFixed(1)} ${(y + 24).toFixed(1)} Z" fill="${colors[i % colors.length]}"/>`;
    const [bx, by] = s.at((i + 0.5) / n);
    bulbs += `<circle cx="${bx.toFixed(1)}" cy="${(by + 3).toFixed(1)}" r="3.5" fill="#f3e3b0"/>`;
    glow += `<circle class="twinkle" style="animation-delay:-${(i % 5) * 0.7}s" cx="${bx.toFixed(1)}" cy="${(by + 3).toFixed(1)}" r="9" fill="url(#lampglow)"/>`;
  }
  return {
    land: `<path d="${s.d}" fill="none" stroke="#3a2b20" stroke-width="2"/>${flags}${bulbs}`,
    light: glow,
  };
}
