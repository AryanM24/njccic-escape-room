import { runLine } from '@/lib/commands';
import { initialState } from '@/lib/progress';
import { HOME } from '@/lib/vfs';
import { checkAnswer, rejectionFor } from '@/server/answer-keys';
import type { CommandContext, GameState, OutputLine } from '@/lib/terminal/types';

/**
 * A headless terminal. Tests drive the same code path the browser does —
 * `runLine` in, rendered lines out — so a test passing means a student can
 * actually type those commands and get that output.
 */
export class TestTerminal {
  state: GameState = { ...initialState(0), open: [] };
  cwd = HOME;
  output: OutputLine[] = [];

  private context(): CommandContext {
    return {
      cwd: this.cwd,
      state: this.state,
      setCwd: (path) => {
        this.cwd = path;
      },
      // Validates against the real server keys and returns the real rejection
      // text, so tests see exactly what a student would — minus the HTTP hop.
      submit: async (target, answer) =>
        checkAnswer(target, answer)
          ? { correct: true }
          : { correct: false, message: rejectionFor(target, answer) },
      patchState: (patch) => {
        this.state = { ...this.state, ...patch };
      },
      clearScreen: () => {
        this.output = [];
      },
    };
  }

  /** Runs a line and returns its output, minus the echoed prompt line. */
  async run(line: string): Promise<string> {
    this.output = await runLine(line, this.context(), '$ ');
    return this.output
      .slice(1)
      .map((entry) => entry.text)
      .join('\n');
  }
}

/** Extracts the first capture group of `pattern` from command output. */
export function capture(text: string, pattern: RegExp): string {
  const match = text.match(pattern);
  if (!match || match[1] === undefined) {
    throw new Error(`pattern ${pattern} did not match output:\n${text}`);
  }
  return match[1];
}
