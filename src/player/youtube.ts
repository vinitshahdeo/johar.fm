// Thin wrapper over the YouTube IFrame Player API. The API script is loaded lazily (never on first
// paint) and the player is created on the first user tap.

/* Minimal typings for the parts of the API we use. */
interface YTPlayer {
  loadVideoById(o: { videoId: string; startSeconds?: number }): void;
  playVideo(): void;
  pauseVideo(): void;
  seekTo(s: number, allowSeekAhead: boolean): void;
  setVolume(v: number): void;
  getCurrentTime(): number;
  getPlayerState(): number;
  destroy(): void;
}
interface YTNamespace {
  Player: new (el: HTMLElement | string, opts: unknown) => YTPlayer;
}
declare global {
  interface Window {
    YT?: YTNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

export const State = { UNSTARTED: -1, ENDED: 0, PLAYING: 1, PAUSED: 2, BUFFERING: 3, CUED: 5 } as const;

let apiPromise: Promise<YTNamespace> | null = null;

/** Loads https://www.youtube.com/iframe_api once. Rejects on network failure or after `timeoutMs`. */
export function loadYouTubeApi(timeoutMs = 12_000): Promise<YTNamespace> {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (apiPromise) return apiPromise;
  apiPromise = new Promise<YTNamespace>((resolve, reject) => {
    const timer = setTimeout(() => fail(new Error('YouTube API timed out')), timeoutMs);
    const fail = (e: Error) => {
      clearTimeout(timer);
      apiPromise = null; // allow a retry
      reject(e);
    };
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      prev?.();
      clearTimeout(timer);
      resolve(window.YT!);
    };
    const s = document.createElement('script');
    s.src = 'https://www.youtube.com/iframe_api';
    s.async = true;
    s.onerror = () => {
      s.remove();
      fail(new Error('YouTube API failed to load'));
    };
    document.head.append(s);
  });
  return apiPromise;
}

export interface PlayerEvents {
  onState(state: number): void;
  /** YouTube error codes: 2 bad id, 5 HTML5 error, 100 not found/private, 101/150 embedding blocked. */
  onError(code: number): void;
}

export class YouTubeAudio {
  private player: YTPlayer | null = null;
  private ready: Promise<void> | null = null;

  constructor(
    private readonly mount: HTMLElement,
    private readonly events: PlayerEvents,
  ) {}

  /** Creates the player (once). Must be called from a user gesture for autoplay to be allowed. */
  init(): Promise<void> {
    if (this.ready) return this.ready;
    this.ready = loadYouTubeApi().then(
      (YT) =>
        new Promise<void>((resolve) => {
          this.player = new YT.Player(this.mount, {
            host: 'https://www.youtube-nocookie.com',
            width: 200,
            height: 200,
            playerVars: {
              autoplay: 1, controls: 0, disablekb: 1, fs: 0, iv_load_policy: 3,
              playsinline: 1, rel: 0, origin: location.origin,
            },
            events: {
              onReady: () => resolve(),
              onStateChange: (e: { data: number }) => this.events.onState(e.data),
              onError: (e: { data: number }) => this.events.onError(e.data),
            },
          });
        }),
    );
    this.ready.catch(() => (this.ready = null));
    return this.ready;
  }

  load(videoId: string, startAt = 0): void {
    this.player?.loadVideoById({ videoId, startSeconds: startAt });
  }
  play(): void {
    this.player?.playVideo();
  }
  pause(): void {
    this.player?.pauseVideo();
  }
  restart(startAt = 0): void {
    this.player?.seekTo(startAt, true);
  }
  setVolume(v: number): void {
    this.player?.setVolume(v);
  }
  currentTime(): number {
    return this.player?.getCurrentTime() ?? 0;
  }
  get created(): boolean {
    return this.player !== null;
  }
}
