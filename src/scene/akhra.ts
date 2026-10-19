import {
  C, birds, clouds, defs, diya, fireLight, fireLogs, fireflies, grassTufts, lantern, lanternLight,
  mandar, man, mat, moon, mudHouse, nagara, salTree, salTreeOccluder, seatedMan, sky, smoke, stars,
  sun, tint, treeLine, woman, type Occluder,
} from './parts';

export const W = 1600;
export const H = 1000;

const farHills = `M0 560 C150 470 300 520 420 490 C560 450 700 530 860 500 C1000 470 1120 430 1260 480 C1380 520 1500 470 1600 500 L1600 700 L0 700 Z`;
const nearHills = `M0 600 C200 560 330 610 520 585 C700 560 820 610 1000 590 C1180 570 1350 620 1600 585 L1600 720 L0 720 Z`;
const nearY = (x: number) => 590 + Math.sin(x / 110) * 14;

// [x, baseY, height, spread, seed]
const TREES_BACK: [number, number, number, number, number][] = [[170, 760, 520, 190, 3], [1440, 760, 540, 200, 4]];
const TREES_FRONT: [number, number, number, number, number][] = [[430, 940, 760, 230, 5], [1220, 930, 740, 230, 6]];
const occluders = [...TREES_BACK, ...TREES_FRONT].map(([x, b, h, s]) => salTreeOccluder(x, b, h, s));
const hidden: Occluder = (x, y) =>
  y > 470 || Math.hypot(x - 835, y - 120) < 40 || occluders.some((o) => o(x, y));

/** Village akhra at dusk under sal trees. The default world. */
export function akhraScene(): string {
  return `<svg class="scene-svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMax slice" role="img" aria-labelledby="scene-title" xmlns="http://www.w3.org/2000/svg">
<title id="scene-title">A village akhra under sal trees: drums resting on a mat, a fire, women in red-and-white sarees gathering to dance.</title>
${defs()}
${sky(W, H)}
${sun(820, 400)}
${clouds([[260, 170, 1.2], [760, 110, 0.9], [1320, 210, 1.1]])}
${birds(640, 260)}
<path d="${farHills}" fill="#6f8a6a"/>
<rect y="430" width="${W}" height="200" style="fill:var(--haze);opacity:var(--haze-o)"/>
<path d="${nearHills}" fill="#4d6b45"/>
${treeLine(0, W, nearY, '#3c5a36', 11)}
<rect y="605" width="${W}" height="${H - 605}" fill="url(#ground)"/>
<path d="M0 605 C300 615 600 600 900 612 C1200 622 1400 606 1600 612 L1600 640 L0 640Z" fill="${C.leafDark}" opacity=".45"/>
${TREES_BACK.map((t) => salTree(...t)).join('')}
${mudHouse(560, 700, 260, 21)}
<ellipse cx="830" cy="845" rx="430" ry="115" fill="${C.packed}"/>
<ellipse cx="830" cy="845" rx="430" ry="115" fill="none" stroke="${C.lateriteDark}" stroke-width="3" stroke-dasharray="1 14" stroke-linecap="round" opacity=".6"/>
<path d="M120 1000 C320 920 470 860 640 800 L700 812 C560 870 430 935 330 1000 Z" fill="${C.earthLight}" opacity=".8"/>
${grassTufts([0, 640, 380, 360], 60, 31)}
${grassTufts([1240, 640, 360, 360], 60, 32)}
${grassTufts([360, 940, 900, 60], 30, 33)}
${TREES_FRONT.map((t) => salTree(...t)).join('')}
${lantern(1160, 520, 120)}
${mat(620, 850, 210, 52)}
${mandar(690, 862, 1)}
${nagara(790, 860, 0.8)}
${seatedMan(600, 900, { s: 0.95 })}
${fireLogs(880, 830)}
${smoke(880, 760, 4)}
${woman(960, 830, { cls: 'sway-dancer', delay: 0 })}
${woman(1010, 822, { cls: 'sway-dancer', delay: 0.4 })}
${woman(1060, 830, { cls: 'sway-dancer', delay: 0.8 })}
${woman(1110, 838, { cls: 'sway-dancer', delay: 1.2 })}
${man(1170, 850, { flip: true, s: 1.02 })}
${man(500, 860, { s: 0.92 })}
${woman(455, 880, { s: 0.9, flip: true })}
${tint(W, H)}
${stars(W, 470, 220, 7, hidden)}
${moon(835, 120)}
${fireLight(880, 830)}
${lanternLight(1160, 520)}
${diya(720, 698)}
${fireflies([0, 620, W, 300], 26, 41)}
</svg>`;
}
