// All user-facing copy lives here. UI copy is English. Devanagari appears only in the जोहार.fm
// wordmark (index.html) and in the small Nagpuri word under each dial label (`nag` below).

export const en = {
  tapToTune: 'Tap to tune in',
  tuning: 'Tuning…',
  noSignal: 'No signal',
  emptyWorld: 'No songs on this station yet',
  retry: 'Tap ▶ to retry',
  tapVideo: 'Tap the video to start the music',
  /** Shown under the wordmark: Jharkhand (Ranchi, the capital), as on the state's Wikipedia infobox. */
  coords: '23.35° N, 85.33° E',
  world_akhra: 'Love',
  world_trekker: 'Travel',
  world_biha: 'Party',
  world_parab: 'Relaxed',
  festival_karam: 'Happy Karam',
  festival_sarhul: 'Happy Sarhul',
  festival_jitiya: 'Happy Jitiya',
  festival_fagua: 'Happy Fagua',
  play: 'Play',
  pause: 'Pause',
  next: 'Next song',
  volume: 'Volume',
  ambience: 'Village sounds',
  madeWithLove: 'Made with love from Jharkhand',
  suggest: 'Suggest a song',
};

export type StringKey = keyof typeof en;

/**
 * Nagpuri word shown under each dial label. Drafts: each is marked `// VERIFY` until a native speaker
 * has checked it (tests/i18n.test.ts enforces the marker while NAG_REVIEWED is false).
 */
export const NAG_REVIEWED = false;

export const nag = {
  world_akhra: 'माया', // VERIFY: love
  world_trekker: 'डहर', // VERIFY: road, path
  world_biha: 'नाच', // VERIFY: dance
  world_parab: 'जुड़ाव', // VERIFY: cool, soothing
};
