'use client';

import { formatCountdown, isUrgent } from '@/lib/session';
import { useSecondsTick } from '@/lib/hooks';

interface StatusBarProps {
  startedAt: number;
  findings: number;
  team: string | null;
  aborted: boolean;
}

export function StatusBar({ startedAt, findings, team, aborted }: StatusBarProps) {
  const seconds = useSecondsTick();
  const now = seconds === null ? null : seconds * 1000;
  const urgent = now !== null && !aborted && isUrgent(startedAt, now);

  return (
    <div className="term-status" data-urgent={urgent} role="status" aria-live="off">
      <span>MERIDIAN GRID · OT CONSOLE</span>
      <span>
        FINDINGS <strong>{findings}/5</strong>
      </span>
      <span>{aborted ? 'CASCADE STOOD DOWN' : 'CASCADE ARMED'}</span>
      <span>{now === null ? 'T-··:··' : formatCountdown(startedAt, now)}</span>
      {team ? <span>TEAM {team.toUpperCase()}</span> : null}
    </div>
  );
}
