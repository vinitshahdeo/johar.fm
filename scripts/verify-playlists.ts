/**
 * Verifies every YouTube ID in src/data/playlists.json against YouTube's oEmbed endpoint,
 * prints the real title next to our metadata, and exits non-zero on problems.
 *
 *   npm run verify
 *   VERIFY_OFFLINE=warn npm run verify     # network failures warn instead of failing
 *   ALLOW_EMPTY_WORLDS=1 npm run verify    # allow worlds with no playable track yet
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { titlesMatch } from './lib/match.ts';
import { validateFestivals } from '../src/time/festival.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p: string) => JSON.parse(readFileSync(join(root, p), 'utf8'));

const WORLDS = ['akhra', 'trekker', 'biha', 'parab'] as const;
const FESTIVALS = ['karam', 'sarhul', 'jitiya', 'fagua'];
const ID_RE = /^[A-Za-z0-9_-]{11}$/;
const offlineWarn = process.env.VERIFY_OFFLINE === 'warn';
const allowEmpty = process.env.ALLOW_EMPTY_WORLDS === '1';

type Status = 'OK' | 'DEAD' | 'MISMATCH' | 'NETWORK' | 'PENDING' | 'INVALID';
interface Row {
  world: string;
  title: string;
  artist: string;
  id: string;
  ytTitle: string;
  ytAuthor: string;
  status: Status;
}

const errors: string[] = [];
const warnings: string[] = [];

// ---------- structural checks ----------
const tracks: any[] = read('src/data/playlists.json');
if (!Array.isArray(tracks)) throw new Error('playlists.json must be an array');

const seen = new Map<string, number>();
tracks.forEach((t, i) => {
  const where = `playlists[${i}] "${t?.title}"`;
  if (!WORLDS.includes(t?.world)) errors.push(`${where}: unknown world "${t?.world}"`);
  if (typeof t?.title !== 'string' || !t.title.trim()) errors.push(`${where}: missing title`);
  if (typeof t?.artist !== 'string' || !t.artist.trim()) errors.push(`${where}: missing artist`);
  if (typeof t?.youtubeId !== 'string') errors.push(`${where}: youtubeId must be a string ("" for placeholder)`);
  else if (t.youtubeId && !ID_RE.test(t.youtubeId)) errors.push(`${where}: malformed youtubeId "${t.youtubeId}"`);
  if (t?.startAt !== undefined && !(Number.isInteger(t.startAt) && t.startAt >= 0)) {
    errors.push(`${where}: startAt must be a non-negative integer (seconds)`);
  }
  if (t?.festival !== undefined && !FESTIVALS.includes(t.festival)) {
    errors.push(`${where}: unknown festival "${t.festival}"`);
  }
  if (t?.youtubeId) {
    if (seen.has(t.youtubeId)) errors.push(`${where}: duplicate youtubeId (also playlists[${seen.get(t.youtubeId)}])`);
    seen.set(t.youtubeId, i);
  }
});

const artists: any[] = read('src/data/artists.json');
const festivalErrors = validateFestivals(read('src/data/festivals.json'));
errors.push(...festivalErrors.map((e) => `festivals.json: ${e}`));

// ---------- network checks ----------
async function fetchWithRetry(url: string, init: RequestInit = {}): Promise<Response> {
  let lastErr: unknown;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch(url, { ...init, signal: AbortSignal.timeout(10_000) });
      if (res.status >= 500) throw new Error(`HTTP ${res.status}`);
      return res;
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr;
}

async function checkTrack(t: any): Promise<Row> {
  const row: Row = {
    world: t.world,
    title: t.title,
    artist: t.artist,
    id: t.youtubeId,
    ytTitle: '',
    ytAuthor: '',
    status: 'PENDING',
  };
  if (!t.youtubeId) return row;
  if (!ID_RE.test(t.youtubeId)) return { ...row, status: 'INVALID' };
  const url = `https://www.youtube.com/oembed?url=${encodeURIComponent(
    `https://www.youtube.com/watch?v=${t.youtubeId}`,
  )}&format=json`;
  try {
    const res = await fetchWithRetry(url);
    if (!res.ok) return { ...row, status: 'DEAD', ytTitle: `HTTP ${res.status}` };
    const data = (await res.json()) as { title?: string; author_name?: string };
    row.ytTitle = data.title ?? '';
    row.ytAuthor = data.author_name ?? '';
    row.status = titlesMatch(t.titleMatch ?? t.title, row.ytTitle) ? 'OK' : 'MISMATCH';
    return row;
  } catch (e) {
    return { ...row, status: 'NETWORK', ytTitle: String((e as Error).message ?? e) };
  }
}

async function pool<T, R>(items: T[], n: number, fn: (t: T) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(n, items.length) }, async () => {
      while (next < items.length) {
        const i = next++;
        out[i] = await fn(items[i]);
      }
    }),
  );
  return out;
}

const rows = await pool(tracks, 4, checkTrack);

// Artist channel URLs: only check filled ones.
const channelRows = await pool(
  artists.filter((a) => a?.channelUrl),
  4,
  async (a): Promise<[string, string]> => {
    if (!/^https:\/\/(www\.)?youtube\.com\//.test(a.channelUrl)) return [a.name, 'INVALID (must be https://www.youtube.com/...)'];
    try {
      const res = await fetchWithRetry(a.channelUrl, { redirect: 'follow' });
      return [a.name, res.ok ? 'OK' : `DEAD (HTTP ${res.status})`];
    } catch (e) {
      return [a.name, `NETWORK (${(e as Error).message})`];
    }
  },
);

// ---------- report ----------
const clip = (s: string, n: number) => (s.length > n ? s.slice(0, n - 1) + '…' : s).padEnd(n);
console.log(
  `\n${clip('STATUS', 9)} ${clip('WORLD', 8)} ${clip('YOUR TITLE', 30)} ${clip('YOUR ARTIST', 24)} ${clip('YOUTUBE TITLE', 44)} YOUTUBE CHANNEL`,
);
console.log('-'.repeat(140));
for (const r of rows) {
  console.log(
    `${clip(r.status, 9)} ${clip(r.world, 8)} ${clip(r.title, 30)} ${clip(r.artist, 24)} ${clip(r.ytTitle, 44)} ${r.ytAuthor}`,
  );
}
if (channelRows.length) {
  console.log('\nArtist channels');
  for (const [name, status] of channelRows) console.log(`  ${clip(name, 28)} ${status}`);
}

for (const r of rows) {
  const label = `${r.world} / "${r.title}" (${r.id})`;
  if (r.status === 'DEAD') errors.push(`DEAD: ${label} — removed, private, or not embeddable`);
  if (r.status === 'MISMATCH') {
    errors.push(`MISMATCH: ${label} — YouTube says "${r.ytTitle}". Fix the ID, or set "titleMatch" to part of the real title.`);
  }
  if (r.status === 'NETWORK') (offlineWarn ? warnings : errors).push(`NETWORK: ${label} — ${r.ytTitle}`);
}
for (const [name, status] of channelRows) {
  if (status.startsWith('NETWORK')) (offlineWarn ? warnings : errors).push(`artist "${name}": ${status}`);
  else if (status !== 'OK') errors.push(`artist "${name}": ${status}`);
}

const pending = rows.filter((r) => r.status === 'PENDING').length;
for (const w of WORLDS) {
  const ok = rows.filter((r) => r.world === w && r.status === 'OK').length;
  const offlineUnknown = offlineWarn ? rows.filter((r) => r.world === w && r.status === 'NETWORK').length : 0;
  if (ok + offlineUnknown === 0) {
    const msg = `world "${w}" has no playable tracks`;
    (allowEmpty ? warnings : errors).push(allowEmpty ? msg : `${msg} (set ALLOW_EMPTY_WORLDS=1 to build anyway)`);
  }
}

const counts = rows.reduce<Record<string, number>>((acc, r) => ((acc[r.status] = (acc[r.status] ?? 0) + 1), acc), {});
console.log(`\n${rows.length} tracks: ${Object.entries(counts).map(([k, v]) => `${v} ${k}`).join(', ') || 'none'}`);
if (pending) console.log(`${pending} placeholder(s) still need a YouTube ID.`);
for (const w of warnings) console.warn(`warn  ${w}`);
for (const e of errors) console.error(`error ${e}`);

if (errors.length) {
  console.error(`\nverify-playlists failed with ${errors.length} error(s).`);
  process.exit(1);
}
console.log('\nverify-playlists passed.');
