import { describe, expect, it } from 'vitest';

import { answerDigest, normalizeAnswer } from '@/lib/answer';
import { checkAnswer } from '@/server/answer-keys';
import { mint, normalize } from '../scripts/mint-answer.mjs';

const SALT = 'nightjar/2026/meridian-grid-authority';

/**
 * The minting script duplicates normalization because it runs as plain Node.
 * Duplication is only safe if something checks it, so: this.
 */
describe('mint-answer script agrees with the app', () => {
  const cases: readonly [string, string, boolean][] = [
    ['01', 'meridian-grid.net', false],
    ['02', '  D-14  ', false],
    ['03', 'wren-4417', false],
    ['04', '10.20.4.31:23', false],
    ['05', 'WKS-40719', false],
    ['accuse', 'Marcus   Tso', false],
  ];

  for (const [target, answer, caseSensitive] of cases) {
    it(`normalizes ${JSON.stringify(answer)} identically`, () => {
      expect(normalize(answer, caseSensitive)).toBe(normalizeAnswer(answer, caseSensitive));
    });

    it(`mints the same digest for ${target}`, () => {
      expect(mint(target, answer, caseSensitive)).toBe(
        answerDigest(target, answer, SALT, caseSensitive),
      );
    });
  }

  it('every one of those spellings is accepted by the server', () => {
    // Sloppy typing — extra spaces, wrong case, a full name instead of a
    // handle — must still open the lock. Teams type fast and under pressure.
    for (const [target, answer] of cases) {
      expect(checkAnswer(target, answer), `${target} / ${JSON.stringify(answer)}`).toBe(true);
    }
  });
});
