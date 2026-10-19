export type WorldId = 'akhra' | 'trekker' | 'biha' | 'parab';

export const WORLD_IDS: readonly WorldId[] = ['akhra', 'trekker', 'biha', 'parab'];

export function isWorldId(v: unknown): v is WorldId {
  return typeof v === 'string' && (WORLD_IDS as readonly string[]).includes(v);
}
