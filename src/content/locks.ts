import type { LockDefinition, LockId } from './types';

/**
 * The five OT-REC-1 findings.
 *
 * SCOPE RULE: every finding has to be solvable by a student who has finished
 * semester 1 of AP Cybersecurity, which is Units 1-3. That rules out hashing
 * and salting (4.2, 5.3), encryption and key exchange (5.3, 5.4), and access
 * control models (5.2). See LOCKS.md for the full mapping and the one
 * deliberate exception, which is the Caesar cipher in finding 03.
 *
 * No answer appears in this file. Validation lives in src/server/answer-keys.ts.
 *
 * Voice note for anyone editing a `beat`: the console is a recovery procedure
 * recording a finding, not a narrator with a lesson. Say what the finding is
 * and what it cost, then stop.
 */
export const LOCKS: readonly LockDefinition[] = [
  {
    id: '01',
    codename: 'INGRESS',
    concept: 'Social engineering indicators, urgency, credential harvesting',
    ced: '1.1.A, 1.2.B, 3.1.A.3',
    brief: 'Initial access. Where did the credential come from?',
    objective:
      "Five messages reached d.okonkwo tonight. One of them is how this started. " +
      'Record the domain the sender actually used, which is the part after the @.',
    requires: [],
    fragment: '7F3C',
    answerFormat: 'a domain name, e.g. example.net',
    hints: [
      'Four of those five messages are ordinary traffic. Read the one that wants you to do something quickly.',
      'The body is only half of a message. `headers <id>` shows the Return-Path and the delivery chain. One message was not sent by the domain it claims.',
      'Compare the sender domain to the real one letter by letter. Meridian owns exactly one domain and there is no punctuation in the middle of it.',
    ],
    beat: [
      'Message 3 recorded as the initial access vector.',
      '',
      'The domain is one hyphen away from ours. The link goes to a copy of our',
      'VPN portal that collects the username and password and passes them',
      'straight to whoever registered it. Dele filled it in at 23:47.',
      '',
      'The message did the two things these always do: it gave him a deadline,',
      'and it told him in advance that it would ask for his password, so that',
      'being asked would not feel wrong.',
      '',
      'Record for the timeline: the delivery chain starts at 10.40.7.19, which',
      'is a workstation on our own corporate floor. This was sent from inside',
      'the building.',
    ],
  },
  {
    id: '02',
    codename: 'PREMISES',
    concept: 'Physical attacks and detecting them from door sensor data',
    ced: '2.2.A.3, 2.2.A.6, 2.4.C.3',
    brief: 'Somebody was in the building who should not have been.',
    objective:
      'The badge system records how long each door stayed open. Run `badge` and ' +
      'record the door where somebody got in who did not badge in.',
    requires: ['01'],
    fragment: 'A19E',
    answerFormat: 'a door identifier, e.g. D-01',
    hints: [
      'Ignore the names for a moment and read the HELD column. It is the number of seconds the door sensor recorded the door standing open.',
      'A badge reader opens a door for one person and it shuts behind them, which is why almost every row is a handful of seconds. One row is not. A door held open far longer than normal is how the badge system shows you a second person walked through on one badge.',
      'Two things are wrong with that row, not one. Check what time that badge holder went home, then look at how long the door stayed open.',
    ],
    beat: [
      'Unauthorized physical entry confirmed.',
      '',
      '  23:04   D-14  Loading Dock   badge j.pell   in   47s',
      '',
      'Two problems in one line.',
      '',
      'Jamie Pell badged out of the Main Lobby at 17:30 and did not come back.',
      'Their card opened a door five and a half hours later, which means the',
      'card that opened it was not the card they are carrying. It was a copy.',
      '',
      'And the door stood open for forty-seven seconds. Every other entry',
      'tonight is between three and eight. A badge opens a door for one person',
      'and it closes behind them. Forty-seven seconds is two people, or one',
      'person holding it while they check nobody is watching.',
      '',
      'The badge system logged all of this correctly at 23:04. Nobody was',
      'reading it, because the alert threshold for door-held-open was never',
      'configured and the report goes to a mailbox that belongs to a contractor',
      'who left.',
    ],
  },
  {
    id: '03',
    codename: 'CIPHER',
    concept: 'Substitution ciphers and why a 25-key space is not protection',
    ced: 'preview of 5.3; no prerequisites beyond the alphabet',
    brief: 'Housekeeping pulled something out of the recycling.',
    objective:
      'A handwritten note was recovered from the bin outside the loading dock ' +
      'and scanned to /var/evidence/note.txt. Read it, and record the burner ' +
      'account named in it.',
    requires: ['01'],
    fragment: '0B55',
    answerFormat: 'an account identifier like ABCD-1234',
    hints: [
      'Every letter has been moved along the alphabet by the same amount. The digits and the punctuation were left alone, which is why you can still see the shape of a word with a number in it.',
      'You do not need to work out the shift. There are only 25 of them, so try them all: `caesar --crack --file /var/evidence/note.txt` prints every one. Exactly one comes out in English.',
      'The line you want is the one about payment. Record the account code, not the amount and not the day.',
    ],
    beat: [
      'Note decoded. Shift of 7.',
      '',
      'Twenty-five possible keys. A person can try all of them by hand in a few',
      'minutes and a computer does it before you finish reading the prompt.',
      'This is not encryption in any sense that matters. It is a way of making',
      'a note unreadable to somebody who glances at it over your shoulder, and',
      'that is the entire protection it offers.',
      '',
      'What is in it is worth more than the cipher was:',
      '',
      '  a burner account and a payment due Friday, so there is a buyer',
      '  the relay console passphrase, written down',
      '  an instruction to wipe the relay log and leave the badge log alone,',
      '  because they are different systems and, in his words, nobody ever',
      '  reads both',
      '',
      'You read both about ten minutes ago.',
      '',
      'Also recorded: "the old desk still works, nobody turned it off".',
    ],
  },
  {
    id: '04',
    codename: 'PERIMETER',
    concept: 'Segmentation, firewall ACLs, and first-match rule order',
    ced: '3.1.B, 3.3.B, 3.4.B.2, 3.4.D.3',
    brief: 'The corporate floor should not be able to reach a relay controller.',
    objective:
      'Scan the control network. Record the host and port running a login ' +
      'service that sends passwords as readable text. The firewall rules (fw) ' +
      'show how it could be reached, and are worth reading once it is filed.',
    requires: ['01'],
    fragment: 'D24A',
    answerFormat: 'host:port, e.g. 10.20.4.1:443',
    hints: [
      'One command lists every machine on the control network and the ports each one answers on: `scan 10.20.4.0/24`. Under the results is a key that says what each service is in plain words.',
      'Modbus is the control protocol and it is supposed to be there. You are looking for the service the key describes as sending the username and password as readable text.',
      'Exactly one machine runs it. Record that machine\'s address and the port number, joined by a colon.',
    ],
    beat: [
      'Exposure confirmed. Telnet, in the clear, on a relay controller.',
      '',
      'Two failures stacked on top of each other.',
      '',
      'The service. Telnet sends the username and password as readable text, so',
      'anyone positioned on the path can simply read them. It is still running',
      'here because the RTU-3000 shipped with it enabled and the firmware',
      'upgrade that turns it off was deferred twice for budget.',
      '',
      'The rule order. Read the ACL from the top:',
      '',
      '  RULE 20   ALLOW  inbound TCP ALL  from 10.40.7.0/24',
      '  RULE 30   DENY   inbound TCP ALL  from 10.40.0.0/16',
      '',
      'Rule 30 is the control that was supposed to keep the corporate network',
      'out of the control network. It never runs. Rules are evaluated in order',
      'and the first match wins, so traffic from 10.40.7.0/24 matches RULE 20',
      'and is allowed before RULE 30 is ever considered.',
      '',
      'Nobody wrote a bad rule here. Somebody wrote a good rule in the wrong',
      'place, which looks identical in a review and behaves like the opposite.',
      '',
      '10.40.7.0/24 is the corporate floor. That is twice tonight.',
    ],
  },
  {
    id: '05',
    codename: 'DETECTION',
    concept: 'Baselines, anomaly-based detection, indicators of compromise',
    ced: '3.5.A, 3.5.C.2, 2.1.C.7',
    brief: 'The relay controller logged the session. Nothing raised an alert.',
    objective:
      'Compare `log relay` against the recorded baseline in `log baseline`. ' +
      'Record the source address that should not be there.',
    requires: ['02', '03', '04'],
    fragment: '6E81',
    answerFormat: 'an IPv4 address, e.g. 10.0.0.1',
    hints: [
      'A baseline is a record of what normal looked like on a system nobody had touched. Anomaly detection means comparing today against that, so read them side by side.',
      'The baseline says two things about sessions to this controller: which single source address ever opens them, and which hours of the day they happen in. The relay log breaks both.',
      'You have seen this address twice already tonight. Once in a mail header, once in a firewall rule.',
    ],
    beat: [
      'Indicator of compromise recorded: 10.40.7.19.',
      '',
      '  baseline   sessions from 10.99.1.20 only, 06:00-18:00, 2-6 per day',
      '  observed   session from 10.40.7.19 at 01:52, outside both',
      '',
      'Everything needed to catch this was already being written down. The',
      'controller logged the session, the firewall logged the traffic, and the',
      'badge system logged the door. Three systems recorded the attack',
      'correctly and in real time.',
      '',
      'No alert fired, because nothing was comparing any of them to a baseline.',
      'A log nobody reads is not detection. It is only evidence, and evidence',
      'is what you have after.',
      '',
      'Note the last line of the relay log. Forty-one lines were rotated out',
      'manually at 02:11, which is the part of an attack where the adversary',
      'goes back and removes the record. He did the relay log. He did not touch',
      'the badge log, and the note in the recycling says why.',
      '',
      'All five findings filed. OT-REC-1 satisfied. Run `abort`.',
    ],
  },
];

export const LOCKS_BY_ID: ReadonlyMap<LockId, LockDefinition> = new Map(
  LOCKS.map((lock) => [lock.id, lock]),
);

export const ABORT_KEY = LOCKS.map((lock) => lock.fragment).join('-');
