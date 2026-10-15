/**
 * Short NIGHTJAR interjections, each a reaction to something the player just
 * did. STORY.md rules apply: he is tired and a little smug, he never delivers
 * a moral, and he never names or hints at an answer. Keep every line under 72
 * characters so it does not wrap in the terminal.
 */
export const ASIDE_FIRST_FINDING: readonly string[] = [
  'One. Dele is fine, by the way. Everyone asks.',
  'Nobody asks about the mail gateway.',
  '',
  '-- NIGHTJAR',
];

export const ASIDE_FOURTH_FINDING: readonly string[] = [
  'Four. One left. Do not look at the clock.',
  'I have been looking at it for you and it is not helping.',
  '',
  '-- NIGHTJAR',
];

/** Fires after every third wrong answer in a row. One entry per streak step. */
export const MISSES_PER_ASIDE = 3;

export const ASIDES_AFTER_MISSES: readonly (readonly string[])[] = [
  [
    'Three wrong in a row. There is a command for that, and it is free.',
    'Whoever wrote it was far more generous than the rest of this building.',
    '',
    '-- NIGHTJAR',
  ],
  [
    'Six. Read the evidence again. Slowly. Out loud, to the person next to you.',
    'It is the only technique I have ever seen work.',
    '',
    '-- NIGHTJAR',
  ],
  ['Nine. This is the most attention anyone has paid me since August.', '', '-- NIGHTJAR'],
];

export const ASIDE_FIRST_HINT: readonly string[] = [
  'Hints. Smart. I spent three weeks learning this network',
  'and nobody offered me any.',
  '',
  '-- NIGHTJAR',
];

export const ASIDE_LAST_HINT: readonly string[] = [
  'That is all three for that one. I hid nothing, for the record.',
  'Read it again, slowly.',
  '',
  '-- NIGHTJAR',
];
