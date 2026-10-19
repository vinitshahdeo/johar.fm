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
  world_love: 'Love',
  world_travel: 'Travel',
  world_party: 'Party',
  world_festive: 'Festive',
  festival_karam: 'Happy Karam',
  festival_sarhul: 'Happy Sarhul',
  festival_jitiya: 'Happy Jitiya',
  festival_fagua: 'Happy Fagua',
  play: 'Play',
  pause: 'Pause',
  next: 'Next song',
  volume: 'Volume',
  ambience: 'Village sounds',
  themeDay: 'Switch to day',
  themeNight: 'Switch to night',
  madeWithLove: 'Made with love from Jharkhand',
  suggest: 'Suggest a song',
};

export type StringKey = keyof typeof en;

/**
 * Nagpuri word shown under each dial label, plus the route painted on the trekker. Drafts: each is marked `// VERIFY` until a native speaker
 * has checked it (tests/i18n.test.ts enforces the marker while NAG_REVIEWED is false).
 */
export const NAG_REVIEWED = false;

export const nag = {
  world_love: 'माया', // VERIFY: love
  world_travel: 'डहर', // VERIFY: road, path
  world_party: 'मांदर', // VERIFY: the mandar drum
  world_festive: 'परब', // VERIFY: festival
  trekker_sign: 'फुलसू से राँची', // VERIFY: "Fulsu se Ranchi", painted on the jeep; check the spelling of Fulsu
  road_sign: 'फुलसू 16 कि.मी.', // VERIFY: road sign ahead of the jeep, arrow pointing back towards Fulsu
};
