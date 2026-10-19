import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { DIALECT_REVIEWED, en, nag } from '../src/i18n/strings';

const source = readFileSync(new URL('../src/i18n/strings.ts', import.meta.url), 'utf8');
const nagBlock = source.slice(source.indexOf('export const nag = {'), source.indexOf('} as const;'));
const entryLines = nagBlock.split('\n').filter((l) => /^\s+\w+:\s*'/.test(l));

describe('i18n', () => {
  it('finds every nag entry in the source', () => {
    expect(entryLines).toHaveLength(Object.keys(nag).length);
  });

  it.runIf(!DIALECT_REVIEWED)('marks every Nagpuri string // VERIFY until the dialect is reviewed', () => {
    const unmarked = entryLines.filter((l) => !/\/\/\s*VERIFY\b/.test(l)).map((l) => l.trim());
    expect(unmarked).toEqual([]);
  });

  it('has an English string for every key, and no empty strings', () => {
    expect(Object.keys(en).sort()).toEqual(Object.keys(nag).sort());
    for (const v of [...Object.values(nag), ...Object.values(en)]) expect(v.trim()).not.toBe('');
  });

  it('writes Nagpuri in Devanagari', () => {
    for (const v of Object.values(nag)) expect(v).toMatch(/[ऀ-ॿ]/);
  });
});
