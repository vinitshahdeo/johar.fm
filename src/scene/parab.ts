import {
  C, birds, bunting, clouds, defs, diya, fireLight, fireLogs, fireflies, grassTufts, man, mandar, moon, mudHouse,
  rng, salTree, salTreeOccluder, sky, smoke, stars, sun, tint, treeLine, woman, type Occluder,
} from './parts';

const W = 1600;
const H = 1000;

// Festival props are all drawn; CSS shows the set matching <html data-festival="…">.
// With no active festival, the Karam set shows (Parab's default look).

/** Karam: branches of the karam tree planted in the akhra, tied with red thread, offerings at the foot. */
function karam(x: number, y: number): string {
  let leaves = '';
  const r = rng(51);
  const branch = (bx: number, by: number, ang: number, len: number) => {
    const ex = bx + Math.cos(ang) * len;
    const ey = by + Math.sin(ang) * len;
    let s = `<path d="M${bx} ${by} L${ex.toFixed(1)} ${ey.toFixed(1)}" stroke="${C.trunk}" stroke-width="5" stroke-linecap="round"/>`;
    for (let i = 0; i < 9; i++) {
      const t = 0.3 + (i / 9) * 0.75;
      const lx = bx + (ex - bx) * t;
      const ly = by + (ey - by) * t;
      const side = i % 2 ? 1 : -1;
      const a = ang + side * (0.9 + r() * 0.4);
      const lx2 = lx + Math.cos(a) * 26;
      const ly2 = ly + Math.sin(a) * 26;
      s += `<ellipse cx="${((lx + lx2) / 2).toFixed(1)}" cy="${((ly + ly2) / 2).toFixed(1)}" rx="15" ry="7" transform="rotate(${((a * 180) / Math.PI).toFixed(0)} ${((lx + lx2) / 2).toFixed(1)} ${((ly + ly2) / 2).toFixed(1)})" fill="${i % 3 ? C.leaf : C.leafLight}"/>`;
    }
    return s;
  };
  leaves += branch(x - 6, y - 40, -1.75, 190);
  leaves += branch(x + 6, y - 40, -1.4, 175);
  leaves += branch(x, y - 50, -1.57, 220);
  return `<g class="fest fest-karam">
  <ellipse cx="${x}" cy="${y}" rx="70" ry="18" fill="${C.lateriteDark}"/>
  <path d="M${x - 50} ${y} Q${x} ${y - 30} ${x + 50} ${y} Z" fill="${C.earth}"/>
  <g class="sway">${leaves}</g>
  <path d="M${x - 10} ${y - 70} h20 M${x - 10} ${y - 62} h20" stroke="${C.laal}" stroke-width="4"/>
  <g transform="translate(${x - 44} ${y - 4})"><path d="M-14 0 Q0 10 14 0 Z" fill="${C.clay}"/><circle cx="0" cy="-4" r="6" fill="${C.marigold}"/></g>
  <g transform="translate(${x + 44} ${y - 4})"><path d="M-14 0 Q0 10 14 0 Z" fill="${C.clay}"/><path d="M-6 -2 q6 -12 12 0" fill="#e8d7a0"/></g>
</g>`;
}

/** Sarhul: sal trees in creamy blossom, flowers worn in the hair, a sal-flower string. */
function sarhulBlossoms(trees: [number, number, number, number, number][]): string {
  const r = rng(61);
  let s = '';
  for (const [x, b, h, spread] of trees) {
    const topY = b - h;
    for (let i = 0; i < 70; i++) {
      const a = r() * Math.PI * 2;
      const d = Math.sqrt(r());
      s += `<circle cx="${(x + Math.cos(a) * spread * 1.05 * d).toFixed(1)}" cy="${(topY + Math.sin(a) * spread * 0.55 * d).toFixed(1)}" r="${(4 + r() * 5).toFixed(1)}" fill="${r() > 0.3 ? '#f4e9b8' : '#e7cf6f'}"/>`;
    }
  }
  return `<g class="fest fest-sarhul">${s}</g>`;
}

/** Jitiya: a small shrine of branches and a line of diyas (the lights live in the lights layer). */
function jitiyaShrine(x: number, y: number): string {
  return `<g class="fest fest-jitiya">
  <ellipse cx="${x}" cy="${y}" rx="90" ry="20" fill="${C.ochre}" opacity=".6"/>
  <path d="M${x} ${y - 6} V${y - 120} M${x} ${y - 70} l-30 -30 M${x} ${y - 90} l26 -26" stroke="${C.trunk}" stroke-width="6" stroke-linecap="round"/>
  <g fill="${C.leaf}"><ellipse cx="${x - 34}" cy="${y - 104}" rx="16" ry="8"/><ellipse cx="${x + 30}" cy="${y - 120}" rx="16" ry="8"/><ellipse cx="${x}" cy="${y - 126}" rx="10" ry="16"/></g>
  <path d="M${x - 8} ${y - 60} h16" stroke="${C.laal}" stroke-width="4"/>
</g>`;
}

