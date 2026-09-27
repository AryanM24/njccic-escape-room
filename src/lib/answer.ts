import { sha256Hex } from './tools/sha';

/**
 * Answer normalization, shared by the server validator and the key-minting
 * script so the two can never disagree.
 *
 * Teams type on classroom keyboards under time pressure. Leading spaces,
 * doubled spaces and stray capitals are typing, not wrong answers.
 */
export function normalizeAnswer(raw: string, caseSensitive = false): string {
  const collapsed = raw.trim().replace(/\s+/g, ' ');
  return caseSensitive ? collapsed : collapsed.toLowerCase();
}

/** Digest domain-separated by target id, so a digest cannot be replayed. */
export function answerDigest(target: string, raw: string, salt: string, caseSensitive = false): string {
  return sha256Hex(`${target} ${salt} ${normalizeAnswer(raw, caseSensitive)}`);
}
