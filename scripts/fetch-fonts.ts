/**
 * Downloads the self-hosted fonts into public/fonts/ (both SIL Open Font License):
 *
 * - Yatra One (display: wordmark, dial words, overlay greeting, trekker sign), subset by Google Fonts to only the
 *   characters the site shows in it. Re-run after changing the Nagpuri words in src/i18n/strings.ts.
 * - Mukta (UI text), Latin subset, weights 400/600/700.
 *
 *   npm run fonts
 */
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { nag } from '../src/i18n/strings.ts';

const dir = fileURLToPath(new URL('../public/fonts/', import.meta.url));
const UA = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36',
};

/** Every character rendered in Yatra One: the wordmark, the overlay greeting and the dial words. */
export const DISPLAY_TEXT = ['जोहार.fm', 'जोहार!', ...Object.values(nag)].join(' ');

async function css(query: string): Promise<string> {
  const res = await fetch(`https://fonts.googleapis.com/css2?${query}`, { headers: UA });
  if (!res.ok) throw new Error(`Google Fonts CSS ${res.status} for ${query}`);
  return res.text();
}

async function save(url: string, file: string) {
  const res = await fetch(url, { headers: UA });
  if (!res.ok) throw new Error(`${res.status} for ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  writeFileSync(dir + file, buf);
  console.log(`public/fonts/${file}  ${Math.ceil(buf.length / 1024)} KB`);
}

const uniq = [...new Set(DISPLAY_TEXT)].join('');
const yatra = await css(`family=Yatra+One&display=swap&text=${encodeURIComponent(uniq)}`);
await save(/url\((https:[^)]+)\)/.exec(yatra)![1], 'yatra-one-subset.woff2');

for (const w of [400, 600, 700]) {
  const c = await css(`family=Mukta:wght@${w}&display=swap`);
  const latin = /\/\* latin \*\/\s*@font-face \{([^}]*)\}/.exec(c);
  if (!latin) throw new Error(`no latin block for Mukta ${w}`);
  await save(/url\((https:[^)]+)\)/.exec(latin[1])![1], `mukta-latin-${w}.woff2`);
}
