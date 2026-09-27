import 'server-only';

/**
 * Per-client, per-target attempt limiting.
 *
 * Tuned for a classroom, not a bank: a team that mistypes a password four
 * times must never hit this, while a script grinding a 48-word list through
 * the API must find that slower and more boring than just using `hash`.
 *
 * In-memory on purpose. There is no database in this project, the whole thing
 * runs for one class period, and a limiter that resets when the server
 * restarts is the correct amount of limiter for that.
 */
const WINDOW_MS = 60_000;
const MAX_ATTEMPTS = 8;
const COOLDOWN_MS = 20_000;

interface Bucket {
  attempts: number[];
  cooldownUntil: number;
}

const buckets = new Map<string, Bucket>();

/** Keeps the map from growing without bound across a long-running server. */
function sweep(now: number): void {
  if (buckets.size < 500) return;
  for (const [key, bucket] of buckets) {
    const stale = bucket.cooldownUntil < now && bucket.attempts.every((at) => now - at > WINDOW_MS);
    if (stale) buckets.delete(key);
  }
}

export interface RateDecision {
  allowed: boolean;
  retryAfterSeconds: number;
}

export function takeAttempt(clientId: string, target: string, now = Date.now()): RateDecision {
  sweep(now);
  const key = `${clientId}::${target}`;
  const bucket = buckets.get(key) ?? { attempts: [], cooldownUntil: 0 };

  if (now < bucket.cooldownUntil) {
    return { allowed: false, retryAfterSeconds: Math.ceil((bucket.cooldownUntil - now) / 1000) };
  }

  bucket.attempts = bucket.attempts.filter((at) => now - at < WINDOW_MS);
  if (bucket.attempts.length >= MAX_ATTEMPTS) {
    bucket.cooldownUntil = now + COOLDOWN_MS;
    bucket.attempts = [];
    buckets.set(key, bucket);
    return { allowed: false, retryAfterSeconds: Math.ceil(COOLDOWN_MS / 1000) };
  }

  bucket.attempts.push(now);
  buckets.set(key, bucket);
  return { allowed: true, retryAfterSeconds: 0 };
}

/** A correct answer clears the bucket — no reason to punish a solved lock. */
export function clearAttempts(clientId: string, target: string): void {
  buckets.delete(`${clientId}::${target}`);
}

export const RATE_LIMIT_CONFIG = { WINDOW_MS, MAX_ATTEMPTS, COOLDOWN_MS } as const;