/** Fagua: clouds of gulal in the air and splashes of colour on the ground. */
function faguaColours(): string {
  const r = rng(71);
  const cols = ['#e2367a', '#f2a516', '#3fa34d', '#7a4bd1', '#ff6a3d'];
  let s = '';
  for (let i = 0; i < 9; i++) {
    const x = 300 + r() * 1000;
    const y = 520 + r() * 260;
    const c = cols[i % cols.length];
    s += `<g class="drift" style="animation-duration:${(20 + r() * 20).toFixed(0)}s"><circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${(40 + r() * 50).toFixed(0)}" fill="${c}" opacity=".28"/>
    <circle cx="${(x + 30).toFixed(0)}" cy="${(y - 20).toFixed(0)}" r="${(20 + r() * 30).toFixed(0)}" fill="${c}" opacity=".35"/></g>`;
  }
  for (let i = 0; i < 14; i++) {
    s += `<ellipse cx="${(250 + r() * 1100).toFixed(0)}" cy="${(800 + r() * 120).toFixed(0)}" rx="${(20 + r() * 30).toFixed(0)}" ry="${(6 + r() * 6).toFixed(0)}" fill="${cols[i % cols.length]}" opacity=".7"/>`;
  }
  return `<g class="fest fest-fagua">${s}</g>`;
}

export function parabScene(): string {
  const back: [number, number, number, number, number][] = [
    [180, 720, 500, 190, 41],
    [1420, 720, 520, 200, 42],
  ];
  const front: [number, number, number, number, number][] = [
    [410, 940, 720, 220, 43],
    [1200, 930, 700, 220, 44],
  ];
  const occ = [...back, ...front].map(([x, b, h, s]) => salTreeOccluder(x, b, h, s));
  const hidden: Occluder = (x, y) => y > 470 || Math.hypot(x - 820, y - 110) < 40 || occ.some((o) => o(x, y));
  const garland = bunting(470, 420, 1140, 420, 90, 22);
  let jitiyaLamps = '';
  for (let i = 0; i < 9; i++) jitiyaLamps += diya(560 + i * 60, 900 - Math.abs(i - 4) * 6);
  return `<svg class="scene-svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMax slice" role="img" aria-labelledby="scene-title-parab" xmlns="http://www.w3.org/2000/svg">
<title id="scene-title-parab">Festival night in the akhra: a Karam branch planted at the centre, women dancing in a ring, mandar resting, lamps and a fire.</title>
${defs()}
${sky(W, H)}
${sun(820, 400)}
${clouds([[300, 180, 1], [1250, 150, 1.1]])}
${birds(600, 240)}
<path d="M0 560 C150 480 320 520 480 495 C640 470 760 520 900 505 C1060 488 1200 450 1340 480 C1460 505 1540 485 1600 490 L1600 700 L0 700 Z" fill="#6f8a6a"/>
<rect y="430" width="${W}" height="200" style="fill:var(--haze);opacity:var(--haze-o)"/>
${treeLine(0, W, (x) => 595 + Math.sin(x / 120) * 12, '#3c5a36', 45)}
<rect y="605" width="${W}" height="${H - 605}" fill="url(#ground)"/>
${back.map((t) => salTree(...t)).join('')}
${sarhulBlossoms(back)}
${mudHouse(1000, 690, 240, 46)}
<ellipse cx="800" cy="840" rx="470" ry="125" fill="${C.packed}"/>
<ellipse cx="800" cy="840" rx="470" ry="125" fill="none" stroke="${C.saree}" stroke-width="4" stroke-dasharray="2 18" stroke-linecap="round" opacity=".7"/>
${grassTufts([0, 640, 340, 360], 50, 47)}
${grassTufts([1260, 640, 340, 360], 50, 48)}
${front.map((t) => salTree(...t)).join('')}
${sarhulBlossoms(front)}
${garland.land}
${faguaColours()}
${karam(800, 820)}
${jitiyaShrine(800, 820)}
${fireLogs(1020, 880)}
${smoke(1020, 820, 3)}
${mandar(560, 900, 0.9, -8)}
${woman(620, 800, { cls: 'sway-dancer', delay: 0 })}
${woman(670, 780, { cls: 'sway-dancer', delay: 0.3 })}
${woman(930, 780, { cls: 'sway-dancer', delay: 0.6, flip: true })}
${woman(980, 800, { cls: 'sway-dancer', delay: 0.9, flip: true })}
${woman(700, 905, { cls: 'sway-dancer', delay: 1.2, s: 1.08 })}
${woman(900, 905, { cls: 'sway-dancer', delay: 1.5, s: 1.08, flip: true })}
${man(1110, 900, { armUp: true, flip: true })}
${man(470, 930, { s: 1.02 })}
${tint(W, H)}
${stars(W, 470, 220, 37, hidden)}
${moon(820, 110)}
${fireLight(1020, 880, 240)}
<g style="opacity:var(--glow)">${garland.light}</g>
<g class="fest fest-jitiya">${jitiyaLamps}</g>
${fireflies([0, 620, W, 300], 22, 49)}
</svg>`;
}
