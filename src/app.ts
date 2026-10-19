import { tracksFor, type Track } from './data/playlists';
import { WORLD_IDS, type WorldId } from './data/worlds';
import { en } from './i18n/strings';
import { ShuffleBag } from './player/queue';
import { State, YouTubeAudio } from './player/youtube';
import { initMediaSession, setNowPlaying, setPlaybackState } from './player/mediaSession';
import { createStore } from './store';
import { savePrefs } from './storage';
import type { FestivalEntry } from './time/festival';
import type { Phase } from './time/dayPhase';
import type { Ambience } from './ambience/types';

export type Status = 'idle' | 'tuning' | 'playing' | 'paused' | 'nosignal' | 'empty' | 'blocked';

export interface AppState {
  world: WorldId;
  phase: Phase;
  festival: FestivalEntry | null;
  volume: number;
  muted: boolean;
  ambience: boolean;
  started: boolean;
  status: Status;
  track: Track | null;
}

/** A track that hasn't reached PLAYING this long after loading is skipped. */
export const WATCHDOG_MS = 12_000;

export function createApp(initial: AppState, ytWrap: HTMLElement) {
  // YouTube replaces the mount div with its iframe, so keep a handle on the stable wrapper instead.
  const ytMount = ytWrap.firstElementChild as HTMLElement;
  const store = createStore<AppState>(initial);
  const bags = new Map<WorldId, ShuffleBag>(WORLD_IDS.map((w) => [w, new ShuffleBag(tracksFor(w))]));
  let everPlayed = false;
  let watchdog: ReturnType<typeof setTimeout> | undefined;
  let ambience: Ambience | null = null;
  let userPaused = false;

  const festivalWeight = () => {
    const f = store.get().festival;
    bags.get('festive')!.setWeight((t) => (f && t.festival === f.id ? 3 : 1));
  };
  festivalWeight();

  const yt = new YouTubeAudio(ytMount, {
    onState(s) {
      const st = store.get();
      if (s === State.PLAYING) {
        clearTimeout(watchdog);
        everPlayed = true;
        userPaused = false;
        hideReveal();
        store.set({ status: 'playing' });
        ambience?.duck(true);
        setPlaybackState('playing');
      } else if (s === State.PAUSED) {
        if (st.status === 'playing') store.set({ status: 'paused' });
        ambience?.duck(false);
        setPlaybackState('paused');
      } else if (s === State.ENDED) {
        next();
      }
    },
    onError(code) {
      // Dead, private, or embed-blocked: drop it for this session and move on silently.
      const t = store.get().track;
      if (t) bags.get(t.world)?.markFailed(t.youtubeId);
      console.info(`[johar.fm] skipped ${t?.youtubeId} (YouTube error ${code})`);
      next();
    },
  });

  function armWatchdog(track: Track) {
    clearTimeout(watchdog);
    watchdog = setTimeout(() => {
      if (store.get().track !== track || store.get().status === 'playing' || userPaused) return;
      if (!everPlayed) {
        // Probably the browser blocked programmatic playback (common on iOS). Let them tap the video.
        revealPlayer();
        store.set({ status: 'blocked' });
      } else {
        bags.get(track.world)?.markFailed(track.youtubeId);
        next();
      }
    }, WATCHDOG_MS);
  }

  function revealPlayer() {
    ytWrap.classList.add('reveal');
    ytWrap.setAttribute('aria-hidden', 'false');
    if (!document.querySelector('.yt-hint')) {
      const hint = document.createElement('p');
      hint.className = 'yt-hint';
      hint.textContent = en.tapVideo;
      ytWrap.after(hint);
    }
  }
  function hideReveal() {
    ytWrap.classList.remove('reveal');
    ytWrap.setAttribute('aria-hidden', 'true');
    document.querySelector('.yt-hint')?.remove();
  }

  function next() {
    const st = store.get();
    if (!st.started) return;
    const t = bags.get(st.world)!.next();
    if (!t) {
      clearTimeout(watchdog);
      yt.pause();
      store.set({ track: null, status: 'empty' });
      return;
    }
    if (!yt.created) {
      // YouTube never loaded (offline or blocked). Keep the scene and ambience going.
      store.set({ track: null, status: 'nosignal' });
      return;
    }
    userPaused = false;
    store.set({ track: t, status: 'tuning' });
    setNowPlaying(t, en[`world_${t.world}`]);
    yt.load(t.youtubeId, t.startAt ?? 0);
    yt.setVolume(st.muted ? 0 : st.volume);
    armWatchdog(t);
  }

  /** Must run synchronously inside the user gesture (iOS only unlocks audio there). */
  function unlockAudio(): AudioContext | null {
    try {
      const nav = navigator as Navigator & { audioSession?: { type: string } };
      if (nav.audioSession) nav.audioSession.type = 'playback'; // play even with the iOS silent switch on
      const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new Ctx();
      const src = ctx.createBufferSource();
      src.buffer = ctx.createBuffer(1, 1, 22050);
      src.connect(ctx.destination);
      src.start(0);
      void ctx.resume();
      return ctx;
    } catch {
      return null;
    }
  }

  async function loadAmbience(ctx: AudioContext | null): Promise<Ambience | null> {
    if (ambience) return ambience;
    if (!ctx) return null;
    try {
      const { createAmbience } = await import('./ambience/engine');
      ambience = createAmbience(ctx);
      return ambience;
    } catch {
      return null;
    }
  }

  const persist = () => {
    const { world, volume, ambience: amb } = store.get();
    savePrefs({ world, volume, ambience: amb });
  };

  const app = {
    store,

    /** First user gesture. Starts ambience at once, then the YouTube player. */
    async start() {
      if (store.get().started) return;
      store.set({ started: true, status: 'tuning' });
      const ambP = loadAmbience(unlockAudio()).then((a) => {
        if (!a) return;
        const s = store.get();
        a.start(s.world, s.phase);
        a.setVolume(s.muted ? 0 : s.volume);
        a.setEnabled(s.ambience);
      });
      try {
        await yt.init();
        next();
      } catch {
        store.set({ status: 'nosignal' });
      }
      await ambP;
    },

    async retry() {
      if (!store.get().started) return app.start();
      try {
        await yt.init();
        next();
      } catch {
        store.set({ status: 'nosignal' });
      }
    },

    next,

    previous() {
      const t = store.get().track;
      if (t) yt.restart(t.startAt ?? 0);
    },

    togglePlay() {
      const st = store.get();
      if (!st.started) return void app.start();
      if (st.status === 'playing') {
        userPaused = true;
        yt.pause();
        store.set({ status: 'paused' });
      } else if (st.status === 'nosignal') {
        void app.retry();
      } else if (st.track) {
        userPaused = false;
        yt.play();
        armWatchdog(st.track);
      } else {
        next();
      }
    },

    setWorld(world: WorldId) {
      ambience?.crackle();
      if (world === store.get().world) return;
      store.set({ world });
      ambience?.setWorld(world);
      persist();
      if (store.get().started) next();
    },

    setPhase(phase: Phase) {
      if (phase === store.get().phase) return;
      store.set({ phase });
      ambience?.setPhase(phase);
    },

    setVolume(v: number) {
      const volume = Math.max(0, Math.min(100, Math.round(v)));
      store.set({ volume, muted: false });
      yt.setVolume(volume);
      ambience?.setVolume(volume);
      persist();
    },

    toggleMute() {
      const muted = !store.get().muted;
      store.set({ muted });
      const v = muted ? 0 : store.get().volume;
      yt.setVolume(v);
      ambience?.setVolume(v);
    },

    toggleAmbience() {
      const on = !store.get().ambience;
      store.set({ ambience: on });
      ambience?.setEnabled(on);
      persist();
    },
  };

  initMediaSession({
    play: () => store.get().status !== 'playing' && app.togglePlay(),
    pause: () => store.get().status === 'playing' && app.togglePlay(),
    next: app.next,
    previous: app.previous,
  });

  return app;
}

export type App = ReturnType<typeof createApp>;
