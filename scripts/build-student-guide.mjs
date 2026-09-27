/**
 * Builds Protocol-Nightjar-Student-Guide.docx, the printable student handout.
 *
 *   npm i --no-save docx
 *   node scripts/build-student-guide.mjs Protocol-Nightjar-Student-Guide.docx
 *
 * `docx` is deliberately NOT a project dependency. This script runs by hand
 * when the handout changes, and the built .docx is committed, so nothing in
 * the app or its install has to carry a document-generation library.
 *
 * Keep it spoiler-free. There is no answer in here and there must not be one:
 * the guide is handed to students before they play. The per-finding
 * directions go no further than the in-game objective and the first hint,
 * which students can already see for free.
 *
 * Styling is deliberately plain, like a class assignment sheet: Times New
 * Roman, black ink, simple bordered tables, no colour. It has to photocopy.
 */
import fs from 'node:fs';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  AlignmentType,
  HeightRule,
  Footer,
  PageNumber,
  LevelFormat,
  convertInchesToTwip,
} from 'docx';

const SERIF = 'Times New Roman';
const MONO = 'Courier New';
const SIZE = 24; // 12 pt
const CONTENT_W = 9360; // 12240 letter - 2 x 1440 margins
const LINE = 276; // 1.15 spacing

// ── helpers ───────────────────────────────────────────────────────────
/** Text runs from [text, {bold, italics, mono}] pairs, or a plain string. */
const runs = (parts) =>
  (typeof parts === 'string' ? [[parts]] : parts).map(
    ([text, o = {}]) =>
      new TextRun({
        text,
        font: o.mono ? MONO : SERIF,
        size: o.mono ? 22 : SIZE,
        bold: o.bold,
        italics: o.italics,
      }),
  );

const para = (parts, { after = 160, before = 0, align } = {}) =>
  new Paragraph({
    spacing: { before, after, line: LINE },
    alignment: align,
    children: runs(parts),
  });

const heading = (text) =>
  new Paragraph({
    spacing: { before: 280, after: 120 },
    keepNext: true,
    children: [new TextRun({ text, font: SERIF, size: SIZE, bold: true })],
  });

const subheading = (text) =>
  new Paragraph({
    spacing: { before: 200, after: 80 },
    keepNext: true,
    children: [new TextRun({ text, font: SERIF, size: SIZE, bold: true, italics: true })],
  });

const bullet = (parts) =>
  new Paragraph({
    numbering: { reference: 'bullets', level: 0 },
    spacing: { after: 80, line: LINE },
    children: runs(parts),
  });

const line = { style: BorderStyle.SINGLE, size: 4, color: '000000' };
const borders = {
  top: line,
  bottom: line,
  left: line,
  right: line,
  insideHorizontal: line,
  insideVertical: line,
};

const cell = (parts, width, { bold = false, mono = false } = {}) =>
  new TableCell({
    width: { size: width, type: WidthType.DXA },
    margins: { top: 60, bottom: 60, left: 100, right: 100 },
    children: [
      new Paragraph({
        spacing: { after: 0 },
        children: runs(typeof parts === 'string' ? [[parts, { bold, mono }]] : parts),
      }),
    ],
  });

const table = (widths, header, rows, { height } = {}) =>
  new Table({
    columnWidths: widths,
    width: { size: CONTENT_W, type: WidthType.DXA },
    borders,
    rows: [
      new TableRow({
        tableHeader: true,
        children: header.map((h, i) => cell(h, widths[i], { bold: true })),
      }),
      ...rows.map(
        (r) =>
          new TableRow({
            ...(height ? { height: { value: height, rule: HeightRule.ATLEAST } } : {}),
            children: r.map((c, i) => cell(c, widths[i], { mono: i === 0 && !height })),
          }),
      ),
    ],
  });

const writingLines = (count) =>
  Array.from(
    { length: count },
    () =>
      new Paragraph({
        spacing: { before: 280, after: 0 },
        border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: '000000', space: 2 } },
        children: [],
      }),
  );

