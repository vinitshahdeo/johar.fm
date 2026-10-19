import type { App, AppState } from '../app';
import { WORLD_IDS, isWorldId, type WorldId } from '../data/worlds';
import { en } from '../i18n/strings';

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;

export function bindRadio(app: App): void {
  const dial = $('dial');
  const stations = [...dial.querySelectorAll<HTMLButtonElement>('.station')];
  const title = $('np-title');
  const artist = $('np-artist');
  const link = $<HTMLAnchorElement>('np-link');
  const play = $<HTMLButtonElement>('btn-play');
  const vol = $<HTMLInputElement>('volume');
  const amb = $<HTMLButtonElement>('btn-amb');
  const radio = dial.closest<HTMLElement>('.radio')!;
  const phaseGreet = $('phase-greet');
  const festival = $('festival');

  // ----- dial: click a station, or drag the needle -----
  stations.forEach((b) =>
    b.addEventListener('click', (e) => {
      if (suppressClick) return e.preventDefault();
      const w = b.dataset.world;
      if (isWorldId(w)) tune(w);
    }),
  );

  let dragging = false;
  let suppressClick = false;
  let startX = 0;
  const posAt = (clientX: number) => {
    const r = dial.getBoundingClientRect();
    const f = Math.min(0.999, Math.max(0, (clientX - r.left) / r.width));
    return f * 4 - 0.5; // needle position in station units
  };
  dial.addEventListener('pointerdown', (e) => {
    startX = e.clientX;
    dragging = false;
    suppressClick = false;
    dial.setPointerCapture(e.pointerId);
  });
  dial.addEventListener('pointermove', (e) => {
    if (!dial.hasPointerCapture(e.pointerId)) return;
    if (!dragging && Math.abs(e.clientX - startX) < 8) return;
    dragging = true;
    dial.style.setProperty('--pos', String(Math.max(0, Math.min(3, posAt(e.clientX)))));
    dial.classList.add('dragging');
  });
  const endDrag = (e: PointerEvent) => {
    if (!dragging) return;
    dragging = false;
    suppressClick = true;
    setTimeout(() => (suppressClick = false), 0);
    dial.classList.remove('dragging');
    const idx = Math.max(0, Math.min(3, Math.round(posAt(e.clientX))));
    tune(WORLD_IDS[idx]);
    render(app.store.get());
  };
  dial.addEventListener('pointerup', endDrag);
  dial.addEventListener('pointercancel', endDrag);

  const tune = (w: WorldId) => app.setWorld(w);

  // ----- controls -----
  play.addEventListener('click', () => app.togglePlay());
  $('btn-next').addEventListener('click', () => {
    if (!app.store.get().started) return void app.start();
    app.next();
  });
  vol.addEventListener('input', () => app.setVolume(Number(vol.value)));
  amb.addEventListener('click', () => app.toggleAmbience());

  // ----- render -----
  function render(s: AppState, prev?: AppState) {
    const idx = WORLD_IDS.indexOf(s.world);
    if (!dial.classList.contains('dragging')) dial.style.setProperty('--pos', String(idx));
    stations.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.world === s.world)));
    document.documentElement.dataset.world = s.world;
    document.documentElement.classList.toggle('playing', s.status === 'playing');
    radio.dataset.status = s.status;

    const playLabel = s.status === 'playing' ? en.pause : en.play;
    play.setAttribute('aria-label', playLabel);
    play.title = `${playLabel} (Space)`;

    if (s.status === 'nosignal') {
      title.textContent = en.noSignal;
      artist.textContent = en.retry;
    } else if (s.status === 'empty') {
      title.textContent = en.emptyWorld;
      artist.textContent = '\u00a0';
    } else if (s.track) {
      title.textContent = s.track.title;
      title.title = s.track.title;
      artist.textContent = s.track.artist;
    } else if (s.status === 'tuning') {
      title.textContent = en.tuning;
      artist.textContent = '\u00a0';
    }
    if (s.track && s.status !== 'nosignal' && s.status !== 'empty') {
      link.hidden = false;
      link.href = `https://www.youtube.com/watch?v=${encodeURIComponent(s.track.youtubeId)}`;
    } else link.hidden = true;

    if (!prev || prev.volume !== s.volume || prev.muted !== s.muted) {
      vol.value = String(s.muted ? 0 : s.volume);
    }
    amb.setAttribute('aria-pressed', String(s.ambience));

    phaseGreet.textContent = en[`phase_${s.phase}`];

    if (s.festival) {
      festival.hidden = false;
      festival.textContent = en[`festival_${s.festival.id}`];
    } else festival.hidden = true;
    stations.forEach((b) => b.classList.toggle('festive', !!s.festival && b.dataset.world === 'parab'));
  }

  render(app.store.get());
  app.store.subscribe(render);
}
