import type { Track } from '../data/playlists';

export interface SessionActions {
  play(): void;
  pause(): void;
  next(): void;
  previous(): void;
}

const ms = (): MediaSession | null => ('mediaSession' in navigator ? navigator.mediaSession : null);

export function initMediaSession(a: SessionActions): void {
  const s = ms();
  if (!s) return;
  const handlers: [MediaSessionAction, () => void][] = [
    ['play', a.play],
    ['pause', a.pause],
    ['nexttrack', a.next],
    ['previoustrack', a.previous],
  ];
  for (const [action, fn] of handlers) {
    try {
      s.setActionHandler(action, fn);
    } catch {
      // Action not supported by this browser.
    }
  }
}

export function setNowPlaying(track: Track, worldName: string): void {
  const s = ms();
  if (!s || typeof MediaMetadata === 'undefined') return;
  s.metadata = new MediaMetadata({
    title: track.title,
    artist: track.artist,
    album: `johar.fm · ${worldName}`,
    artwork: [{ src: '/icon-512.png', sizes: '512x512', type: 'image/png' }],
  });
}

export function setPlaybackState(state: MediaSessionPlaybackState): void {
  const s = ms();
  if (s) s.playbackState = state;
}