// ── content ───────────────────────────────────────────────────────────
const COMMANDS = [
  ['help', 'Lists every command you can run, grouped by what it is for.'],
  ['briefing', 'Your shift notes from the OT Security Lead.'],
  ['locks', 'Lists the five findings and shows which ones are open to you right now.'],
  ['locks <id>', 'Shows exactly what one finding is asking you to record.'],
  ['unlock <id> <answer>', 'Files a finding, which is how you make progress.'],
  [
    'hint <id>',
    'Gives a hint. There are three per finding, and there is no penalty for using them.',
  ],
  ['status', 'Shows how many findings you have filed and how much time is left.'],
  ['abort', 'Stops the cascade, but it only works once all five findings are filed.'],
];

const INVESTIGATE = [
  ['mail', 'Lists the mail spool. For example, mail 3 opens message 3.'],
  [
    'headers <id>',
    'Shows the delivery record behind a message, which tells you who really sent it.',
  ],
  ['badge', 'Shows door events from the building access system.'],
  ['roster', 'Shows the staff directory, including desks, badges, and who is where.'],
  ['scan <range>', 'Finds machines on a network and the ports they answer on.'],
  ['fw', 'Shows the firewall rules in the order the firewall reads them.'],
  ['log <source>', 'Reads a log. Typing log on its own shows which logs exist.'],
  ['caesar', 'Shifts letters along the alphabet, or tries all 25 shifts at once.'],
  ['ls / cat / grep', 'Lists files, reads a file, and searches inside a file.'],
  ['man <command>', 'Explains what a command does and the security idea behind it.'],
];

/**
 * Directions per finding. Each one restates the in-game objective, names where
 * to start, and says what idea the finding is about. None of them describe
 * what the answer looks like beyond the format the console already prints.
 */
const DIRECTIONS = [
  {
    title: 'Finding 01: INGRESS (open from the start)',
    text: [
      [
        'Five emails reached the account d.okonkwo tonight, and one of them is how the attacker got in. Start with ',
      ],
      ['mail', { mono: true }],
      [
        ' and read all five, paying attention to the one that pressures the reader to act quickly. However, what an email says about its sender is not always true, so use ',
      ],
      ['headers', { mono: true }],
      [
        ' to see where the message actually came from. Record the domain the sender really used. This finding is about recognizing social engineering, and the most important skill is checking the evidence instead of trusting what the message claims.',
      ],
    ],
  },
  {
    title: 'Finding 02: PREMISES (opens after 01)',
    text: [
      ['Someone was physically inside the building who should not have been. Run '],
      ['badge', { mono: true }],
      [' to see the door events, and use '],
      ['roster', { mono: true }],
      [
        ' if you need to know who a badge belongs to. The badge system records how long each door stayed open, so read the numbers and not only the names. Record the door where somebody got in without badging in themselves. This finding is about physical security, which shows that a locked door only works when the system is actually checking how it is used.',
      ],
    ],
  },
  {
    title: 'Finding 03: CIPHER (opens after 01)',
    text: [
      ['A handwritten note was recovered from the recycling and scanned to '],
      ['/var/evidence/note.txt', { mono: true }],
      ['. Read it with '],
      ['cat', { mono: true }],
      [', and you will see that the letters have been scrambled. The '],
      ['caesar', { mono: true }],
      [' tool and its '],
      ['man', { mono: true }],
      [
        ' page explain how to undo this kind of cipher. Record the burner account named in the note. The Caesar cipher is a preview of Unit 5.3, and the point of this finding is to see why a cipher with only 25 possible keys does not actually protect anything.',
      ],
    ],
  },
  {
    title: 'Finding 04: PERIMETER (opens after 01)',
    text: [
      ['The corporate network is not supposed to be able to reach the control network. Run '],
      ['scan 10.20.4.0/24', { mono: true }],
      [' to find the machines on the control network, and then run '],
      ['fw', { mono: true }],
      [
        ' to read the firewall rules. You want both before you answer. Record the host and port running a login service that sends passwords as readable text. When you read the firewall rules, remember that they are checked from the top down, and the order of the rules matters as much as the rules themselves.',
      ],
    ],
  },
  {
    title: 'Finding 05: DETECTION (opens after 02, 03, and 04)',
    text: [
      ['The relay controller logged the attacker’s session, but nothing raised an alert. Compare '],
      ['log relay', { mono: true }],
      [' against '],
      ['log baseline', { mono: true }],
      [
        ', which is a record of what normal activity looked like on this system. Record the source address that should not be there. This finding is about anomaly-based detection, which only works when someone compares what is happening against what normally happens.',
      ],
    ],
  },
];

