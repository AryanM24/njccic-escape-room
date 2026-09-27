#!/usr/bin/env node
/**
 * Mints a salted answer digest for src/server/answer-keys.ts.
 *
 *   node scripts/mint-answer.mjs 04 "10.20.4.31:23"
 *   node scripts/mint-answer.mjs 03 'Mer1dian!2019' --case-sensitive
 *
 * Normalization is duplicated from src/lib/answer.ts rather than imported,
 * because this runs as plain Node with no TypeScript loader. The pair is kept
 * honest by tests/mint-script.test.ts, which asserts the two agree.
 */
import { createHash } from 'node:crypto';

const SALT = 'nightjar/2026/meridian-grid-authority';

export function normalize(raw, caseSensitive = false) {
  const collapsed = raw.trim().replace(/\s+/g, ' ');
  return caseSensitive ? collapsed : collapsed.toLowerCase();
}

export function mint(target, answer, caseSensitive = false) {
  return createHash('sha256')
    .update(`${target} ${SALT} ${normalize(answer, caseSensitive)}`, 'utf8')
    .digest('hex');
}

// Only run the CLI when invoked directly, so tests can import the functions.
if (process.argv[1] && import.meta.url.endsWith(process.argv[1].replaceAll('\\', '/'))) {
  const args = process.argv.slice(2);
  const caseSensitive = args.includes('--case-sensitive');
  const [target, answer] = args.filter((arg) => !arg.startsWith('--'));

  if (!target || !answer) {
    console.error('usage: node scripts/mint-answer.mjs <target> <answer> [--case-sensitive]');
    console.error('       target is a lock id (01..08) or "accuse"');
    process.exit(1);
  }

  console.log(`target        : ${target}`);
  console.log(`normalized    : ${JSON.stringify(normalize(answer, caseSensitive))}`);
  console.log(`caseSensitive : ${caseSensitive}`);
  console.log(`digest        : '${mint(target, answer, caseSensitive)}',`);
}
