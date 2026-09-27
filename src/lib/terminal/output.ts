import type { OutputLine, Tone } from './types';

const line = (tone: Tone) => (text = ''): OutputLine => ({ text, tone });

export const plain = line('default');
export const dim = line('dim');
export const alert = line('alert');

export const ok = (text: string): OutputLine => ({ text: `[ ok ]  ${text}`, tone: 'ok' });
export const fail = (text: string): OutputLine => ({ text: `[fail]  ${text}`, tone: 'fail' });
export const hintLine = (text: string): OutputLine => ({ text: `[hint]  ${text}`, tone: 'hint' });

export const blank = (): OutputLine => ({ text: '', tone: 'default' });

export const rule = (label?: string): OutputLine => ({
  text: label ? `── ${label} ${'─'.repeat(Math.max(0, 64 - label.length))}` : '─'.repeat(68),
  tone: 'rule',
});

export const lines = (source: readonly string[], tone: Tone = 'default'): OutputLine[] =>
  source.map((text) => ({ text, tone }));

/** Story output: cyan, typed out, skippable. */
export const story = (source: readonly string[]): OutputLine[] =>
  source.map((text) => ({ text, tone: 'story' as const, typed: true }));

export const echoInput = (prompt: string, text: string): OutputLine => ({
  text: `${prompt}${text}`,
  tone: 'input',
});

/**
 * Clips a cell so a table row cannot blow past the column budget and wrap.
 * A wrapped table row is unreadable, and these are read under time pressure.
 */
export function truncate(value: string, max: number): string {
  return value.length <= max ? value : `${value.slice(0, max - 1)}…`;
}

/**
 * Fixed-width table. Terminals cannot reflow, so column widths are computed
 * from content and the caller is trusted to keep the total under 96 columns.
 */
export function table(headers: readonly string[], rows: readonly (readonly string[])[]): OutputLine[] {
  const widths = headers.map((header, i) =>
    Math.max(header.length, ...rows.map((row) => (row[i] ?? '').length)),
  );
  const render = (cells: readonly string[]) =>
    cells.map((cell, i) => (cell ?? '').padEnd(widths[i])).join('  ').trimEnd();

  return [
    { text: render(headers), tone: 'dim' },
    { text: widths.map((w) => '─'.repeat(w)).join('  '), tone: 'rule' },
    ...rows.map((row) => ({ text: render(row), tone: 'default' as const })),
  ];
}
