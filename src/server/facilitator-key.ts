import 'server-only';

import type { LockId } from '@/content/types';

/**
 * The teacher's answer key.
 *
 * This is the only place plaintext answers exist in the app, it is
 * `server-only`, and the page that renders it is gated behind FACILITATOR_CODE
 * (see src/app/facilitator/page.tsx). Without that env var set, the page shows
 * the run of show and no answers.
 */
export interface FacilitatorEntry {
  id: LockId;
  answer: string;
  /** Other spellings the server accepts, so you know what to expect. */
  alsoAccepted: readonly string[];
  minutes: number;
  /** What teams try that does not work, so you can recognise it fast. */
  wrongTurns: readonly string[];
  /** One question to ask the room after this finding is filed. */
  debrief: string;
}

export const FACILITATOR_KEY: readonly FacilitatorEntry[] = [
  {
    id: '01',
    answer: 'meridian-grid.net',
    alsoAccepted: ['the whole sender address; everything after the @ is used'],
    minutes: 7,
    wrongTurns: [
      'Submitting meridiangrid.net, which is the real domain. The console now says so and sends them back to the mail.',
      'Submitting the display name, "Meridian IT Security".',
      'Reading the five bodies and never running `headers 3`.',
    ],
    debrief:
      'Three separate things gave this away: the hyphen in the domain, the SPF fail, and a delivery chain that starts on a desk inside the building. Which of those would a tired engineer notice at 23:31? Which one should the mail gateway have caught with nobody looking at all?',
  },
  {
    id: '02',
    answer: 'D-14',
    alsoAccepted: ['loading dock', 'd-14 loading dock'],
    minutes: 9,
    wrongTurns: [
      'Reading the HOLDER column only and accusing j.pell, who went home at 17:30.',
      'Finding the 47s row but submitting the time or the person instead of the door.',
      'Deciding the badge log is useless because it never raised an alert.',
    ],
    debrief:
      'The badge system recorded this correctly, in real time, at 23:04. It just was not wired to anything that would notice. What is the difference between a system that logs an attack and a system that detects one?',
  },
  {
    id: '03',
    answer: 'WREN-4417',
    alsoAccepted: ['WREN4417'],
    minutes: 8,
    wrongTurns: [
      'Trying to work the shift out by hand instead of running `caesar --crack`.',
      'Submitting the passphrase or the day of the week instead of the account code.',
      'Not finding /var/evidence/note.txt. Point them at `tree /var`.',
    ],
    debrief:
      'A Caesar cipher has 25 possible keys, so `--crack` beats it instantly. Ask them how many keys would be enough, then tell them a real key today is a number with about 77 digits. This is the on-ramp to Unit 5.3 next semester.',
  },
  {
    id: '04',
    answer: '10.20.4.31:23',
    alsoAccepted: ['10.20.4.31 23', 'relay-ctrl-02:23'],
    minutes: 7,
    wrongTurns: [
      'Naming 502/modbus. The scan key says it is the control protocol and expected here, so a team that does this skipped the key.',
      'Giving the host without the port, or the port without the host.',
      'Starting with `fw`. The answer comes from the scan alone. Send them back to it, and have them read `fw` after they file.',
    ],
    debrief:
      'Nobody here wrote a bad rule. RULE 30 is a perfectly good rule in the wrong position, and a rule set with dead code in it reads exactly like a correct one. How would you catch that in a review?',
  },
  {
    id: '05',
    answer: '10.40.7.19',
    alsoAccepted: ['wks-40719'],
    minutes: 8,
    wrongTurns: [
      'Reading `log relay` without ever running `log baseline`.',
      'Naming 10.99.1.20, which is the normal source and appears most often.',
      'Submitting the time of the session instead of the address.',
    ],
    debrief:
      'Three systems recorded this attack correctly while it was happening: the badge reader, the firewall and the relay controller. None of them raised an alert. What actually turns a log into detection?',
  },
];

export const FACILITATOR_FINALE = {
  answer: 'm.tso',
  alsoAccepted: ['marcus tso', 'tso'],
  chain: [
    'Finding 01. The phishing mail was relayed from 10.40.7.19.',
    'Finding 02. Somebody entered on a cloned badge at 23:04, and m.tso has no badge.',
    'Finding 03. The note says "the old desk still works, nobody turned it off".',
    'Finding 04. RULE 20 was raised from 10.40.7.19 and permits its subnet into OT.',
    'Finding 05. The session to the relay controller came from 10.40.7.19.',
    '`roster` assigns wks-40719, which is 10.40.7.19, to m.tso, contract ended 29 Aug.',
  ],
  debrief:
    'He is the insider adversary from Unit 2.1.B.3: legitimate access that was never revoked. His badge was switched off the day his contract ended. His account, his workstation and his firewall rule were not, because those are three different teams and there is no list. Which of tonight’s five failures was actually a technology problem?',
} as const;

export const RUN_OF_SHOW: readonly string[] = [
  '0:00  Open the URL on each team laptop. The boot sequence plays itself. Do not explain the plot, the console does that.',
  '0:02  Say two things and then stop talking: "type help" and "hints are free".',
  '0:07  Everyone should be through finding 01. If a team has not run `headers 3`, tell them to.',
  '0:10  Findings 02, 03 and 04 all open at once. Say so. A team stuck on one should go and do another.',
  '0:30  Any team below 3 findings: tell them to spend hints. A stuck team is learning nothing.',
  '0:38  Finishers run `abort`, then `roster`, then `accuse`. The shift report it prints is your debrief handout.',
  '0:45  Whole-room debrief. Best questions to end on are finding 04 and the closing question below.',
];

export const FACILITATOR_NOTES: readonly string[] = [
  'Everything here sits in Units 1 to 3, which is what a semester 1 student has covered. No hashing, no encryption, no access control models.',
  'Finding 03, the Caesar cipher, is the one deliberate exception. It is not in the CED, but it needs no prerequisites at all and previews Unit 5.3.',
  'Between periods: type `reset --confirm` on each machine, then reload.',
  'Progress saves per browser, so a refresh or a dead battery costs nothing.',
  'Answers are validated on the server, so a team that opens DevTools finds nothing. That is deliberate and worth pointing out in the debrief.',
  'Attempts are rate-limited to 8 per finding per minute. A team that hits that is guessing, so send them to `hint`.',
  'Everything in the fiction is invented. The addresses are RFC 1918 and RFC 5737 documentation ranges and no domain in it resolves.',
];

export const CED_ALIGNMENT: readonly string[] = [
  '01 INGRESS     1.1.A social engineering indicators / 1.2.B weak authentication / 3.1.A.3 credential harvesting',
  '02 PREMISES    2.2.A.3 tailgating / 2.2.A.6 card cloning / 2.4.C.3 door-held-open detection',
  '03 CIPHER      preview of 5.3, no prerequisites beyond the alphabet',
  '04 PERIMETER   3.1.B network vulnerabilities / 3.3.B segmentation / 3.4.B.2 and 3.4.D.3 ACL rule order',
  '05 DETECTION   3.5.A log sources / 3.5.C.2 anomaly detection and baselines / 2.1.C.7 evading detection',
  'FINALE         2.1.B.3 insider adversary / 2.1.C the attack phases end to end',
];
