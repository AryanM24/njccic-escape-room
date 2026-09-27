#!/usr/bin/env node
/**
 * Post-build guard: greps the compiled client assets for anything that would
 * let a student skip the work.
 *
 * tests/no-answer-leak.test.ts checks the source. This checks the artifact
 * that actually ships, which is the only one a student can open in DevTools.
 * Run after `next build`.
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const STATIC_DIR = '.next/static';

/** [needle, how many client files may legitimately contain it, why] */
const FORBIDDEN = [
  ['nightjar-wakes-at-dusk', 0, 'lock 02 passphrase'],
  ['10.20.4.31:23', 0, 'lock 04 host:port'],
  ['WREN-4417', 0, 'lock 06 burner id'],
  ['BLACKOUT', 0, 'lock 06 XOR key'],
  ['nightjar/2026/meridian-grid-authority', 0, 'answer-key salt'],
  ['answer-keys', 0, 'server-only module name'],
  // The dictionary attack needs the password in the dictionary; see
  // src/content/files.ts. One occurrence — the wordlist — is expected.
  ['Mer1dian!2019', 1, 'lock 03 password (wordlist, documented exception)'],
];

function walk(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

const files = walk(STATIC_DIR);
if (files.length === 0) {
  console.error(`verify-bundle: no files under ${STATIC_DIR}. Run \`next build\` first.`);
  process.exit(1);
}

let failed = false;
for (const [needle, allowed, why] of FORBIDDEN) {
  const hits = files.filter((file) => readFileSync(file, 'utf8').includes(needle));
  const status = hits.length <= allowed ? 'ok  ' : 'LEAK';
  if (hits.length > allowed) {
    failed = true;
    console.error(`[${status}] ${needle} — ${why}`);
    for (const hit of hits) console.error(`         ${hit}`);
  } else {
    console.log(`[${status}] ${needle} (${hits.length}/${allowed} allowed) — ${why}`);
  }
}

console.log(`\nscanned ${files.length} client asset files`);
if (failed) {
  console.error('\nAnswers reached the client bundle. Fix before shipping to a classroom.');
  process.exit(1);
}
console.log('client bundle is clean.');
