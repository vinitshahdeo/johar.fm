// Fuzzy title matching for verify-playlists. Nagpuri titles are spelled many ways in Latin
// script, and uploads pad titles with "Official Video", "Full Song", years, etc.

const NOISE = new Set([
  'official', 'video', 'videos', 'audio', 'song', 'songs', 'full', 'hd', 'new', 'latest', 'superhit',
  'super', 'hit', 'nagpuri', 'sadri', 'jharkhandi', 'theth', 'dj', 'remix', 'lyrics', 'lyrical', 'music',
  'ft', 'feat', 'presents', 'present', 'the', 'a', 'an', 'of', 'by', 'and', 'with', 'mp3', '4k', 'romantic',
]);

export function tokens(s: string): string[] {
  return s
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .split(/[^\p{L}\p{M}\p{N}]+/u)
    .filter((t) => t && !NOISE.has(t) && !/^(19|20)\d\d$/.test(t));
}

export function editDistance(a: string, b: string): number {
  if (a === b) return 0;
  const prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let diag = prev[0];
    prev[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = prev[j];
      prev[j] = Math.min(prev[j] + 1, prev[j - 1] + 1, diag + (a[i - 1] === b[j - 1] ? 0 : 1));
      diag = tmp;
    }
  }
  return prev[b.length];
}

function tokenMatches(t: string, pool: readonly string[]): boolean {
  return pool.some((p) => p === t || (t.length >= 5 && p.length >= 4 && editDistance(t, p) <= 1));
}

export const MATCH_THRESHOLD = 0.6;

/** Share of expected tokens found in the actual title (0–1). */
export function matchScore(expected: string, actual: string): number {
  const want = tokens(expected);
  if (want.length === 0) return 0;
  const have = tokens(actual);
  return want.filter((t) => tokenMatches(t, have)).length / want.length;
}

export function titlesMatch(expected: string, actual: string): boolean {
  return matchScore(expected, actual) >= MATCH_THRESHOLD;
}
