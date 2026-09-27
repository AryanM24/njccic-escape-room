import { describe, expect, it } from 'vitest';
import crypto from 'node:crypto';

import { sha256Hex } from '@/lib/tools/sha';

/**
 * SHA-256 is hand-written here (see src/lib/tools/sha.ts for why), so it is
 * checked against Node's crypto across lengths that straddle every padding
 * boundary: empty, short, 55/56/63/64/65 bytes, and multi-block.
 *
 * Students never see this. It exists so the server can check an answer
 * without shipping the answer.
 */
const SAMPLES = [
  '',
  'a',
  'abc',
  'hello world',
  'x'.repeat(55),
  'x'.repeat(56),
  'x'.repeat(63),
  'x'.repeat(64),
  'x'.repeat(65),
  'x'.repeat(191),
  '01 nightjar/2026/meridian-grid-authority meridian-grid.net',
  'multi\nline\ninput with punctuation and unicode ✓',
];

describe('sha256', () => {
  for (const sample of SAMPLES) {
    const label = sample.length > 24 ? `${sample.length} bytes` : JSON.stringify(sample);
    it(`matches node for ${label}`, () => {
      expect(sha256Hex(sample)).toBe(
        crypto.createHash('sha256').update(sample, 'utf8').digest('hex'),
      );
    });
  }
});
