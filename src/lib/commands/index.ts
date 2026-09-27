import { FS_COMMANDS } from './fs';
import { TOOL_COMMANDS } from './tools';
import { INVESTIGATE_COMMANDS } from './investigate';
import { GAME_COMMANDS } from './game';
import { META_COMMANDS, matchesPattern, setRegistry } from './meta';
import { dim, echoInput, fail } from '@/lib/terminal/output';
import { tokenize } from '@/lib/terminal/parse';
import type { Command, CommandContext, OutputLine } from '@/lib/terminal/types';

export const COMMANDS: readonly Command[] = [
  ...META_COMMANDS,
  ...FS_COMMANDS,
  ...TOOL_COMMANDS,
  ...INVESTIGATE_COMMANDS,
  ...GAME_COMMANDS,
];

setRegistry(COMMANDS);

export const COMMAND_NAMES: readonly string[] = COMMANDS.flatMap((command) => [
  command.name,
  ...(command.aliases ?? []),
]).sort();

export function findCommand(name: string): Command | undefined {
  return COMMANDS.find((command) => command.name === name || command.aliases?.includes(name));
}

/**
 * Suggests a command for a typo, using edit distance capped at 2. A dead end
 * is the worst thing that can happen to a team with 40 minutes on the clock.
 */
export function suggest(name: string): string | undefined {
  let best: { name: string; distance: number } | undefined;
  for (const candidate of COMMAND_NAMES) {
    const distance = editDistance(name, candidate);
    if (distance <= 2 && (!best || distance < best.distance)) best = { name: candidate, distance };
  }
  return best?.name;
}

function editDistance(a: string, b: string): number {
  const previous = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let diagonal = previous[0];
    previous[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const temp = previous[j];
      previous[j] = Math.min(
        previous[j] + 1,
        previous[j - 1] + 1,
        diagonal + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
      diagonal = temp;
    }
  }
  return previous[b.length];
}

/**
 * Runs one input line and returns everything to print, echo included.
 *
 * Supports a single `| grep <pattern>` stage. Full pipes would be a shell;
 * one stage is the one students actually reach for during log analysis.
 */
export async function runLine(
  input: string,
  ctx: CommandContext,
  prompt: string,
): Promise<OutputLine[]> {
  const echo = echoInput(prompt, input);
  const trimmed = input.trim();
  if (trimmed === '') return [echo];

  const [head, ...rest] = trimmed.split('|');
  const tokens = tokenize(head.trim());
  const [name, ...args] = tokens;

  const command = findCommand(name);
  if (!command) {
    const alternative = suggest(name);
    return [
      echo,
      fail(`${name}: command not found`),
      alternative ? dim(`  did you mean \`${alternative}\`?`) : dim('  try `help`'),
    ];
  }

  let output = await command.run(args, ctx);

  for (const stage of rest) {
    const stageTokens = tokenize(stage.trim());
    if (stageTokens[0] !== 'grep' || stageTokens.length < 2) {
      return [echo, ...output, fail('pipe: only `| grep <pattern>` is supported')];
    }
    const pattern = stageTokens[1];
    const filtered = output.filter((line) => matchesPattern(line.text, pattern));
    output = filtered.length > 0 ? filtered : [dim('(no matches)')];
  }

  return [echo, ...output];
}
