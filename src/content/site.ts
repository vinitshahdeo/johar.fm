export const SITE_URL = 'https://johar-fm.vercel.app';
export const REPO = 'vinitshahdeo/johar.fm';
export const SUGGEST_URL = `https://github.com/${REPO}/issues/new?template=suggest-a-song.yml`;

export const FAQ: { q: string; a: string }[] = [
  {
    q: 'What is johar.fm?',
    a: 'johar.fm is a free Nagpuri/Sadri radio from Jharkhand. Pick a mood (Love, Travel, Party or Festive), tap once, and it keeps playing theth Nagpuri, jhumar, 2000s trekker hits, wedding and festival songs over the sounds of a village evening.',
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
