import './scene/scene.css';
import './styles.css';
import { createApp } from './app';
import festivals from './data/festivals.json';
import { isWorldId } from './data/worlds';
import { prefetchScenes, showScene } from './scene/registry';
import { DEFAULT_PREFS, loadPrefs } from './storage';
import { getDayPhase, isPhase, type Phase } from './time/dayPhase';
import { getActiveFestival, parseDay, type FestivalEntry } from './time/festival';
import { bindKeyboard } from './ui/keyboard';
import { bindRadio } from './ui/radio';
import { loadYouTubeApi } from './player/youtube';

// Dev/QA overrides: ?phase=night, ?date=2026-09-02, ?world=trekker
const q = new URLSearchParams(location.search);
const phaseOverride = q.get('phase');
const dateOverride = q.get('date');

function now(): Date {
  if (dateOverride && parseDay(dateOverride) !== null) {
    const [y, m, d] = dateOverride.split('-').map(Number);
    const t = new Date();
    return new Date(y, m - 1, d, t.getHours(), t.getMinutes());
  }
  return new Date();
}
const currentPhase = (): Phase => (isPhase(phaseOverride) ? phaseOverride : getDayPhase(now()));

const saved = loadPrefs();
const festival = getActiveFestival(now(), festivals as FestivalEntry[]);
const queryWorld = q.get('world');
// First-time visitors land on Parab during a festival; returning visitors keep their world.
const world = isWorldId(queryWorld) ? queryWorld : saved ? saved.world : festival ? 'festive' : DEFAULT_PREFS.world;
const prefs = saved ?? DEFAULT_PREFS;

const app = createApp(
  {
    world,
    phase: currentPhase(),
    festival,
    volume: prefs.volume,
    muted: false,
    ambience: prefs.ambience,
    started: false,
    status: 'idle',
    track: null,
  },
  document.getElementById('yt-wrap')!,
);

const root = document.documentElement;
const sceneEl = document.getElementById('scene')!;
const overlay = document.getElementById('overlay')!;

app.store.subscribe((s, prev) => {
  if (s.phase !== prev.phase) root.dataset.phase = s.phase;
  if (s.world !== prev.world) void showScene(sceneEl, s.world);
  if (s.started && !prev.started) overlay.classList.add('gone');
});
root.dataset.phase = app.store.get().phase;
if (festival) root.dataset.festival = festival.id;
if (world !== 'love') void showScene(sceneEl, world);

// The scene ends where the radio starts (portrait), so publish the dock's real height to CSS.
const dock = document.getElementById('dock')!;
const setDockHeight = () => root.style.setProperty('--dock-h', `${Math.ceil(dock.getBoundingClientRect().height)}px`);
setDockHeight();
if ('ResizeObserver' in window) new ResizeObserver(setDockHeight).observe(dock);

bindRadio(app);
bindKeyboard(app);

const tune = document.getElementById('tune')!;
tune.addEventListener('click', () => void app.start());
// Fetch the YouTube API a moment before the tap lands.
const warm = () => void loadYouTubeApi().catch(() => {});
tune.addEventListener('pointerenter', warm, { once: true });
tune.addEventListener('touchstart', warm, { once: true, passive: true });
tune.addEventListener('focus', warm, { once: true });

// Re-check the time of day every minute so the scene follows the clock.
setInterval(() => app.setPhase(currentPhase()), 60_000);

prefetchScenes();
