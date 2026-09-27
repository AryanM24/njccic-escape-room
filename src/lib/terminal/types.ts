import type { LockId } from '@/content/types';

export type Tone =
  | 'default'
  | 'dim'
  | 'ok'
  | 'fail'
  | 'hint'
  | 'story'
  | 'alert'
  | 'input'
  | 'rule';

export interface OutputLine {
  text: string;
  tone: Tone;
  /** Story lines type out; everything else prints instantly. */
  typed?: boolean;
  /** ASCII art. Rendered aria-hidden, because it reads as noise aloud. */
  decorative?: boolean;
}

export interface GameState {
  /** Locks the team has opened, in the order they opened them. */
  open: LockId[];
  /** Highest hint tier revealed per lock, 0-3. */
  hints: Partial<Record<LockId, number>>;
  aborted: boolean;
  attributed: boolean;
  /** Epoch ms of first boot; drives the countdown. */
  startedAt: number;
  team: string | null;
  effects: boolean;
  /** Beats that have fired, so they never repeat on refresh. */
  seenBeats: string[];
}

export interface UnlockOutcome {
  correct: boolean;
  message?: string;
  retryAfterSeconds?: number;
}

export interface CommandContext {
  cwd: string;
  state: Readonly<GameState>;
  setCwd(path: string): void;
  /** Server-validated. Never compares answers locally. */
  submit(target: LockId | 'accuse', answer: string): Promise<UnlockOutcome>;
  /** Applied by the host component after the command returns. */
  patchState(patch: Partial<GameState>): void;
  clearScreen(): void;
}

export interface Command {
  name: string;
  summary: string;
  usage: string;
  manual: readonly string[];
  aliases?: readonly string[];
  /** Hidden from `help` but still runnable (easter eggs, aliases). */
  hidden?: boolean;
  run(args: readonly string[], ctx: CommandContext): OutputLine[] | Promise<OutputLine[]>;
}
