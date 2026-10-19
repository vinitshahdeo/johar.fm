import {
  C, birds, bunting, clouds, defs, diya, man, moon, mudHouse, nagara, rng, salTree, salTreeOccluder, sky,
  stars, sun, tint, treeLine, woman, type Occluder,
} from './parts';

const W = 1600;
const H = 1000;

/** The madwa: four bamboo poles, a canopy of mango leaves, marigold strings, kalash at the centre. */
function madwa(cx: number, groundY: number): string {
  const w = 380;
  const h = 300;
  const l = cx - w / 2;
  const r = cx + w / 2;
  const top = groundY - h;
  const bamboo = (x: number, y0: number, y1: number, k = 1) =>
    `<rect x="${x - 7 * k}" y="${y1}" width="${14 * k}" height="${y0 - y1}" fill="#c9a964"/>
     <g stroke="#9b7d3f" stroke-width="2">${[0.2, 0.45, 0.7].map((f) => `<path d="M${x - 7 * k} ${y1 + (y0 - y1) * f} h${14 * k}"/>`).join('')}</g>`;
  let leaves = '';
  for (let x = l - 20; x <= r + 20; x += 15) {
    leaves += `<path d="M${x} ${top + 4} q-6 18 0 34 q6 -16 0 -34z" fill="${C.mango}"/>`;
  }
  let leaves2 = '';
  for (let x = l - 12; x <= r + 12; x += 15) {
    leaves2 += `<path d="M${x} ${top - 12} q-5 14 0 26 q5 -12 0 -26z" fill="#6a9a3c"/>`;
  }
  let strings = '';
  const r1 = rng(9);
  for (let x = l + 22; x < r - 10; x += 34) {
    const len = 6 + Math.floor(r1() * 5);
    let beads = '';
    for (let i = 0; i < len; i++) beads += `<circle cx="${x}" cy="${top + 42 + i * 12}" r="6.5" fill="${i % 3 === 2 ? C.marigoldDeep : C.marigold}"/>`;
    strings += `<path d="M${x} ${top + 36} V${top + 42 + (len - 1) * 12}" stroke="#4a6a2a" stroke-width="1.5"/>${beads}`;
  }
  let chowk = '';
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    chowk += `<ellipse cx="${(cx + Math.cos(a) * 48).toFixed(1)}" cy="${(groundY - 12 + Math.sin(a) * 14).toFixed(1)}" rx="12" ry="5" fill="${C.kaolin}"/>`;
  }
  return `<g>
  ${bamboo(l + 40, groundY - 40, top + 10, 0.8)}${bamboo(r - 40, groundY - 40, top + 10, 0.8)}
  <path d="M${l - 30} ${top} L${cx} ${top - 70} L${r + 30} ${top} Z" fill="#5f8d36"/>
  <path d="M${l - 30} ${top} L${cx} ${top - 70} L${r + 30} ${top}" fill="none" stroke="#3f6a22" stroke-width="5"/>
  ${leaves2}
  <rect x="${l - 30}" y="${top - 2}" width="${w + 60}" height="10" fill="#c9a964"/>
  ${leaves}
  ${strings}
  <ellipse cx="${cx}" cy="${groundY - 12}" rx="80" ry="24" fill="${C.ochre}" opacity=".55"/>
  ${chowk}
  <ellipse cx="${cx}" cy="${groundY - 12}" rx="22" ry="8" fill="${C.laal}"/>
  <g transform="translate(${cx} ${groundY - 16})">
    <path d="M-22 0 Q-30 -26 -12 -40 L12 -40 Q30 -26 22 0 Z" fill="${C.brass}"/>
    <path d="M-18 -16 H18" stroke="${C.laal}" stroke-width="4"/>
    <path d="M-10 -40 Q-26 -60 -30 -58 M10 -40 Q26 -60 30 -58 M-4 -40 Q-12 -66 -16 -68 M4 -40 Q12 -66 16 -68" stroke="${C.mango}" stroke-width="7" stroke-linecap="round" fill="none"/>
    <circle cx="0" cy="-50" r="11" fill="#7a5532"/>
  </g>
  ${bamboo(l, groundY, top, 1)}${bamboo(r, groundY, top, 1)}
</g>`;
}

