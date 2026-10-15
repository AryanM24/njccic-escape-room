import { readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';
import { describe, expect, it } from 'vitest';

import { checkAnswer } from '@/server/answer-keys';

import { ANSWERS } from './answers';

/**
 * The students taking this activity will open DevTools — that is the course.
 * "View source" must be a dead end, so no answer string may appear anywhere
 * outside src/server/.
 *
 * Listing the answers here is safe: tests are never bundled or deployed.
 */

/**
 * Strings that MUST appear in shipped content for their puzzle to work at all,
 * with the reason. Anything not on this list is a leak.
 */
const ALLOWED: Readonly<Record<string, readonly string[]>> = {
  // The phish has to be sent FROM the look-alike domain or there is nothing
  // to find. The work is noticing it among five messages.
  'meridian-grid.net': ['src/content/mail.ts'],

  // The door has to be in the badge log for the log to be readable. The work
  // is spotting which row is anomalous. locks.ts prints the row back in the
  // finding 02 beat, which a player sees only after filing it.
  'D-14': ['src/content/badge.ts', 'src/content/locks.ts'],

  // The burner ships Caesar-shifted, so the plaintext is not in the artifact.
  // It is named in the finding 03 beat, after the finding is filed.
  'WREN-4417': ['src/content/locks.ts'],

  // The joined host:port form is the literal answer, so it ships nowhere.
  // The host and the port appear separately, which is the puzzle.
  '10.20.4.31:23': [],

  // Addresses are the map the puzzles are drawn on. This one has to appear in
  // the mail headers, the firewall rule and the relay log, because comparing
  // those three IS finding 05 and the attribution chain.
  '10.40.7.19': [
    'src/content/mail.ts',
    'src/content/network.ts',
    'src/content/logs.ts',
    'src/content/badge.ts',
    'src/content/locks.ts',
    'src/content/story.ts',
  ],

  // Cast member. The roster and the change ticket are where attribution is
  // meant to land; story.ts names him only in the post-accusation report.
  'm.tso': ['src/content/badge.ts', 'src/content/network.ts', 'src/content/story.ts'],
};

function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) return entry.name === 'server' ? [] : sourceFiles(full);
    return /\.(ts|tsx|css)$/.test(entry.name) ? [full] : [];
  });
}

describe('no answer leaks into client-reachable source', () => {
  const files = sourceFiles('src');

  it('finds source files to scan', () => {
    expect(files.length).toBeGreaterThan(20);
  });

  for (const answer of ANSWERS) {
    it(`"${answer}" appears only where it must`, () => {
      const allowed = ALLOWED[answer] ?? [];
      const offenders = files
        .map((file) => relative(process.cwd(), file).replaceAll('\\', '/'))
        .filter((file) => !allowed.includes(file))
        .filter((file) => readFileSync(file, 'utf8').includes(answer));

      expect(offenders, `${answer} leaked into: ${offenders.join(', ')}`).toEqual([]);
    });
  }

  it('the server rejects an empty or absurd answer', () => {
    expect(checkAnswer('01', '')).toBe(false);
    expect(checkAnswer('01', 'meridiangrid.net')).toBe(false);
    expect(checkAnswer('nope', 'meridian-grid.net')).toBe(false);
  });

  it('accepts sloppy typing, because teams type fast', () => {
    expect(checkAnswer('01', 'MERIDIAN-GRID.NET')).toBe(true);
    expect(checkAnswer('02', '  d-14  ')).toBe(true);
    expect(checkAnswer('03', 'wren-4417')).toBe(true);
    expect(checkAnswer('accuse', 'Marcus   Tso')).toBe(true);
  });

  it('the Caesar note ships encrypted, not in the clear', () => {
    const note = readFileSync('src/content/files.ts', 'utf8');
    expect(note).not.toContain('BURNER ACCOUNT WREN');
    expect(note).toContain('IBYULY HJJVBUA');
  });
});
