import { nag } from '../i18n/strings';
import {
  C, birds, clouds, defs, moon, salTree, salTreeOccluder, sky, smoke, stars, sun, tint, treeLine,
  type Occluder,
} from './parts';

const W = 1600;
const H = 1000;

/** Passenger sitting (on the roof), facing left. */
function rider(x: number, y: number, shirt: string, s = 1): string {
  return `<g transform="translate(${x} ${y}) scale(${s})">
  <path d="M-14 0 Q-26 2 -30 14 M10 0 Q-2 4 -8 16" stroke="${C.skin}" stroke-width="6" stroke-linecap="round" fill="none"/>
  <path d="M-18 0 L18 0 L14 -12 L-14 -12 Z" fill="#3c3a4a"/>
  <path d="M-11 -44 Q0 -48 11 -44 L13 -10 L-13 -10 Z" fill="${shirt}"/>
  <path d="M-10 -40 L-22 -18" stroke="${C.skin}" stroke-width="6" stroke-linecap="round"/>
  <circle cx="0" cy="-56" r="10" fill="${C.skin}"/>
  <path d="M-10 -58 Q0 -70 10 -58 L10 -62 Q0 -68 -10 -62Z" fill="${C.hair}"/>
</g>`;
}

/** Man hanging off the back ladder, one arm up on the rail. */
function hanger(x: number, y: number, shirt: string): string {
  return `<g transform="translate(${x} ${y})">
  <path d="M-4 0 L-6 -34 M6 0 L8 -34" stroke="#2f3346" stroke-width="7" stroke-linecap="round"/>
  <path d="M-12 -80 Q0 -84 12 -80 L12 -34 L-12 -34 Z" fill="${shirt}"/>
  <path d="M-10 -76 L-16 -112 M10 -76 L16 -50" stroke="${C.skin}" stroke-width="6" stroke-linecap="round"/>
  <circle cx="0" cy="-94" r="10" fill="${C.skin}"/>
  <path d="M-10 -96 Q0 -108 10 -96 L10 -100 Q0 -106 -10 -100Z" fill="${C.hair}"/>
</g>`;
}

function wheel(x: number, y: number): string {
  let spokes = '';
  for (let i = 0; i < 6; i++) spokes += `<path d="M0 0 L${Math.round(Math.cos((i * Math.PI) / 3) * 16)} ${Math.round(Math.sin((i * Math.PI) / 3) * 16)}"/>`;
  return `<g transform="translate(${x} ${y})">
  <circle r="40" fill="#1a1a1a"/><circle r="31" fill="#2b2b2b"/>
  <circle r="19" fill="#c9c9c9"/>
  <g class="spin" stroke="#7a7a7a" stroke-width="3">${spokes}<circle r="19" fill="none" stroke="none"/></g>
  <circle r="5" fill="#555"/>
</g>`;
}