/** Dhak: a barrel drum slung at the hip, with a stick. */
function dhakPlayer(x: number, y: number): string {
  return `<g>${man(x, y, { armUp: true })}
  <g transform="translate(${x + 4} ${y - 58})">
    <path d="M-30 -14 Q0 -22 30 -14 L30 14 Q0 22 -30 14 Z" fill="#8b2c1d"/>
    <ellipse cx="-30" cy="0" rx="6" ry="14" fill="${C.leather}"/><ellipse cx="30" cy="0" rx="6" ry="14" fill="${C.leather}"/>
    <path d="M-22 -18 L-22 18 M0 -20 V20 M22 -18 V18" stroke="${C.brass}" stroke-width="2"/>
    <path d="M18 -60 L-4 -14" stroke="${C.wood}" stroke-width="4" stroke-linecap="round"/>
  </g></g>`;
}

/** Shehnai: a long conical pipe at the lips. */
function shehnaiPlayer(x: number, y: number): string {
  return `<g>${man(x, y, { flip: true })}
  <g transform="translate(${x - 8} ${y - 108})">
    <path d="M0 0 L-46 26 L-52 20 Z" fill="#3a2414"/>
    <path d="M-44 22 Q-56 30 -58 18 Q-54 10 -48 18" fill="${C.brass}"/>
    <path d="M-6 6 L-26 22 M2 8 L-14 30" stroke="${C.skin}" stroke-width="6" stroke-linecap="round"/>
  </g></g>`;
}

export function bihaScene(): string {
  const trees: [number, number, number, number, number][] = [
    [120, 640, 460, 170, 31],
    [1480, 650, 480, 180, 32],
  ];
  const occ = trees.map(([x, b, h, s]) => salTreeOccluder(x, b, h, s));
  const hidden: Occluder = (x, y) => y > 420 || Math.hypot(x - 1200, y - 130) < 40 || occ.some((o) => o(x, y));
  const b1 = bunting(160, 330, 800, 360, 70, 16);
  const b2 = bunting(800, 360, 1440, 330, 70, 16);
  const b3 = bunting(380, 470, 1220, 470, 50, 20);
  const groundY = 790;
  return `<svg class="scene-svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMax slice" role="img" aria-labelledby="scene-title-biha" xmlns="http://www.w3.org/2000/svg">
<title id="scene-title-biha">A village wedding courtyard: the madwa canopy of mango leaves and marigolds, a kalash on a rangoli, women dancing domkach, nagara, dhak and shehnai players.</title>
${defs()}
${sky(W, H)}
${sun(1200, 420)}
${clouds([[260, 160, 1], [880, 110, 0.8], [1360, 200, 1]])}
${birds(500, 250)}
<path d="M0 560 C200 500 420 540 640 510 C860 480 1080 530 1300 500 C1440 482 1540 500 1600 495 L1600 700 L0 700 Z" fill="#5f7d5a"/>
<rect y="440" width="${W}" height="180" style="fill:var(--haze);opacity:var(--haze-o)"/>
${treeLine(0, W, (x) => 585 + Math.sin(x / 130) * 10, '#3c5a36', 33)}
<rect y="600" width="${W}" height="${H - 600}" fill="url(#ground)"/>
${trees.map((t) => salTree(...t)).join('')}
${mudHouse(210, 680, 330, 34)}
${mudHouse(1060, 680, 330, 35)}
<ellipse cx="800" cy="800" rx="640" ry="150" fill="${C.packed}"/>
${b1.land}${b2.land}
${madwa(800, groundY)}
${b3.land}
${woman(380, 860, { cls: 'sway-dancer', delay: 0 })}
${woman(432, 852, { cls: 'sway-dancer', delay: 0.3 })}
${woman(484, 860, { cls: 'sway-dancer', delay: 0.6 })}
${woman(536, 868, { cls: 'sway-dancer', delay: 0.9 })}
${woman(1060, 868, { cls: 'sway-dancer', delay: 0.2, flip: true })}
${woman(1112, 860, { cls: 'sway-dancer', delay: 0.5, flip: true })}
${woman(1164, 852, { cls: 'sway-dancer', delay: 0.8, flip: true })}
${woman(1216, 860, { cls: 'sway-dancer', delay: 1.1, flip: true })}
${man(600, 905, { armUp: true, cls: 'sway-dancer', delay: 0.4 })}
${nagara(655, 900, 1.15)}
${dhakPlayer(960, 930)}
${shehnaiPlayer(1290, 920)}
${tint(W, H)}
${stars(W, 420, 200, 27, hidden)}
${moon(1200, 130)}
<circle cx="800" cy="700" r="460" fill="url(#glow)" style="opacity:calc(var(--glow) * .45)"/>
<g style="opacity:var(--glow)">${b1.light}${b2.light}${b3.light}</g>
${diya(720, groundY - 6)}${diya(880, groundY - 6)}${diya(760, groundY + 4)}${diya(840, groundY + 4)}
</svg>`;
}
