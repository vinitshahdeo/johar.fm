// All user-facing copy lives here.
//
// `nag` is Nagpuri/Sadri in Devanagari. Every line is a DRAFT and is marked `// VERIFY` until a
// native speaker has checked the dialect. tests/i18n.test.ts fails if any `nag` string loses its
// marker while DIALECT_REVIEWED is false. After review: remove the markers you've checked and set
// DIALECT_REVIEWED = true.

export const DIALECT_REVIEWED = false;

export const nag = {
  greeting: 'जोहार', // VERIFY
  tapToTune: 'छुआ, रेडियो चालू करा', // VERIFY
  tuning: 'टियुन होवत हे…', // VERIFY
  noSignal: 'सिगनल नखे', // VERIFY
  emptyWorld: 'इ टेसन में अभी गीत नखे', // VERIFY
  retry: 'फिर से', // VERIFY
  tapVideo: 'गीत चालू करेक ले वीडियो के छुआ', // VERIFY
  phase_morning: 'बिहान होय गेलक', // VERIFY
  phase_afternoon: 'दुपहरिया बेरा', // VERIFY
  phase_dusk: 'साँझ होय गेलक, अखड़ा चला', // VERIFY
  phase_night: 'रात होय गेलक', // VERIFY
  world_akhra: 'अखड़ा', // VERIFY
  world_trekker: 'टेकर', // VERIFY
  world_biha: 'बिहा', // VERIFY
  world_parab: 'परब', // VERIFY
  festival_karam: 'करम परब के जोहार', // VERIFY
  festival_sarhul: 'सरहुल परब के जोहार', // VERIFY
  festival_jitiya: 'जितिया परब के जोहार', // VERIFY
  festival_fagua: 'फगुआ के जोहार', // VERIFY
  play: 'बजावा', // VERIFY
  pause: 'रोका', // VERIFY
  next: 'आगे', // VERIFY
  volume: 'आवाज', // VERIFY
  ambience: 'गाँव कर आवाज', // VERIFY
  madeWithLove: 'झारखंड ले माया संगे बनाल', // VERIFY
  suggest: 'गीत बतावा', // VERIFY
} as const;

export type StringKey = keyof typeof nag;

export const en: Record<StringKey, string> = {
  greeting: 'Johar',
  tapToTune: 'Tap to tune in',
  tuning: 'Tuning…',
  noSignal: 'No signal',
  emptyWorld: 'No songs on this station yet',
  retry: 'Tap ▶ to retry',
  tapVideo: 'Tap the video to start the music',
  phase_morning: 'Good morning',
  phase_afternoon: 'Afternoon',
  phase_dusk: 'Dusk — come to the akhra',
  phase_night: 'Night has fallen',
  world_akhra: 'Akhra',
  world_trekker: 'Trekker',
  world_biha: 'Biha',
  world_parab: 'Parab',
  festival_karam: 'Karam greetings',
  festival_sarhul: 'Sarhul greetings',
  festival_jitiya: 'Jitiya greetings',
  festival_fagua: 'Fagua greetings',
  play: 'Play',
  pause: 'Pause',
  next: 'Next song',
  volume: 'Volume',
  ambience: 'Village sounds',
  madeWithLove: 'Made with love from Jharkhand',
  suggest: 'Suggest a song',
};