/** The trekker: a boxy jeep, overloaded. Faces left. (0,0) is the ground under its middle. */
function trekker(): string {
  const body = '#3f8fbf';
  const bodyDark = '#2f6f96';
  let rack = '';
  for (let x = -80; x <= 180; x += 26) rack += `<path d="M${x} -206 V-196"/>`;
  return `<g class="bounce">
  <ellipse cx="0" cy="2" rx="210" ry="12" fill="#000" opacity=".25"/>
  <rect x="-205" y="-62" width="408" height="18" rx="4" fill="#26282c"/>
  <path d="M-195 -60 L-195 -118 Q-195 -126 -186 -127 L-122 -132 L-96 -198 L176 -202 Q190 -202 191 -190 L193 -60 Z" fill="${body}"/>
  <path d="M-195 -60 L-195 -84 L193 -84 L193 -60 Z" fill="${bodyDark}"/>
  <path d="M-195 -104 L193 -104 L193 -94 L-195 -94 Z" fill="${C.laal}"/>
  <path d="M-195 -94 L193 -94 L193 -89 L-195 -89 Z" fill="${C.saree}"/>
  <path d="M-114 -132 L-92 -190 L-58 -190 L-66 -132 Z" fill="#1f2d36"/>
  <rect x="-52" y="-188" width="64" height="52" rx="4" fill="#1f2d36"/>
  <rect x="20" y="-188" width="70" height="52" rx="4" fill="#1f2d36"/>
  <rect x="98" y="-188" width="78" height="52" rx="4" fill="#1f2d36"/>
  <g fill="${C.skin}">
    <circle cx="-30" cy="-158" r="10"/><circle cx="0" cy="-160" r="10"/><circle cx="44" cy="-157" r="10"/>
    <circle cx="70" cy="-159" r="10"/><circle cx="122" cy="-158" r="10"/><circle cx="150" cy="-160" r="10"/>
  </g>
  <g fill="${C.hair}">
    <path d="M-40 -162 q10 -12 20 0z"/><path d="M-10 -164 q10 -12 20 0z"/><path d="M34 -161 q10 -12 20 0z"/>
    <path d="M60 -163 q10 -12 20 0z"/><path d="M112 -162 q10 -12 20 0z"/><path d="M140 -164 q10 -12 20 0z"/>
  </g>
  <rect x="-96" y="-150" width="22" height="9" rx="2" fill="#3a2b20"/>
  <text x="30" y="-108" font-size="22" fill="${C.saree}" font-family="'Yatra One', 'Kohinoor Devanagari', 'Noto Sans Devanagari', sans-serif" text-anchor="middle" lang="hi">${nag.trekker_sign}</text>
  <circle cx="-188" cy="-110" r="9" fill="#f6ecc4" stroke="#999" stroke-width="2"/>
  <rect x="186" y="-120" width="10" height="16" rx="2" fill="#a51d1d"/>
  <path d="M-60 -60 V-130 M16 -60 V-188 M94 -60 V-188" stroke="${bodyDark}" stroke-width="3"/>
  <ellipse cx="203" cy="-130" rx="14" ry="36" fill="#1a1a1a"/>
  <g stroke="#2a2a2a" stroke-width="4"><path d="M196 -60 V-196"/><path d="M196 -100 h14 M196 -140 h14 M196 -176 h14"/></g>
  <g stroke="#5a5a5a" stroke-width="4" fill="none"><path d="M-90 -206 H185"/>${rack}</g>
  <rect x="-80" y="-240" width="70" height="36" rx="12" fill="#d8c8a0"/>
  <path d="M-80 -228 h70" stroke="#b5a479" stroke-width="2"/>
  <rect x="60" y="-236" width="66" height="32" fill="#2c5d8f"/>
  <path d="M60 -236 h66 v32 h-66z M60 -224 h66" fill="none" stroke="#9fb2c3" stroke-width="2"/>
  <path d="M132 -204 Q130 -236 156 -238 Q184 -236 180 -204 Z" fill="${C.laal}"/>
  <path d="M150 -238 l6 -10 l6 10" fill="${C.laal}"/>
  ${rider(-28, -206, '#e8c23a', 0.95)}
  ${rider(28, -206, '#e8e2d3', 0.95)}
  ${hanger(214, -44, '#7a3e8f')}
  ${wheel(-128, -40)}${wheel(124, -40)}
</g>`;
}

const farRange = 'M0 430 C120 380 240 400 360 360 C480 320 600 390 720 370 C840 350 900 300 1020 320 C1160 340 1260 290 1400 310 C1500 325 1560 300 1600 310 L1600 640 L0 640 Z';
const midRange = 'M0 520 C160 470 300 500 440 470 C600 440 700 500 860 480 C1000 462 1100 430 1260 450 L1600 430 L1600 700 L0 700 Z';
const hillside = 'M760 760 C900 640 1020 600 1140 520 C1260 450 1400 420 1600 380 L1600 800 L760 800 Z';
const road = 'M0 790 C400 760 1000 770 1600 735 L1600 870 C1000 905 420 890 0 915 Z';
const roadMid = 'M0 852 C420 825 1000 836 1600 802';

