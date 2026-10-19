import type { App } from '../app';
import { WORLD_IDS } from '../data/worlds';

/** Desktop shortcuts. Ignored while typing, and defer to native controls where they own the key. */
export function bindKeyboard(app: App): void {
  window.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const t = e.target as HTMLElement | null;
    const tag = t?.tagName;
    if (tag === 'TEXTAREA' || tag === 'SELECT' || t?.isContentEditable) return;
    const isRange = tag === 'INPUT' && (t as HTMLInputElement).type === 'range';
    if (tag === 'INPUT' && !isRange) return;
    const activatable = tag === 'BUTTON' || tag === 'A' || tag === 'SUMMARY';

    const s = app.store.get();
    switch (e.key) {
      case ' ':
      case 'Spacebar':
        if (activatable) return; // Space already clicks the focused control
        e.preventDefault();
        app.togglePlay();
        return;
      case 'ArrowRight':
        if (isRange) return;
        e.preventDefault();
        if (!s.started) return void app.start();
        app.next();
        return;
      case 'ArrowLeft':
        if (isRange) return;
        e.preventDefault();
        app.previous();
        return;
      case 'ArrowUp':
      case 'ArrowDown':
        if (isRange) return;
        e.preventDefault();
        app.setVolume(s.volume + (e.key === 'ArrowUp' ? 10 : -10));
        return;
      case '1':
      case '2':
      case '3':
      case '4':
        app.setWorld(WORLD_IDS[Number(e.key) - 1]);
        return;
      case 'a':
      case 'A':
        app.toggleAmbience();
        return;
      case 'm':
      case 'M':
        app.toggleMute();
        return;
    }
  });
}