const FINDINGS = [
  '01  INGRESS',
  '02  PREMISES',
  '03  CIPHER',
  '04  PERIMETER',
  '05  DETECTION',
  'Who was it?',
];

// ── document ──────────────────────────────────────────────────────────
const doc = new Document({
  creator: 'Protocol: Nightjar',
  title: 'Protocol: Nightjar Student Guide',
  description: 'Student handout for the Protocol: Nightjar cybersecurity escape room.',
  numbering: {
    config: [
      {
        reference: 'bullets',
        levels: [
          {
            level: 0,
            format: LevelFormat.BULLET,
            text: '•',
            alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 540, hanging: 270 } } },
          },
        ],
      },
    ],
  },
  sections: [
    {
      properties: {
        page: {
          size: { width: 12240, height: 15840 },
          margin: {
            top: convertInchesToTwip(1),
            bottom: convertInchesToTwip(1),
            left: convertInchesToTwip(1),
            right: convertInchesToTwip(1),
          },
        },
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [new TextRun({ children: [PageNumber.CURRENT], font: SERIF, size: 20 })],
            }),
          ],
        }),
      },
      children: [
        para(
          'Name: ______________________________     Team: ______________     Date: ____________',
          { after: 320 },
        ),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 60 },
          children: [
            new TextRun({ text: 'Protocol: Nightjar', font: SERIF, size: 32, bold: true }),
          ],
        }),
        para('AP Cybersecurity Escape Room: Student Guide', {
          align: AlignmentType.CENTER,
          after: 280,
        }),

        heading('The Situation'),
        para(
          'Meridian Grid Authority is a regional power utility that supplies electricity to about a quarter of a million homes. The company has 1,400 staff, badge readers on every door, and two computer networks that are supposed to stay completely separate. The first is the corporate network, which is where employees read email and complain about the printer. The second is the control network, which holds the relay controllers that actually open and close the breakers.',
        ),
        para(
          'You are the overnight SOC analyst, and SOC stands for Security Operations Centre. It is a Tuesday night, and you are the only person on site who does your job. Most of the time, this shift is quiet.',
        ),
        para([
          [
            'At 02:15, the operations console locks its operators out. Someone has scheduled a load-shedding cascade for 03:00, which means four sectors of the grid will go offline on a timer. That is 240,000 meters. Hospitals have backup generators, but most homes and businesses do not.',
          ],
        ]),
        para(
          'The person responsible leaves you a message. He calls himself NIGHTJAR, and he does not try to hide who he is. He used to work at Meridian, and his contract ended in August, but he says that none of the access he was given was ever taken away. As a result, he did not have to break in. Instead, he walked in, sat down at a desk that still has his name on it, and used permissions that somebody had already approved.',
        ),

        heading('Your Job'),
        para([
          [
            'There is an abort, and it has worked the whole time. The problem is that you are not allowed to use it yet. The abort is held behind ',
          ],
          ['OT-REC-1', { bold: true }],
          [', a recovery procedure Meridian wrote after the '],
          ['last', { italics: true }],
          [
            ' incident, when a panicking operator hit the wrong abort and dropped a sector that did not need to be dropped. The rule says that before an emergency abort is authorised, an analyst has to file an incident finding for every subsystem the intrusion touched, and the console checks each finding against the logs before it accepts it.',
          ],
        ]),
        para(
          'There are five findings tonight. This means that the thing standing between you and the abort is a form written by a committee, rather than a hacker or a firewall, and that form will not accept a wrong answer. NIGHTJAR knows this, which is part of the reason he picked tonight.',
        ),
        para([
          ['You have 45 minutes, and the clock on screen is real. ', { bold: true }],
          [
            'When all five findings are filed, run abort. After that, the console asks one more question, because stopping an attack and figuring out who did it are two different jobs.',
          ],
        ]),

        heading('How the Console Works'),
        para(
          'Everything in the console happens by typing, so there is nothing to click. Type a command, read what comes back, think about what it means, and then file a finding. The tables below list the commands you will use.',
        ),
        subheading('Commands for making progress'),
        table([2800, 6560], ['Command', 'What it does'], COMMANDS),
        subheading('Commands for investigating'),
        table([2800, 6560], ['Command', 'What it does'], INVESTIGATE),

        heading('Directions for Each Finding'),
        para([
          [
            'Finding 01 is the only one open at the start. Once you file it, findings 02, 03, and 04 open, and you can do them in any order. Finding 05 opens after those three are filed. If you are unsure what a finding wants, type ',
          ],
          ['locks <id>', { mono: true }],
          [' in the console, which also shows the format the answer should be in.'],
        ]),
        ...DIRECTIONS.flatMap((d) => [subheading(d.title), para(d.text)]),

        heading('Rules to Know'),
        bullet(
          'Every tool you need is already in the terminal, so you do not need Google, a calculator, or anything else installed.',
        ),
        bullet(
          'Read the man pages. They are short, and at least one of them explains how to solve a finding.',
        ),
        bullet(
          'Nothing is hidden in a clever place. There is no pixel hunting, no password guessing, and no trivia. Every answer is in a file or a log you are allowed to read, and the real work is noticing which part of it matters.',
        ),
        bullet(
          'Hints are free and there is no score. Being stuck for ten minutes does not teach you anything, so use them.',
        ),
        bullet(
          'A wrong answer only costs you the time it takes to type another one. There is a limit on how fast you can guess, which is there to show that guessing is not the intended way to solve anything.',
        ),
        bullet(
          'You cannot break anything. The filesystem is read-only, and refreshing the page does not erase your progress.',
        ),

        heading('Findings Log'),
        para(
          'Fill this in as you go. Writing down what you looked at, and not only the answer, is what matters most during the debrief at the end. For the last row, name the evidence that tells you who did it.',
        ),
        table(
          [2000, 3760, 2400, 1200],
          ['Finding', 'What I looked at', 'What I filed', 'Time'],
          FINDINGS.map((f) => [f, '', '', '']),
          { height: 900 },
        ),

        heading('Debrief Question'),
        para(
          'No part of tonight’s incident was a break-in. When you reach the end, the shift report lists exactly which controls failed, and you will notice that almost none of them failed because the technology was weak. Keep notes as you go, because you will be asked this question:',
        ),
        para(
          [
            [
              'Which of tonight’s failures were actually technology problems, and which were organisational problems that only looked like technology problems?',
              { italics: true },
            ],
          ],
          { after: 0 },
        ),
        ...writingLines(8),

        para(
          [
            [
              'Everything in this scenario is fictional. The company, the people, the addresses, and the domains are all made up, and none of them lead to anything real.',
              { italics: true },
            ],
          ],
          { after: 0, align: AlignmentType.CENTER, before: 360 },
        ),
      ],
    },
  ],
});

const out = process.argv[2];
Packer.toBuffer(doc).then((buf) => {
  fs.writeFileSync(out, buf);
  console.log('wrote', out, buf.length, 'bytes');
});
