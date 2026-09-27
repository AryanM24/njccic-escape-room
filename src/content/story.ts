/** Narrative beats. STORY.md is canon; this is what the player actually reads. */

/**
 * Launching the console. Prints instantly: this is scene-setting, not a
 * loading bar, and nobody should ever wait on it.
 */
export const BOOT_SEQUENCE: readonly string[] = [
  "C:\\MERIDIAN\\OT> meridian-grid.exe",
  '',
  '  loading meridian-grid.exe ............... ok',
  '  relay bus driver ........................ ok',
  '  historian link .......................... ok',
  '  scheduler ............................... ok  (1 job armed)',
  '  operator console ........................ FAILED',
  '',
];

/**
 * Decorative. The subtitle underneath says the same thing in words, so
 * nothing is lost by hiding this from a screen reader, which is how the
 * renderer treats lines flagged `decorative`.
 */
export const BANNER: readonly string[] = [
  " __  __  ___  ___  ___  ___   ___    _    _  _ ",
  "|  \\/  || __|| _ \\|_ _||   \\ |_ _|  /_\\  | \\| |",
  "| |\\/| || _| |   / | | || |) | | |  / _ \\ | .' |",
  "|_|  |_||___||_|_\\|___||___/ |___|/_/ \\_\\|_|\\_|",
  "   ___  ___  _  _  ___  ___  _     ___ ",
  "  / __|/ _ \\| \\| |/ __|/ _ \\| |   | __|",
  " | (__| (_) | .' |\\__ \\ (_) | |__ | _| ",
  "  \\___|\\___/|_|\\_||___/\\___/|____||___|",
];

export const BANNER_SUBTITLE: readonly string[] = [
  '  MERIDIAN GRID AUTHORITY  ·  OT OPERATIONS CONSOLE  ·  BUILD 4.2.9',
  '',
];

export const EMERGENCY_NOTICE: readonly string[] = [
  '  !! EMERGENCY MODE ENGAGED                              02:15',
  '  !! OPERATOR LOCKOUT ACTIVE',
  '  !! SCHEDULED JOB 1  load-shed cascade, sectors 1-4, 03:00',
  '',
];

/**
 * How to play, in the console's own voice. This is the only place the rules
 * are stated, so it has to be complete enough that a student who reads
 * nothing else can still start.
 */
export const DIRECTIONS: readonly string[] = [
  '── HOW THIS CONSOLE WORKS ────────────────────────────────────────',
  '',
  '  The abort is held by recovery procedure OT-REC-1. It will not',
  '  release until an incident finding has been filed for each of the',
  '  FIVE subsystems this intrusion touched. Every finding is checked',
  '  against the logs before it is accepted.',
  '',
  '  help               every command you can run, grouped',
  '  locks              the five findings, and which are open to you',
  '  locks <id>         what one finding is asking for',
  '  unlock <id> <answer>   file a finding',
  '  hint <id>          three per finding. Free. No penalty. Use them.',
  '  abort              stops the cascade, once all five are filed',
  '',
  '  Investigate with ordinary commands: mail, badge, scan, fw, log,',
  '  roster, cat, grep. `man <command>` explains any of them.',
  '',
  '  Start with:   help      and then      mail',
  '',
  '──────────────────────────────────────────────────────────────────',
  '',
];

export const NIGHTJAR_OPENING: readonly string[] = [
  '>> unsigned message, queued to this terminal at 02:14',
  '',
  'You are the night shift. I checked the roster before I picked the date,',
  'so I know there is exactly one of you tonight, and I know it is not Sana,',
  'because Sana went home at ten to eleven.',
  '',
  'My name is still on an asset register upstairs. It has been there since',
  'August, when my contract ended and somebody in Facilities switched off my',
  'badge and then went to lunch. Nobody switched off anything else. Not the',
  'account. Not the desk. Not the firewall rule I was told to ask for last',
  'November, which I was thanked for.',
  '',
  'So at 03:00 the scheduler sheds four sectors. Two hundred and forty',
  'thousand meters. Somebody is paying me for that and I am not going to',
  'stand here and pretend it is a protest.',
  '',
  'Here is the part you are going to find annoying.',
  '',
  'The abort works. It has worked the entire time. It sits behind OT-REC-1,',
  'which your own people wrote after the last incident, and which will not',
  'hand it over until somebody can explain what I did to five different',
  'systems. Not stop me. Explain me. In writing. At two in the morning.',
  '',
  'I have hidden nothing from you tonight. I did not need to. Every door I',
  'used is still standing open and written down somewhere, and your',
  'paperwork is doing the hiding for me.',
  '',
  'Dele opened a message at 23:47 that he should not have opened.',
  '',
  'Start there.',
  '',
  '-- NIGHTJAR',
];

