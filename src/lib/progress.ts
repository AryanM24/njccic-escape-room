import { LOCK_IDS, isLockId, type LockId } from '@/content/types';
import type { GameState } from './terminal/types';

const STORAGE_KEY = 'nightjar.progress.v1';

export function initialState(now = Date.now()): GameState {
  return {
    open: [],
    hints: {},
    aborted: false,
    attributed: false,
    startedAt: now,
    team: null,
    effects: true,
    seenBeats: [],
  };
}

/**
 * Reads saved progress. A dead battery or an accidental refresh must not cost
 * a team forty minutes, and a corrupted value must not cost them the session
 * either — anything unparseable falls back to a fresh state.
 */
export function loadState(): GameState {
  if (typeof window === 'undefined') return initialState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialState();
    return sanitize(JSON.parse(raw) as unknown);
  } catch {
    return initialState();
  }
}

export function saveState(state: GameState): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Private browsing or a full quota. Play continues, progress just will
    // not survive a refresh — better than crashing mid-lock.
  }
}

export function clearState(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // See saveState.
  }
}

function sanitize(value: unknown): GameState {
  const fallback = initialState();
  if (typeof value !== 'object' || value === null) return fallback;
  const record = value as Record<string, unknown>;

  const open = Array.isArray(record.open)
    ? record.open.filter((id): id is LockId => typeof id === 'string' && isLockId(id))
    : [];

  const hints: Partial<Record<LockId, number>> = {};
  if (typeof record.hints === 'object' && record.hints !== null) {
    for (const id of LOCK_IDS) {
      const tier = (record.hints as Record<string, unknown>)[id];
      if (typeof tier === 'number' && tier >= 0 && tier <= 3) hints[id] = Math.floor(tier);
    }
  }

  return {
    open,
    hints,
    aborted: record.aborted === true,
    attributed: record.attributed === true,
    startedAt: typeof record.startedAt === 'number' ? record.startedAt : fallback.startedAt,
    team: typeof record.team === 'string' ? record.team.slice(0, 32) : null,
    effects: record.effects !== false,
    seenBeats: Array.isArray(record.seenBeats)
      ? record.seenBeats.filter((beat): beat is string => typeof beat === 'string')
      : [],
  };
}

export const PROGRESS_STORAGE_KEY = STORAGE_KEY;
