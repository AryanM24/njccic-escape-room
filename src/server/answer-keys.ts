import 'server-only';

import { answerDigest } from '@/lib/answer';

/**
 * Answer keys — salted SHA-256 digests, never plaintext, never shipped.
 *
 * `import 'server-only'` makes this a build error if it is ever pulled into a
 * client component. The students in this class open DevTools; that is the
 * course. "View source" must be a dead end, and the no-plaintext test in
 * tests/no-answer-leak.test.ts keeps it one.
 *
 * Regenerate a digest with:  node scripts/mint-answer.mjs <target> <answer>
 */
const SALT = 'nightjar/2026/meridian-grid-authority';

interface KeyEntry {
  caseSensitive: boolean;
  /** Any digest matching is accepted — these are typing variants, not clues. */
  digests: readonly string[];
}

const KEYS: Readonly<Record<string, KeyEntry>> = {
  '01': {
    caseSensitive: false,
    digests: ['16fd3067cb82b314c1fb98d871539736aaab849d698e2072819c4bf6354f0496'],
  },
  '02': {
    caseSensitive: false,
    digests: [
      'ad6148e72f5d1f2e89b123f5a90ee63b76e907f657a4476486a61865dc9d6fbc',
      'd045185ac0e49ac678c1641565f7811f0bf6127879e023b17c367d745d959bdd',
      '42ff18f3316abd785379a9fd92998fce320e0c9f9932f929e5ec4cf5904a6ff8',
    ],
  },
  '03': {
    caseSensitive: false,
    digests: [
      '9408822b75435d8e23b338dc4217c755044080018dcb12b0926cbe17442076bc',
      '652cd5a91498b43551336ac0a5fea928464f99fad644baada6b8dec8c602b77b',
    ],
  },
  '04': {
    caseSensitive: false,
    digests: [
      'ccb8a7f254910d658358d0dfe69b25c1279831146b85615651cd2319ed981a34',
      'f68fa26c379082266d7f6e7fc87dc77cf4949a7c87ffa15edd5b42cf9302ad73',
      'c53b8d693bea9db1efc35e666e72bf751cd366d9d7b7c802f154e9170f3be476',
    ],
  },
  '05': {
    caseSensitive: false,
    digests: [
      'df62e75b40e37762a9b81d009c17f9b493228e2c55a586db52d4fe3040cd83c0',
      'a5732b2334f447ab3338598093e71d9d2b71a9ec0c20618bc3c58e99cbbb98bc',
    ],
  },
  accuse: {
    caseSensitive: false,
    digests: [
      '5d33837fb544fa22a281cf9e39328ad92b52148bc1b5789b77a844158358513f',
      '8a27574f30660b092ce85aa09516b87a33028ced87eefb9ba4f02cfaabddb072',
      'e55ce549cffc4e7f345aeeb4af0112ddf62b169e115aa96ba7652ddbc596f216',
      'c1b5a288100df10a1e4d37fc5153e7497926a8a0ccb5b1fc888d0e12f325ffbf',
    ],
  },
};

export function isValidTarget(target: string): boolean {
  return Object.hasOwn(KEYS, target);
}

/**
 * Finding 01 asks for a domain, and people paste the whole sender address.
 * Everything after the @ is the domain, so take it, and drop a closing `>`.
 */
function domainOf(answer: string): string {
  const at = answer.lastIndexOf('@');
  return (at >= 0 ? answer.slice(at + 1) : answer).replace(/[>\s]+$/, '');
}

export function checkAnswer(target: string, answer: string): boolean {
  const entry = KEYS[target];
  if (!entry) return false;
  const given = target === '01' ? domainOf(answer) : answer;
  const digest = answerDigest(target, given, SALT, entry.caseSensitive);
  return entry.digests.includes(digest);
}

/** Generic rejections, rotated so the console does not sound like a form. */
const REJECTIONS: readonly string[] = [
  'rejected. That is not what the evidence says.',
  'rejected. Close is not a property the scheduler recognises.',
  'rejected. Right artifact, wrong detail. Read it again.',
];

export function rejectionFor(target: string, answer: string): string {
  if (target === 'accuse') return accusationRejection(answer);
  if (target === '01') {
    const domain = domainOf(answer.trim()).toLowerCase();
    if (!domain.includes('.')) {
      return 'rejected. A domain has a dot in it, like example.net. Record the part of the sender address after the @.';
    }
    if (domain === 'meridiangrid.net') {
      return "rejected. That is Meridian's own domain, and it sent the other messages. Look for a different one.";
    }
  }
  const index = Math.abs(hashInt(answer)) % REJECTIONS.length;
  return REJECTIONS[index];
}

/**
 * A wrong accusation should still teach. Each named suspect gets the specific
 * evidence that clears them, because "no" on its own teaches nothing.
 *
 * These strings live server-side: shipping a refutation for every suspect
 * except one would name the culprit by omission.
 */
function accusationRejection(answer: string): string {
  const name = answer.trim().toLowerCase();
  if (name.includes('pell') || name.includes('jamie')) {
    return (
      'Rejected. Jamie Pell badged out of the Main Lobby at 17:30 and did not ' +
      'come back. The card that opened D-14 at 23:04 was a copy of theirs. ' +
      'Having your card cloned makes you the first victim, not the adversary.'
    );
  }
  if (name.includes('okonkwo') || name.includes('dele')) {
    return (
      'Rejected. He is the target of finding 01. He was phished at 23:31, gave ' +
      'up his password at 23:47, and was in Control Room B all night for the ' +
      'telemetry window. A compromised account is not a culprit.'
    );
  }
  if (name.includes('vance') || name.includes('rhea')) {
    return (
      'Rejected. Motive is not evidence. Her name on CHG-4417 is a forgery: the ' +
      'approval is timestamped fourteen minutes before the ticket was created. ' +
      'Her badge and her account are silent all night and she is in Lisbon.'
    );
  }
  if (name.includes('bramble') || name.includes('sana')) {
    return (
      'Rejected. She badged out at 22:50 and every approval in her name checks ' +
      'out against its ticket. Being the security lead when something fails is ' +
      'not the same as causing it.'
    );
  }
  if (/^\d+\.\d+\.\d+\.\d+$/.test(name) || name.startsWith('wks-')) {
    return (
      'Rejected. That is a machine, not a person. `roster` lists who each ' +
      'workstation is assigned to. Name that person.'
    );
  }
  return (
    'Rejected. Nobody by that name had access tonight. Everything ran through ' +
    'one workstation, the address you filed in finding 05. `roster` says whose ' +
    'desk that is, and its first column holds the usernames.'
  );
}

function hashInt(value: string): number {
  let hash = 0;
  for (const char of value) hash = (hash * 31 + char.charCodeAt(0)) | 0;
  return hash;
}
