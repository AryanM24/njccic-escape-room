/**
 * Caesar shift. The only cipher in the game, and the only one a student can
 * break with a pencil.
 *
 * Letters move by a fixed amount and everything else is left alone, which is
 * both historically accurate and the reason the cipher leaks: punctuation,
 * digits and word lengths all survive, so a code like ABCD-1234 still looks
 * like four letters, a hyphen and four digits after encryption.
 */
export const ALPHABET_SIZE = 26;

export function caesarShift(text: string, shift: number): string {
  const offset = ((shift % ALPHABET_SIZE) + ALPHABET_SIZE) % ALPHABET_SIZE;
  return text.replace(/[a-z]/gi, (char) => {
    const base = char === char.toUpperCase() ? 65 : 97;
    return String.fromCharCode(((char.charCodeAt(0) - base + offset) % ALPHABET_SIZE) + base);
  });
}

export interface CaesarCandidate {
  shift: number;
  text: string;
  /** Rough English-likeness, used only to order the brute-force output. */
  score: number;
}

/**
 * Every possible decryption. There are 25 of them, which is the entire point:
 * a key space you can exhaust by hand is not a key space.
 */
export function caesarCrack(text: string): CaesarCandidate[] {
  const candidates: CaesarCandidate[] = [];
  for (let shift = 1; shift < ALPHABET_SIZE; shift++) {
    const decoded = caesarShift(text, -shift);
    candidates.push({ shift, text: decoded, score: englishScore(decoded) });
  }
  return candidates;
}

const COMMON_WORDS = [
  ' the ',
  ' and ',
  ' to ',
  ' of ',
  ' is ',
  ' it ',
  ' not ',
  ' on ',
  ' at ',
  ' this ',
  ' but ',
];

/** Counts common English words. Crude on purpose; it only has to rank 25 rows. */
export function englishScore(text: string): number {
  const haystack = ` ${text.toLowerCase().replace(/[^a-z]+/g, ' ')} `;
  return COMMON_WORDS.reduce(
    (total, word) => total + haystack.split(word).length - 1,
    0,
  );
}
