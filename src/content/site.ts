export const SITE_URL = 'https://johar-fm.vercel.app';
export const REPO = 'vinitshahdeo/johar.fm';
export const SUGGEST_URL = `https://github.com/${REPO}/issues/new?template=suggest-a-song.yml`;

// Search and share copy. Written around what people actually search for ("Nagpuri songs", "Nagpuri
// superhit songs", "Jharkhandi songs", "old Nagpuri", "Sadri", "Khortha"). Keep SEO_TITLE under ~60
// characters and SEO_DESCRIPTION under ~160 so Google doesn't cut them off.
export const SEO_TITLE = 'Nagpuri Songs Radio: Jharkhandi Superhit Songs | johar.fm';
export const SEO_DESCRIPTION =
  'Free nonstop radio of Nagpuri superhit songs: old Nagpuri, Sadri and Khortha hits, and Jharkhandi love, travel, party and festival songs. One tap to listen.';
export const SHARE_TITLE = 'johar.fm: Nagpuri superhit songs, nonstop';
export const SHARE_DESCRIPTION =
  'Old Nagpuri, Sadri and Khortha hits from Jharkhand. One tap, and the radio never stops.';
export const KEYWORDS = [
  'Nagpuri songs', 'Nagpuri superhit songs', 'old Nagpuri songs', 'Nagpuri love songs', 'Nagpuri DJ songs',
  'Jharkhandi songs', 'Jharkhand songs', 'Sadri songs', 'Khortha songs', 'theth Nagpuri', 'jhumar',
  'Karam songs', 'Sarhul songs', 'Nagpuri radio', 'Jharkhand radio',
];

export const FAQ: { q: string; a: string }[] = [
  {
    q: 'What is johar.fm?',
    a: 'johar.fm is a free, nonstop radio of Nagpuri songs from Jharkhand. Pick a mood (Love, Travel, Party or Festive), tap once, and it keeps playing Nagpuri superhit songs: old Nagpuri, Sadri and Khortha hits, theth Nagpuri and jhumar, 2000s trekker hits, wedding and festival songs.',
  },
  {
    q: 'Where can I listen to Nagpuri superhit songs online for free?',
    a: 'On johar.fm. It plays Jharkhandi and Nagpuri hits back to back, with no sign-up and no ads of its own. It works on any phone or computer browser.',
  },
  {
    q: 'Where does the music come from?',
    a: 'Every song plays from YouTube, using official uploads from the artists’ or labels’ channels wherever possible. Nothing is downloaded or re-hosted, so the artists keep their views.',
  },
  {
    q: 'How do I suggest a song?',
    a: 'Use the “Suggest a song” link at the bottom of the page. It opens a short GitHub issue form with the song title, artist and YouTube link.',
  },
];
