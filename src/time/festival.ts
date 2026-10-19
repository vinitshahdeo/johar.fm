export type FestivalId = 'karam' | 'sarhul' | 'jitiya' | 'fagua';

export interface FestivalEntry {
  id: FestivalId;
  year: number;
  /** Local date, "YYYY-MM-DD". */
  start: string;
  /** Inclusive local date; defaults to `start`. */
  end?: string;
  /** Highlight starts this many days before `start` (default 7). */
  leadDays?: number;
  /** Highlight lasts this many days after `end` (default 2). */
  trailDays?: number;
}

export const DEFAULT_LEAD_DAYS = 7;
export const DEFAULT_TRAIL_DAYS = 2;

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Day number for a "YYYY-MM-DD" string, or null if malformed. Calendar-day arithmetic only (no time zones). */
export function parseDay(s: string): number | null {
  const m = ISO_DATE.exec(s);
  if (!m) return null;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const t = Date.UTC(y, mo - 1, d);
  const check = new Date(t);
  if (check.getUTCFullYear() !== y || check.getUTCMonth() !== mo - 1 || check.getUTCDate() !== d) {
    return null;
  }
  return Math.round(t / 86_400_000);
}

/** Day number of a Date's *local* calendar date. */
export function localDay(date: Date): number {
  return Math.round(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86_400_000);
}

/**
 * The festival whose highlight window contains `date`, or null.
 * If windows overlap, the festival whose start is nearest to today wins.
 * Malformed entries are ignored (the verify script reports them).
 */
export function getActiveFestival(
  date: Date,
  entries: readonly FestivalEntry[],
): FestivalEntry | null {
  const today = localDay(date);
  let best: FestivalEntry | null = null;
  let bestDistance = Infinity;
  for (const e of entries) {
    const start = parseDay(e.start);
    const end = e.end ? parseDay(e.end) : start;
    if (start === null || end === null || end < start) continue;
    const from = start - (e.leadDays ?? DEFAULT_LEAD_DAYS);
    const to = end + (e.trailDays ?? DEFAULT_TRAIL_DAYS);
    if (today < from || today > to) continue;
    const distance = Math.abs(start - today);
    if (distance < bestDistance) {
      best = e;
      bestDistance = distance;
    }
  }
  return best;
}

/** Problems with a festivals config, as human-readable strings. Empty array = valid. */
export function validateFestivals(entries: unknown): string[] {
  if (!Array.isArray(entries)) return ['festivals.json must be an array'];
  const ids = ['karam', 'sarhul', 'jitiya', 'fagua'];
  const errors: string[] = [];
  entries.forEach((e: Partial<FestivalEntry>, i) => {
    const where = `festivals[${i}]`;
    if (!ids.includes(e?.id as string)) errors.push(`${where}: unknown id "${e?.id}"`);
    if (typeof e?.year !== 'number') errors.push(`${where}: year must be a number`);
    const start = typeof e?.start === 'string' ? parseDay(e.start) : null;
    if (start === null) errors.push(`${where}: start must be YYYY-MM-DD`);
    if (e?.end !== undefined) {
      const end = typeof e.end === 'string' ? parseDay(e.end) : null;
      if (end === null) errors.push(`${where}: end must be YYYY-MM-DD`);
      else if (start !== null && end < start) errors.push(`${where}: end is before start`);
    }
    if (start !== null && typeof e?.year === 'number' && !e.start!.startsWith(String(e.year))) {
      errors.push(`${where}: start ${e.start} is not in year ${e.year}`);
    }
  });
  return errors;
}
