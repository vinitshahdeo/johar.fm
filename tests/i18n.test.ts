import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { en } from '../src/i18n/strings';

const DEVANAGARI = /[ऀ-ॿ]/;

describe('i18n', () => {
  it('has no empty strings', () => {
    for (const v of Object.values(en)) expect(v.trim()).not.toBe('');
  });

  it('keeps UI copy in English (Devanagari only in the wordmark)', () => {
    for (const v of Object.values(en)) expect(v).not.toMatch(DEVANAGARI);
  });

  it('uses Devanagari in index.html only for the जोहार wordmark', () => {
    const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
    const words = html.match(/[ऀ-ॿ]+/g) ?? [];
    expect(words).toEqual(['जोहार']);
  });
});
