import { lookup, resolvePath } from '@/lib/vfs';
import { dim, fail, lines, ok, plain, rule } from '@/lib/terminal/output';
import { parseArgs } from '@/lib/terminal/parse';
import type { Command, OutputLine } from '@/lib/terminal/types';
import { wrap } from './game';

/** Populated by the registry to avoid an import cycle. */
let registry: readonly Command[] = [];
export function setRegistry(commands: readonly Command[]): void {
  registry = commands;
}

const GROUPS: readonly { title: string; names: readonly string[] }[] = [
  { title: 'orient', names: ['help', 'man', 'briefing', 'locks', 'status', 'hint'] },
  { title: 'filesystem', names: ['ls', 'cat', 'cd', 'pwd', 'tree', 'grep'] },
  { title: 'toolbelt', names: ['caesar'] },
  {
    title: 'investigate',
    names: ['mail', 'headers', 'badge', 'roster', 'scan', 'fw', 'log', 'ticket'],
  },
  { title: 'act', names: ['unlock', 'abort', 'accuse', 'report'] },
  { title: 'console', names: ['team', 'effects', 'clear', 'whoami', 'reset'] },
];

export const help: Command = {
  name: 'help',
  summary: 'list commands',
  usage: 'help [command]',
  manual: ['Lists every command. `man <command>` explains one properly.'],
  run(args, ctx) {
    const { positional } = parseArgs(args);
    if (positional.length > 0) return man.run(positional, ctx);

    const byName = new Map(registry.map((command) => [command.name, command]));
    const out: OutputLine[] = [];
    for (const group of GROUPS) {
      out.push(dim(`${group.title}`));
      for (const name of group.names) {
        const command = byName.get(name);
        if (command) out.push(plain(`  ${command.name.padEnd(10)}${command.summary}`));
      }
      out.push(plain(''));
    }
    out.push(dim('`man <command>` for detail, including what the idea behind it is.'));
    out.push(dim('output too busy? `effects off`.'));
    return out;
  },
};

export const man: Command = {
  name: 'man',
  summary: 'explain a command in detail',
  usage: 'man <command>',
  manual: ['The long form. Most entries also explain the security idea involved.'],
  run(args) {
    const { positional } = parseArgs(args);
    const name = positional[0];
    if (!name) return [fail('man: what manual page do you want?')];

    const command = registry.find(
      (entry) => entry.name === name || entry.aliases?.includes(name),
    );
    if (!command) return [fail(`man: no manual entry for '${name}'`)];

    return [
      plain(`${command.name.toUpperCase()}(1)`),
      rule(),
      plain('NAME'),
      plain(`    ${command.name}  ::  ${command.summary}`),
      plain(''),
      plain('USAGE'),
      plain(`    ${command.usage}`),
      plain(''),
      plain('NOTES'),
      ...command.manual.flatMap((paragraph) =>
        paragraph === '' ? [plain('')] : lines(wrap(paragraph, 68).map((l) => `    ${l}`)),
      ),
    ];
  },
};

export const grep: Command = {
  name: 'grep',
  summary: 'filter lines matching a pattern',
  usage: 'grep <pattern> <path>   |   <command> | grep <pattern>',
  manual: [
    'Prints only the lines containing a pattern. Case-insensitive.',
    '',
    '  grep 10.40 /var/evidence/README',
    '  log relay | grep 10.40',
    '  badge | grep Lobby',
    '',
    'Filtering is most of log analysis. The other part is knowing which two',
    'logs to filter, and then putting them next to each other.',
  ],
  run(args, ctx) {
    const { positional } = parseArgs(args);
    if (positional.length < 2) {
      return [fail('grep: usage: grep <pattern> <path>, or pipe into it: log auth | grep fail')];
    }
    const [pattern, rawPath] = positional;
    const node = lookup(resolvePath(ctx.cwd, rawPath));
    if (!node) return [fail(`grep: ${rawPath}: No such file or directory`)];
    if (node.kind !== 'file') return [fail(`grep: ${rawPath}: Is a directory`)];
    if (node.denied) return [fail(`grep: ${rawPath}: Permission denied`)];
    if (node.text === undefined) return [fail(`grep: ${rawPath}: binary file, try \`hex --dump\``)];

    const matches = node.text.split('\n').filter((line) => matchesPattern(line, pattern));
    return matches.length > 0 ? lines(matches) : [dim('(no matches)')];
  },
};

export function matchesPattern(line: string, pattern: string): boolean {
  return line.toLowerCase().includes(pattern.toLowerCase());
}

export const clear: Command = {
  name: 'clear',
  summary: 'clear the screen',
  usage: 'clear',
  manual: ['Clears the scrollback. History survives (use the up arrow).'],
  run(_args, ctx) {
    ctx.clearScreen();
    return [];
  },
};

export const whoami: Command = {
  name: 'whoami',
  summary: 'print the current account and its role',
  usage: 'whoami',
  manual: ['Who the console thinks you are, and what that gets you.'],
  run() {
    return [
      plain('soc-night'),
      dim('  role  ROLE-SOC-NIGHT'),
      dim('  scope /var  (read only)'),
      dim('  note  you are deliberately low-privileged, which is correct, and'),
      dim('        is why /etc/shadow will refuse you and /var/evidence will not.'),
    ];
  },
};

export const effects: Command = {
  name: 'effects',
  summary: 'turn the CRT effects on or off',
  usage: 'effects <on|off>',
  manual: [
    'Scanlines, glow and flicker. Off is a perfectly good way to play, and is',
    'the default if your system asks for reduced motion.',
  ],
  run(args, ctx) {
    const value = (args[0] ?? '').toLowerCase();
    if (value !== 'on' && value !== 'off') {
      return [plain(`effects: ${ctx.state.effects ? 'on' : 'off'}`), dim('  usage: effects <on|off>')];
    }
    ctx.patchState({ effects: value === 'on' });
    return [ok(`effects ${value}`)];
  },
};

export const reset: Command = {
  name: 'reset',
  summary: 'wipe progress and start over',
  usage: 'reset --confirm',
  manual: [
    'Clears all progress on this machine. For the facilitator between class',
    'periods. Requires --confirm so nobody does it by accident on finding 4.',
  ],
  run(args, ctx) {
    const { flags } = parseArgs(args);
    if (!flags.confirm) {
      return [
        fail('reset: this wipes all progress on this machine.'),
        dim('  run `reset --confirm` if you mean it'),
      ];
    }
    ctx.patchState({
      open: [],
      hints: {},
      aborted: false,
      attributed: false,
      seenBeats: [],
      startedAt: Date.now(),
    });
    ctx.clearScreen();
    return [ok('progress cleared. reload the page to replay the boot sequence.')];
  },
};

export const META_COMMANDS = [help, man, grep, clear, whoami, effects, reset];
