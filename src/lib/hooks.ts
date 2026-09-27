'use client';

import { useSyncExternalStore } from 'react';

/**
 * Browser facts read as external stores rather than as effects that setState
 * on mount. Both are genuinely external, both need a null/false server
 * snapshot to keep hydration honest.
 */

function subscribeToSecond(onChange: () => void): () => void {
  const id = window.setInterval(onChange, 1000);
  return () => window.clearInterval(id);
}

/**
 * Current time, bucketed to whole seconds so the snapshot is referentially
 * stable within a tick. Returns null on the server: the clock must not render
 * until the client owns it, or the first paint shows a time from build time.
 */
export function useSecondsTick(): number | null {
  return useSyncExternalStore(
    subscribeToSecond,
    () => Math.floor(Date.now() / 1000),
    () => null,
  );
}

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

function subscribeToReducedMotion(onChange: () => void): () => void {
  const query = window.matchMedia(REDUCED_MOTION_QUERY);
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
}

/** Honors a mid-session change, which a student toggling OS settings will do. */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeToReducedMotion,
    () => window.matchMedia(REDUCED_MOTION_QUERY).matches,
    () => false,
  );
}
