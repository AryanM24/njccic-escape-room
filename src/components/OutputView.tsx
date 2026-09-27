'use client';

import { memo } from 'react';

import type { OutputLine } from '@/lib/terminal/types';

interface OutputViewProps {
  lines: readonly OutputLine[];
  /** The line currently being typed out, if any. */
  partial: string | null;
}

/**
 * The committed scrollback.
 *
 * Split out and memoized on `lines` alone. The typewriter updates `partial`
 * on every animation tick, and without this split that re-rendered every line
 * in the scrollback several times a second, which is what made a long session
 * feel sluggish.
 */
const CommittedLines = memo(function CommittedLines({ lines }: { lines: readonly OutputLine[] }) {
  return (
    <>
      {lines.map((line, index) => (
        <p
          key={index}
          className={`term-line tone-${line.tone}${line.decorative ? ' term-art' : ''}`}
          aria-hidden={line.decorative ? 'true' : undefined}
        >
          {line.text === '' ? ' ' : line.text}
        </p>
      ))}
    </>
  );
});

/**
 * `role="log"` + `aria-live="polite"` announces each completed block once.
 * The partially typed line is hidden from assistive tech on purpose: a screen
 * reader should hear a finished sentence, not forty character updates.
 */
export function OutputView({ lines, partial }: OutputViewProps) {
  return (
    <div className="term-column" role="log" aria-live="polite" aria-relevant="additions">
      <CommittedLines lines={lines} />
      {partial !== null ? (
        <p className="term-line tone-story" aria-hidden="true">
          {partial}
          <span className="term-cursor">&nbsp;</span>
        </p>
      ) : null}
    </div>
  );
}
