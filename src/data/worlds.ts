export type WorldId = 'love' | 'travel' | 'party' | 'festive';

export const WORLD_IDS: readonly WorldId[] = ['love', 'travel', 'party', 'festive'];

export function isWorldId(v: unknown): v is WorldId {
  return typeof v === 'string' && (WORLD_IDS as readonly string[]).includes(v);
}
