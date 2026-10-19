import { describe, expect, it } from 'vitest';
import { editDistance, matchScore, titlesMatch, tokens } from '../scripts/lib/match';

describe('tokens', () => {
  it('drops noise words, years and punctuation', () => {
    expect(tokens('Pokhara Ke Pire Guiya | New Nagpuri Video Song 2016 (Official)')).toEqual([
      'pokhara', 'ke', 'pire', 'guiya',
    ]);
  });
  it('keeps Devanagari intact', () => {
    expect(tokens('पोखरा के पीरे गुईया')).toHaveLength(4);
  });
});

describe('titlesMatch', () => {
  it('matches padded uploads', () => {
    expect(titlesMatch('Pokhara Ke Pire Guiya', 'POKHARA KE PIRE GUIYA || Full HD Nagpuri Song 2016')).toBe(true);
  });
  it('tolerates one-letter spelling variants on longer words', () => {
    expect(titlesMatch('Pokhara Ke Pire Guiya', 'Pokhra Ke Pire Guiyan')).toBe(true);
  });
  it('rejects a different song', () => {
    expect(titlesMatch('Pokhara Ke Pire Guiya', 'Some Other Bhojpuri Hit')).toBe(false);
  });
  it('rejects placeholder titles', () => {
    expect(titlesMatch('TODO', 'Pokhara Ke Pire Guiya')).toBe(false);
  });
  it('does not fuzz short words', () => {
    expect(matchScore('ke', 'ka')).toBe(0);
  });
});

describe('editDistance', () => {
  it('computes Levenshtein distance', () => {
    expect(editDistance('kitten', 'sitting')).toBe(3);
    expect(editDistance('guiya', 'guiyan')).toBe(1);
    expect(editDistance('', 'abc')).toBe(3);
  });
});
