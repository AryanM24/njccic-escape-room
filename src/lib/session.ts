/**
 * Classroom clock.
 *
 * Play begins at 02:15 and the cascade fires at 03:00, which is 45 minutes.
 * The CED paces this course in 45-minute periods, so the countdown on screen
 * runs in real minutes and means exactly what it says.
 *
 * Reaching zero does not end the game. A team on finding 4 when the bell
 * theoretically rings should get to finish finding 4. The console prints
 * OVERRUN and carries on, because ending a lesson early to punish a slow team
 * teaches them nothing.
 */
export const SESSION_MINUTES = 45;
export const URGENT_MINUTES = 10;

export function remainingMs(startedAt: number, now: number): number {
  return SESSION_MINUTES * 60_000 - (now - startedAt);
}

export function formatCountdown(startedAt: number, now: number): string {
  const remaining = remainingMs(startedAt, now);
  if (remaining <= 0) return 'T+OVERRUN';
  const totalSeconds = Math.floor(remaining / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `T-${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function isUrgent(startedAt: number, now: number): boolean {
  return remainingMs(startedAt, now) <= URGENT_MINUTES * 60_000;
}
