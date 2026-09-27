import {
  BRIEFING_TXT,
  EVIDENCE_LOG,
  EVIDENCE_NOTE,
  MOTD,
  OFFBOARDING_MEMO,
  VANCE_RESIGNATION,
} from '@/content/files';

/**
 * A small read-only filesystem.
 *
 * Read-only is a design decision rather than a shortcut: a player who can
 * write files can break their own game, and an escape room that one `rm`
 * can brick is not one you run for thirty students.
 */

export interface VfsFile {
  kind: 'file';
  name: string;
  mode: string;
  owner: string;
  text: string;
  /** Visible in a listing, refuses to open. Teaches the error, on purpose. */
  denied?: boolean;
}

export interface VfsDir {
  kind: 'dir';
  name: string;
  mode: string;
  owner: string;
  children: VfsNode[];
}

export type VfsNode = VfsFile | VfsDir;

const file = (
  name: string,
  text: string,
  options: { mode?: string; owner?: string; denied?: boolean } = {},
): VfsFile => ({
  kind: 'file',
  name,
  mode: options.mode ?? '-rw-r--r--',
  owner: options.owner ?? 'root',
  text,
  denied: options.denied,
});

const dir = (name: string, children: VfsNode[], owner = 'root'): VfsDir => ({
  kind: 'dir',
  name,
  mode: 'drwxr-xr-x',
  owner,
  children,
});

function buildRoot(): VfsDir {
  return dir('/', [
    dir('etc', [file('motd', MOTD), file('shadow', '', { mode: '-rw-------', denied: true })]),
    dir('home', [
      dir('soc', [file('briefing.txt', BRIEFING_TXT, { owner: 'soc-night' })], 'soc-night'),
      dir(
        'r.vance',
        [file('resignation-draft.txt', VANCE_RESIGNATION, { owner: 'r.vance' })],
        'r.vance',
      ),
    ]),
    dir('var', [
      dir('evidence', [
        file('README', EVIDENCE_LOG),
        file('note.txt', EVIDENCE_NOTE),
      ]),
      dir('policy', [file('offboarding.txt', OFFBOARDING_MEMO)]),
      dir('log', [
        file(
          'README',
          'The baseline, relay and mail logs are served by the log subsystem.\n' +
            'Use:  log baseline | log relay | log mail\n' +
            'Door events come from a different vendor entirely:  badge\n',
        ),
      ]),
    ]),
  ]);
}

export const ROOT: VfsDir = buildRoot();

export const HOME = '/home/soc';

/** Resolves `path` against `cwd`, handling `.`, `..`, `~` and absolute paths. */
export function resolvePath(cwd: string, path: string): string {
  const input = path.startsWith('~') ? HOME + path.slice(1) : path;
  const base = input.startsWith('/') ? [] : cwd.split('/').filter(Boolean);

  for (const segment of input.split('/')) {
    if (segment === '' || segment === '.') continue;
    if (segment === '..') base.pop();
    else base.push(segment);
  }
  return `/${base.join('/')}`;
}

export function lookup(path: string): VfsNode | undefined {
  const segments = path.split('/').filter(Boolean);
  let node: VfsNode = ROOT;
  for (const segment of segments) {
    if (node.kind !== 'dir') return undefined;
    const next: VfsNode | undefined = node.children.find((child) => child.name === segment);
    if (!next) return undefined;
    node = next;
  }
  return node;
}

export function fileSize(node: VfsFile): number {
  return node.text.length;
}

/** Every path in the tree, for tab completion. */
export function allPaths(): string[] {
  const out: string[] = [];
  const walk = (node: VfsNode, prefix: string) => {
    const path = `${prefix}/${node.name}`;
    out.push(path);
    if (node.kind === 'dir') for (const child of node.children) walk(child, path);
  };
  for (const child of ROOT.children) walk(child, '');
  return out.sort();
}
