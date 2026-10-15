import { LOCKS } from '@/content/locks';
import type { LockId } from '@/content/types';
import {
  ASIDES_AFTER_MISSES,
  ASIDE_FIRST_FINDING,
  ASIDE_FIRST_HINT,
  ASIDE_FOURTH_FINDING,
  ASIDE_LAST_HINT,
  MISSES_PER_ASIDE,
} from '@/content/asides';
import { story } from '@/lib/terminal/output';
import type { GameState, OutputLine } from '@/lib/terminal/types';

const EMPTY_SEGMENT = '····';

/**
 * The abort key as it stands: filed findings show their segment, the rest show
 * dots. Slots follow lock order, not filing order, because 02, 03 and 04 can
 * be done in any order and the key should still read left to right.
 */
export function abortKeyProgress(open: readonly LockId[]): string {
  return LOCKS.map((lock) => (open.includes(lock.id) ? lock.fragment : EMPTY_SEGMENT)).join('-');
}

export function hintsUsed(state: Readonly<GameState>): number {
  return Object.values(state.hints).reduce<number>((sum, tier) => sum + (tier ?? 0), 0);
}

/** NIGHTJAR reacts to the first and the fourth finding. Three is the midpoint. */
export function findingAside(filed: number): OutputLine[] {
  if (filed === 1) return story(ASIDE_FIRST_FINDING);
  if (filed === 4) return story(ASIDE_FOURTH_FINDING);
  return [];
}

/** `misses` is the running count of wrong answers since the last correct one. */
export function missAside(misses: number): OutputLine[] {
  if (misses === 0 || misses % MISSES_PER_ASIDE !== 0) return [];
  const aside = ASIDES_AFTER_MISSES[misses / MISSES_PER_ASIDE - 1];
  return aside ? story(aside) : [];
}

/** The first hint of the session gets one line, and so does running one dry. */
export function hintAside(tier: number, hintsBefore: number): OutputLine[] {
  if (hintsBefore === 0) return story(ASIDE_FIRST_HINT);
  if (tier === 3) return story(ASIDE_LAST_HINT);
  return [];
}