export const WELCOME_FOOTER: readonly string[] = [
  'Type  help  to begin, or  briefing  for your shift notes.',
  'Effects too much? `effects off`.',
];

export const NIGHTJAR_MIDPOINT: readonly string[] = [
  'Three. Faster than I budgeted for.',
  '',
  'Something for the report, since somebody is finally writing one: none of',
  'this was clever. I did not find a flaw in anything. Every door I used,',
  'somebody opened on purpose, wrote a ticket for, and then stopped thinking',
  'about. I opened one of them myself, in November, and got thanked for it.',
  '',
  'Two to go, and about twenty minutes.',
  '',
  '-- NIGHTJAR',
];

export const ABORT_SUCCESS: readonly string[] = [
  'OT-REC-1 SATISFIED. ABORT AUTHORIZATION RELEASED.',
  '',
  'scheduler ................................... job 1 cancelled',
  'interlock ................................... restored to ENFORCE',
  'operator console ............................ UNLOCKED',
  'load-shed cascade ........................... STOOD DOWN',
  '',
  'Four sectors stay up. 240,000 meters never find out.',
  '',
  '-- NIGHTJAR',
  '',
  'Fine. You read faster than the last three people who had this job.',
  'It does not get me any less paid.',
  '',
  '-- end of session --',
  '',
  '── attribution ───────────────────────────────────────────────────',
  '',
  'OT-REC-1 has one more field and it is not optional. Containment is done.',
  'Attribution is a separate question and the form wants a name.',
  '',
  'Everything tonight ran through one workstation. `roster` will tell you',
  'whose desk that is.',
  '',
  'Name NIGHTJAR:   accuse <username>',
];

export const AFTER_ACTION: readonly string[] = [
  '── SHIFT REPORT ──────────────────────────────────────────────────',
  'INCIDENT 2026-0917-01   "NIGHTJAR"   status: CONTAINED, ATTRIBUTED',
  '',
  'WHO',
  '  Marcus Tso. Helpdesk contractor, Arbiter Controls, until 29 August.',
  '',
  '  An insider adversary in the exact sense the textbook means: somebody who',
  '  did not need to break anything because he was given the access, and it',
  '  was never taken back.',
  '',
  '  One host ties the night together. wks-40719, at 10.40.7.19, the desk he',
  '  sat at for two years:',
  '',
  '    The phishing mail was relayed from it at 23:31.',
  '    RULE 20 was raised from it, and permits its whole subnet into OT.',
  '    The telnet session to the relay controller came from it at 01:52.',
  '',
  '  He got into the building on a copy of Jamie Pell\'s badge at 23:04, at a',
  '  door that stood open for forty-seven seconds. His own badge was revoked',
  '  on 29 August. His account, his workstation and his firewall rule were',
  '  not, because those are three different teams and there is no list.',
  '',
  'WHO IT WAS NOT',
  '  Jamie Pell. Went home at 17:30. Their card was cloned, not lent.',
  '',
  '  Dele Okonkwo. Phished at 23:31, gave up his password at 23:47, and spent',
  '  the night in Control Room B doing the job he was rostered for.',
  '',
  '  Rhea Vance. Her name is on the approval for CHG-4417 and the timestamp is',
  '  fourteen minutes before the ticket existed, which makes it a forgery and',
  '  not an approval. She is in Lisbon. She had the best motive in the',
  '  building and she wrote six memos instead.',
  '',
  'WHAT FAILED',
  '  SPF was set to monitor-only, so a look-alike domain delivered clean.',
  '  The door-held-open alert on the badge system was never configured.',
  '  Telnet was still answering on a relay controller in 2026.',
  '  RULE 20 sat above RULE 30, so the deny never evaluated.',
  '  Nothing compared the relay log to its own baseline.',
  '  Offboarding is five checkboxes owned by three teams with no list.',
  '',
  'FINDING',
  '  There was no break-in. Every control that failed tonight was switched',
  '  off, ordered wrong, or left running by somebody who had a reason at the',
  '  time and no ticket to undo it later. The badge system, the firewall and',
  '  the relay controller all recorded the attack correctly, in real time,',
  '  and none of them was wired to anything that would notice.',
  '',
  '── end of report ─────────────────────────────────────────────────',
  '',
  'Shift log closed. Go home.',
];
