import { COMMAND_NAMES } from '@/lib/commands';
import { allPaths, lookup, resolvePath } from '@/lib/vfs';

export interface Completion {
  /** The input line after completing, or the original if nothing matched. */
  value: string;
  /** Candidates to print when the completion is ambiguous. */
  candidates: string[];
}

/**
 * Tab completion. Completes the command name on the first word and a
 * filesystem path on every word after it.
 *
 * Completion matters more here than in a real shell: a student who cannot
 * remember `/var/quarantine/update_handler.ps1` should not lose two minutes
 * retyping it.
 */
export function complete(input: string, cwd: string): Completion {
  const trailingSpace = /\s$/.test(input);
  const words = input.split(/\s+/).filter((word, index) => word !== '' || index === 0);
  const editingNewWord = trailingSpace || words.length === 0;
  const prefix = editingNewWord ? '' : (words[words.length - 1] ?? '');
  const isFirstWord = words.length <= 1 && !trailingSpace;

  const pool = isFirstWord ? [...COMMAND_NAMES] : pathCandidates(prefix, cwd);
  const matches = pool.filter((candidate) => candidate.startsWith(prefix));
  if (matches.length === 0) return { value: input, candidates: [] };

  const shared = longestCommonPrefix(matches);
  const head = editingNewWord ? input : input.slice(0, input.length - prefix.length);
  const completed = `${head}${shared}`;

  if (matches.length === 1) {
    const only = matches[0];
    const node = isFirstWord ? undefined : lookup(resolvePath(cwd, only));
    const suffix = node?.kind === 'dir' ? '' : ' ';
    return { value: `${head}${only}${suffix}`, candidates: [] };
  }
  return { value: completed, candidates: matches.slice(0, 40) };
}

function pathCandidates(prefix: string, cwd: string): string[] {
  if (prefix.startsWith('/')) return allPaths();

  // Relative prefixes complete against the current directory's children.
  const here = lookup(cwd);
  return here?.kind === 'dir' ? here.children.map((child) => child.name) : [];
}

function longestCommonPrefix(values: readonly string[]): string {
  if (values.length === 0) return '';
  let prefix = values[0];
  for (const value of values.slice(1)) {
    while (!value.startsWith(prefix)) prefix = prefix.slice(0, -1);
    if (prefix === '') break;
  }
  return prefix;
}
