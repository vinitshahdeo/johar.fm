import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { en, nag, NAG_REVIEWED } from '../src/i18n/strings';

const DEVANAGARI = /[ऀ-ॿ]/;
const source = readFileSync(new URL('../src/i18n/strings.ts', import.meta.url), 'utf8');
const nagBlock = source.slice(source.indexOf('export const nag = {'));
const nagLines = nagBlock.split('\n').filter((l) => /^\s+\w+:\s*'/.test(l));

describe('i18n', () => {
  it('has no empty strings', () => {
    for (const v of [...Object.values(en), ...Object.values(nag)]) expect(v.trim()).not.toBe('');
  });

  it('keeps UI copy in English', () => {
    for (const v of Object.values(en)) expect(v).not.toMatch(DEVANAGARI);
  });

  it('writes the dial words in Devanagari', () => {
    for (const v of Object.values(nag)) expect(v).toMatch(DEVANAGARI);
  });

  it.runIf(!NAG_REVIEWED)('marks every Nagpuri word // VERIFY until reviewed', () => {
    expect(nagLines).toHaveLength(Object.keys(nag).length);
    expect(nagLines.filter((l) => !/\/\/\s*VERIFY\b/.test(l))).toEqual([]);
  });

  it('hard-codes no Devanagari in index.html except जोहार (wordmark and overlay greeting)', () => {
    const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
    expect([...new Set(html.match(/[ऀ-ॿ]+/g) ?? [])]).toEqual(['जोहार']);
  });
});
