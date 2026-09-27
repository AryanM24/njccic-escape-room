import { fileSize, lookup, resolvePath, type VfsDir } from '@/lib/vfs';
import { fail, lines, plain, dim } from '@/lib/terminal/output';
import { parseArgs } from '@/lib/terminal/parse';
import type { Command, OutputLine } from '@/lib/terminal/types';

const notFound = (command: string, path: string): OutputLine[] => [
  fail(`${command}: ${path}: No such file or directory`),
];

export const ls: Command = {
  name: 'ls',
  summary: 'list directory contents',
  usage: 'ls [-l] [path]',
  manual: [
    'Lists what is in a directory.',
    '',
    '  -l    long form: permissions, owner, size',
    '',
    'Start at /home/soc and work outward. Tonight the interesting directory',
    'is /var/evidence.',
  ],
  run(args, ctx) {
    const { positional, flags } = parseArgs(args);
    const target = resolvePath(ctx.cwd, positional[0] ?? '.');
    const node = lookup(target);
    if (!node) return notFound('ls', positional[0] ?? '.');

    const entries = node.kind === 'dir' ? node.children : [node];
    if (!flags.l) {
      const names = entries.map((entry) => (entry.kind === 'dir' ? `${entry.name}/` : entry.name));
      return [plain(names.join('   '))];
    }
    return entries.map((entry) =>
      plain(
        `${entry.mode}  ${entry.owner.padEnd(10)}  ${
          entry.kind === 'dir' ? '-' : String(fileSize(entry))
        }`.padEnd(34) + (entry.kind === 'dir' ? `${entry.name}/` : entry.name),
      ),
    );
  },
};

export const cat: Command = {
  name: 'cat',
  summary: 'print a file',
  usage: 'cat <path>',
  manual: ['Prints a file.'],
  run(args, ctx) {
    const { positional } = parseArgs(args);
    if (positional.length === 0) return [fail('cat: missing operand')];

    const target = resolvePath(ctx.cwd, positional[0]);
    const node = lookup(target);
    if (!node) return notFound('cat', positional[0]);
    if (node.kind === 'dir') return [fail(`cat: ${positional[0]}: Is a directory`)];
    if (node.denied) {
      return [
        fail(`cat: ${positional[0]}: Permission denied`),
        dim('  the overnight SOC account is read-only and deliberately narrow'),
        dim('  what you are allowed to read is under /var. try `tree /var`'),
      ];
    }
    return lines(node.text.replace(/\n$/, '').split('\n'));
  },
};

export const cd: Command = {
  name: 'cd',
  summary: 'change directory',
  usage: 'cd <path>',
  manual: ['Moves the working directory. `cd` with no argument returns to /home/soc.'],
  run(args, ctx) {
    const { positional } = parseArgs(args);
    const target = resolvePath(ctx.cwd, positional[0] ?? '~');
    const node = lookup(target);
    if (!node) return notFound('cd', positional[0] ?? '~');
    if (node.kind !== 'dir') return [fail(`cd: ${positional[0]}: Not a directory`)];
    ctx.setCwd(target);
    return [];
  },
};

export const pwd: Command = {
  name: 'pwd',
  summary: 'print working directory',
  usage: 'pwd',
  manual: ['Prints the current directory.'],
  run(_args, ctx) {
    return [plain(ctx.cwd)];
  },
};

export const tree: Command = {
  name: 'tree',
  summary: 'show the filesystem as a tree',
  usage: 'tree [path]',
  manual: ['Prints everything below a directory. Useful once, at the start.'],
  run(args, ctx) {
    const { positional } = parseArgs(args);
    const target = resolvePath(ctx.cwd, positional[0] ?? '/');
    const node = lookup(target);
    if (!node) return notFound('tree', positional[0] ?? '/');
    if (node.kind !== 'dir') return [plain(node.name)];

    const out: OutputLine[] = [plain(target)];
    const walk = (directory: VfsDir, prefix: string) => {
      directory.children.forEach((child, index) => {
        const last = index === directory.children.length - 1;
        out.push(plain(`${prefix}${last ? '└── ' : '├── '}${child.name}${child.kind === 'dir' ? '/' : ''}`));
        if (child.kind === 'dir') walk(child, `${prefix}${last ? '    ' : '│   '}`);
      });
    };
    walk(node, '');
    return out;
  },
};

export const FS_COMMANDS = [ls, cat, cd, pwd, tree];