export function trekkerScene(): string {
  const trees: [number, number, number, number, number][] = [
    [1180, 640, 360, 130, 12],
    [1420, 600, 420, 150, 13],
    [1010, 700, 260, 100, 14],
  ];
  const occ = trees.map(([x, b, h, s]) => salTreeOccluder(x, b, h, s));
  const hidden: Occluder = (x, y) =>
    y > 300 || Math.hypot(x - 300, y - 140) < 40 || occ.some((o) => o(x, y));
  // Painted parapet stones along the valley-side edge of the road (same curve as the road's lower edge).
  const edge = (t: number) => {
    const p = [[0, 915], [420, 890], [1000, 905], [1600, 870]];
    const u = 1 - t;
    const k = [u * u * u, 3 * u * u * t, 3 * u * t * t, t * t * t];
    return [0, 1].map((i) => p.reduce((acc, pt, j) => acc + pt[i] * k[j], 0));
  };
  let parapet = '';
  for (let i = 0; i <= 25; i++) {
    const [x, y] = edge(i / 25);
    parapet += `<rect x="${Math.round(x - 13)}" y="${Math.round(y - 16)}" width="26" height="22" rx="3" fill="${i % 2 ? C.saree : C.laal}"/>`;
  }
  return `<svg class="scene-svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMax slice" role="img" aria-labelledby="scene-title-trekker" xmlns="http://www.w3.org/2000/svg">
<title id="scene-title-trekker">An overloaded trekker jeep on a ghat road through sal forest, people and luggage on the roof, a cassette player glowing on the dashboard.</title>
${defs()}
<defs>
  <linearGradient id="beam" x1="1" y1="0" x2="0" y2="0">
    <stop offset="0" stop-color="#fff2b8" stop-opacity=".75"/><stop offset="1" stop-color="#fff2b8" stop-opacity="0"/>
  </linearGradient>
</defs>
${sky(W, H)}
${sun(380, 380)}
${clouds([[300, 200, 1], [900, 140, 1.2], [1400, 230, 0.8]])}
${birds(900, 280)}
<path d="${farRange}" fill="#7d93a0"/>
<rect y="300" width="${W}" height="300" style="fill:var(--haze);opacity:var(--haze-o)"/>
<path d="${midRange}" fill="#5c7a5c"/>
${treeLine(0, 1000, (x) => 500 + Math.sin(x / 90) * 12, '#4a6a48', 21)}
<rect y="560" width="${W}" height="200" style="fill:var(--haze);opacity:calc(var(--haze-o) * .6)"/>
<path d="${hillside}" fill="${C.laterite}"/>
<path d="M800 760 C920 680 1000 650 1100 600 L1600 520 L1600 760 Z" fill="${C.lateriteDark}" opacity=".5"/>
${treeLine(1080, 1600, (x) => 520 - (x - 1080) * 0.22, C.leafDark, 22)}
${trees.map((t) => salTree(...t)).join('')}
<path d="M0 700 C300 690 600 720 900 760 L0 800 Z" fill="#3c5a36"/>
${treeLine(0, 900, (x) => 740 + (x / 900) * 30, C.leafDeep, 23)}
<path d="${road}" fill="#45464a"/>
<path d="${road}" fill="none" stroke="#6a6b6f" stroke-width="4"/>
<path d="${roadMid}" fill="none" stroke="#efe6cf" stroke-width="5" stroke-dasharray="40 44"/>
${parapet}
<path d="M0 915 C420 890 1000 905 1600 870 L1600 1000 L0 1000 Z" fill="#2c4a26"/>
${treeLine(0, W, (x) => 960 - Math.sin(x / 200) * 10, C.leafDeep, 24)}
${smoke(1060, 790, 3).replace('#d8d2cc', '#c9a27a')}
<g transform="translate(820 845)">${trekker()}</g>
${tint(W, H)}
${stars(W, 430, 200, 17, hidden)}
${moon(300, 140)}
<g style="opacity:var(--glow)">
  <path d="M632 735 L240 650 L240 830 Z" fill="url(#beam)"/>
  <circle cx="632" cy="735" r="40" fill="url(#lampglow)"/>
  <circle class="flicker" cx="735" cy="700" r="38" fill="url(#lampglow)"/>
  <rect x="724" y="695" width="22" height="9" rx="2" fill="#ffb347"/>
  <circle cx="1011" cy="733" r="14" fill="#ff3b2f" opacity=".35"/>
</g>
</svg>`;
}
