import { caesarCrack, caesarShift } from '@/lib/tools/caesar';
import { lookup, resolvePath } from '@/lib/vfs';
import { dim, fail, lines, plain } from '@/lib/terminal/output';
import { flagString, hasFlag, parseArgs } from '@/lib/terminal/parse';
import type { Command, CommandContext, OutputLine } from '@/lib/terminal/types';

/** Resolves `--file <path>` or the positional text into a string. */
function resolveInput(
  command: string,
  positional: readonly string[],
  filePath: string | undefined,
  ctx: CommandContext,
): { text: string } | { error: OutputLine[] } {
  if (filePath) {
    const node = lookup(resolvePath(ctx.cwd, filePath));
    if (!node) return { error: [fail(`${command}: ${filePath}: No such file or directory`)] };
    if (node.kind !== 'file') return { error: [fail(`${command}: ${filePath}: Is a directory`)] };
    if (node.denied) return { error: [fail(`${command}: ${filePath}: Permission denied`)] };
    return { text: node.text ?? '' };
  }
  if (positional.length === 0) {
    return { error: [fail(`${command}: give me some text, or use --file <path>`)] };
  }
  return { text: positional.join(' ') };
}

export const caesar: Command = {
  name: 'caesar',
  summary: 'shift letters along the alphabet, or try all 25 shifts',
  usage: 'caesar --shift <n> <text>   |   caesar --crack --file <path>',
  manual: [
    'Moves every letter along the alphabet by a fixed amount. Digits, spaces',
    'and punctuation are left exactly as they are.',
    '',
    '  caesar --shift 3 attack at dawn        encrypt with a shift of 3',
    '  caesar --shift -3 dwwdfn dw gdzq       decrypt by shifting back',
    '  caesar --crack --file /var/evidence/note.txt',
    '',
    '--crack prints all 25 possible decryptions, most English-looking first.',
    'That is the whole weakness. A Caesar cipher has 25 keys, so you do not',
    'have to be clever, you only have to be willing to read 25 lines. Any',
    'cipher whose key space you can exhaust by hand is a puzzle, not a',
    'protection.',
    '',
    'What it does still do is stop somebody reading a note over your shoulder,',
    'which is the job it was doing for Caesar in 58 BC and is roughly the only',
    'job it has ever been good at.',
  ],
  run(args, ctx) {
    const { positional, flags } = parseArgs(args, ['file', 'shift']);
    const input = resolveInput('caesar', positional, flagString(flags, 'file'), ctx);
    if ('error' in input) return input.error;

    if (hasFlag(flags, 'crack', 'c')) {
      const ranked = [...caesarCrack(input.text)].sort((a, b) => b.score - a.score);
      const out: OutputLine[] = [
        dim(`trying all 25 shifts, most English-looking first`),
        plain(''),
      ];
      for (const candidate of ranked) {
        out.push(dim(`shift ${String(candidate.shift).padStart(2)}`));
        out.push(...lines(candidate.text.replace(/\n$/, '').split('\n').map((l) => `  ${l}`)));
        out.push(plain(''));
      }
      return out;
    }

    const rawShift = flagString(flags, 'shift');
    if (rawShift === undefined) {
      return [fail('caesar: need --shift <n>, or --crack to try all 25')];
    }
    const shift = Number.parseInt(rawShift, 10);
    if (Number.isNaN(shift)) return [fail(`caesar: '${rawShift}' is not a whole number`)];

    return lines(caesarShift(input.text, shift).replace(/\n$/, '').split('\n'));
  },
};

export const TOOL_COMMANDS = [caesar];
