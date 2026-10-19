import type { WorldId } from '../data/worlds';
import { akhraScene } from './akhra';

type SceneFn = () => string;

// Akhra ships in the main bundle (it's also inlined in the HTML). Other worlds load on demand.
const loaders: Record<WorldId, () => Promise<SceneFn>> = {
  love: async () => akhraScene,
  travel: () => import('./trekker').then((m) => m.trekkerScene),
  party: () => import('./biha').then((m) => m.bihaScene),
  festive: () => import('./parab').then((m) => m.parabScene),
};

export function loadScene(world: WorldId): Promise<SceneFn> {
  return loaders[world]();
}

/** Warm the other worlds' chunks once the page is idle. */
export function prefetchScenes(): void {
  const idle = (cb: () => void) =>
    'requestIdleCallback' in window ? requestIdleCallback(cb, { timeout: 5000 }) : setTimeout(cb, 2500);
  idle(() => (Object.keys(loaders) as WorldId[]).forEach((w) => loaders[w]().catch(() => {})));
}

/** Crossfade the scene container to a new world. Festival props are toggled via data attributes. */
export async function showScene(container: HTMLElement, world: WorldId): Promise<void> {
  if (container.dataset.scene === world) return;
  container.dataset.scene = world;
  const render = await loadScene(world);
  if (container.dataset.scene !== world) return; // user tuned away while loading
  const old = [...container.querySelectorAll('svg.scene-svg')];
  const tmp = document.createElement('div');
  tmp.innerHTML = render();
  const next = tmp.firstElementChild as SVGSVGElement;
  container.append(next);
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  old.forEach((o) => {
    if (reduce) return o.remove();
    o.classList.add('leaving');
    setTimeout(() => o.remove(), 1300);
  });
}
