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
 * the guide is handed to students before they play.
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
  ShadingType,
  BorderStyle,
  AlignmentType,
  HeightRule,
  PageBreak,
  Footer,
  PageNumber,
  LevelFormat,
  convertInchesToTwip,
} from 'docx';

// ── palette ───────────────────────────────────────────────────────────
// Echoes the terminal (warm near-black + amber) but stays printer-friendly:
// exactly one dark band, on the cover. Everything else is ink on paper.
const INK = '1A1614';
const AMBER = 'B45309';
const RUST = '9A3412';
const MUTED = '6B6560';
const PAPER = 'F6F2EA';
const BAND = '17130F';
const BAND_TEXT = 'FFB648';

const CONTENT_W = 9360; // 12240 letter - 2 x 1440 margins

const SANS = 'Calibri';
const MONO = 'Consolas';

// ── helpers ───────────────────────────────────────────────────────────
const gap = (after = 160) => new Paragraph({ spacing: { after } });

const bandLine = (text, { size = 24, bold = false, color = BAND_TEXT, spacing = {} } = {}) =>
  new Paragraph({
    shading: { type: ShadingType.CLEAR, color: 'auto', fill: BAND },
    spacing: { before: 0, after: 0, ...spacing },
    children: [new TextRun({ text, font: MONO, size, bold, color, characterSpacing: 20 })],
  });

const h1 = (text) =>
  new Paragraph({
    spacing: { before: 360, after: 140 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: AMBER, space: 6 } },
    children: [
      new TextRun({ text, font: SANS, size: 26, bold: true, color: RUST, characterSpacing: 24 }),
    ],
  });

const body = (text, { after = 140, italics = false, color = INK } = {}) =>
  new Paragraph({
    spacing: { after, line: 276 },
    children: [new TextRun({ text, font: SANS, size: 21, color, italics })],
  });

/** Mixed-format paragraph: parts are [text, {opts}] pairs. */
const rich = (parts, { after = 140 } = {}) =>
  new Paragraph({
    spacing: { after, line: 276 },
    children: parts.map(
      ([text, opts = {}]) =>
        new TextRun({ text, font: opts.mono ? MONO : SANS, size: opts.mono ? 19 : 21, color: INK, ...opts }),
    ),
  });

const bullet = (text, { bold = '' } = {}) =>
  new Paragraph({
    numbering: { reference: 'dash', level: 0 },
    spacing: { after: 90, line: 276 },
    children: [
      ...(bold ? [new TextRun({ text: bold, font: SANS, size: 21, bold: true, color: INK })] : []),
      new TextRun({ text, font: SANS, size: 21, color: INK }),
    ],
  });

/** Boxed callout on warm paper stock. */
const callout = (lines) =>
  new Table({
    columnWidths: [CONTENT_W],
    width: { size: CONTENT_W, type: WidthType.DXA },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 6, color: AMBER },
      bottom: { style: BorderStyle.SINGLE, size: 6, color: AMBER },
      left: { style: BorderStyle.SINGLE, size: 18, color: AMBER },
      right: { style: BorderStyle.SINGLE, size: 6, color: AMBER },
      insideHorizontal: { style: BorderStyle.NONE },
      insideVertical: { style: BorderStyle.NONE },
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: CONTENT_W, type: WidthType.DXA },
            shading: { type: ShadingType.CLEAR, color: 'auto', fill: PAPER },
            margins: { top: 160, bottom: 160, left: 220, right: 220 },
            children: lines.map(
              ([text, opts = {}], i) =>
                new Paragraph({
                  spacing: { after: i === lines.length - 1 ? 0 : 90, line: 276 },
                  children: [
                    new TextRun({
                      text,
                      font: opts.mono ? MONO : SANS,
                      size: opts.mono ? 19 : 21,
                      bold: opts.bold || false,
                      color: opts.color || INK,
                    }),
                  ],
                }),
            ),
          }),
        ],
      }),
    ],
  });

const headerCell = (text, width) =>
  new TableCell({
    width: { size: width, type: WidthType.DXA },
    shading: { type: ShadingType.CLEAR, color: 'auto', fill: INK },
    margins: { top: 90, bottom: 90, left: 140, right: 140 },
    children: [
      new Paragraph({
        spacing: { after: 0 },
        children: [
          new TextRun({ text, font: SANS, size: 17, bold: true, color: 'FFFFFF', characterSpacing: 18 }),
        ],
      }),
    ],
  });

const cell = (text, width, { mono = false, bold = false, fill = null, align = null } = {}) =>
  new TableCell({
    width: { size: width, type: WidthType.DXA },
    ...(fill ? { shading: { type: ShadingType.CLEAR, color: 'auto', fill } } : {}),
    margins: { top: 80, bottom: 80, left: 140, right: 140 },
    children: [
      new Paragraph({
        spacing: { after: 0, line: 264 },
        ...(align ? { alignment: align } : {}),
        children: [
          new TextRun({
            text,
            font: mono ? MONO : SANS,
            size: mono ? 19 : 20,
            bold,
            color: INK,
          }),
        ],
      }),
    ],
  });

const thinBorders = {
  top: { style: BorderStyle.SINGLE, size: 4, color: 'D9D2C7' },
  bottom: { style: BorderStyle.SINGLE, size: 4, color: 'D9D2C7' },
  left: { style: BorderStyle.SINGLE, size: 4, color: 'D9D2C7' },
  right: { style: BorderStyle.SINGLE, size: 4, color: 'D9D2C7' },
  insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: 'D9D2C7' },
  insideVertical: { style: BorderStyle.SINGLE, size: 4, color: 'D9D2C7' },
};

/** Ruled writing lines for handwritten notes. */
const writingLines = (count) =>
  Array.from(
    { length: count },
    () =>
      new Paragraph({
        spacing: { before: 200, after: 0 },
        border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: 'C9C2B6', space: 4 } },
        children: [new TextRun({ text: '', font: SANS, size: 21 })],
      }),
  );

// ── command reference ─────────────────────────────────────────────────
const COMMANDS = [
  ['help', 'Lists every command you can run, grouped by what it is for.'],
  ['briefing', 'Your shift notes from the OT Security Lead.'],
  ['locks', 'The five findings, and which ones are open to you right now.'],
  ['locks <id>', 'Exactly what one finding is asking you to record.'],
  ['unlock <id> <answer>', 'File a finding. This is how you make progress.'],
  ['hint <id>', 'Three per finding. Free. No penalty. Use them.'],
  ['status', 'How many findings you have filed and how long is left.'],
  ['abort', 'Stops the cascade. Only works once all five are filed.'],
];

const INVESTIGATE = [
  ['mail', 'The mail spool. `mail 3` opens message 3.'],
  ['headers <id>', 'The delivery record behind a message. Who really sent it.'],
  ['badge', 'Door events from the building access system.'],
  ['roster', 'Staff directory: desks, badges, who is where.'],
  ['scan <range>', 'Find machines on a network and the ports they answer on.'],
  ['fw', 'The firewall rules, in the order the firewall reads them.'],
  ['log <source>', 'Read a log. Try `log` on its own to see what exists.'],
  ['caesar', 'Shift letters along the alphabet, or try all 25 shifts at once.'],
  ['ls / cat / grep', 'List files, read a file, search inside a file.'],
  ['man <command>', 'What a command does, and the security idea behind it.'],
];

const FINDINGS = [
  ['01', 'INGRESS'],
  ['02', 'PREMISES'],
  ['03', 'CIPHER'],
  ['04', 'PERIMETER'],
  ['05', 'DETECTION'],
];

// ── document ──────────────────────────────────────────────────────────
const doc = new Document({
  creator: 'Meridian Grid Authority',
  title: 'Protocol: Nightjar — Student Field Guide',
  description: 'Student handout for the Protocol: Nightjar cybersecurity escape room.',
  numbering: {
    config: [
      {
        reference: 'dash',
        levels: [
          {
            level: 0,
            format: LevelFormat.BULLET,
            text: '–',
            alignment: AlignmentType.LEFT,
            style: {
              paragraph: { indent: { left: 320, hanging: 200 } },
              run: { color: AMBER, font: SANS },
            },
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
            top: convertInchesToTwip(0.85),
            bottom: convertInchesToTwip(0.75),
            left: convertInchesToTwip(1),
            right: convertInchesToTwip(1),
          },
        },
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              border: { top: { style: BorderStyle.SINGLE, size: 4, color: 'D9D2C7', space: 6 } },
              children: [
                new TextRun({
                  text: 'PROTOCOL: NIGHTJAR  ·  student field guide  ·  page ',
                  font: SANS,
                  size: 16,
                  color: MUTED,
                }),
                new TextRun({ children: [PageNumber.CURRENT], font: SANS, size: 16, color: MUTED }),
                new TextRun({ text: ' of ', font: SANS, size: 16, color: MUTED }),
                new TextRun({ children: [PageNumber.TOTAL_PAGES], font: SANS, size: 16, color: MUTED }),
              ],
            }),
          ],
        }),
      },
      children: [
        // ── cover band ────────────────────────────────────────────────
        bandLine('MERIDIAN GRID AUTHORITY', { size: 17, color: 'A8722A', spacing: { before: 160 } }),
        bandLine('PROTOCOL: NIGHTJAR', { size: 52, bold: true }),
        bandLine('OT OPERATIONS CONSOLE  ·  INCIDENT 2026-0917-01', { size: 17, color: 'A8722A' }),
        bandLine('', { size: 14, spacing: { after: 160 } }),

        new Paragraph({
          spacing: { before: 200, after: 300 },
          children: [
            new TextRun({
              text: 'Overnight shift  ·  Student field guide  ·  Keep this with you',
              font: SANS,
              size: 19,
              color: MUTED,
              characterSpacing: 14,
            }),
          ],
        }),

        new Paragraph({
          spacing: { after: 160 },
          children: [
            new TextRun({ text: 'TEAM ', font: SANS, size: 19, bold: true, color: RUST }),
            new TextRun({
              text: ' '.repeat(42),
              font: SANS,
              size: 19,
              underline: { color: 'C9C2B6' },
            }),
            new TextRun({ text: '   ANALYSTS ', font: SANS, size: 19, bold: true, color: RUST }),
            new TextRun({
              text: ' '.repeat(38),
              font: SANS,
              size: 19,
              underline: { color: 'C9C2B6' },
            }),
          ],
        }),

        // ── the situation ─────────────────────────────────────────────
        h1('THE SITUATION'),
        body(
          'Meridian Grid Authority is a regional power utility. It moves electricity to about a quarter of a million homes. It has 1,400 staff, badge readers on every door, and two computer networks that are supposed to never touch each other: the corporate network, where people read email and complain about the printer, and the control network, where the relay controllers that actually open and close breakers live.',
        ),
        body(
          'You are the overnight SOC analyst. SOC stands for Security Operations Centre. It is a Tuesday night, you are the only person on site who does your job, and the shift is normally quiet.',
        ),
        rich([
          ['At ', {}],
          ['02:15', { bold: true }],
          [
            ' the operations console locks its operators out. Somebody has scheduled a load-shedding cascade for ',
            {},
          ],
          ['03:00', { bold: true }],
          [
            '. Four sectors of the grid drop offline on a timer. 240,000 meters. Hospitals have generators. Most things do not.',
            {},
          ],
        ]),
        body(
          'Whoever did it leaves you a message. He calls himself NIGHTJAR, and he is not mysterious about it. He used to work here. His contract ended in August, and he says nothing he was given access to was ever taken away. He did not break in. He walked in, sat down at a desk that still has his name on it, and used permissions somebody signed off on.',
          { after: 220 },
        ),

        // ── your job ──────────────────────────────────────────────────
        h1('YOUR JOB'),
        body(
          'There is an abort. It exists, and it works. It has worked the whole time.',
        ),
        rich([
          ['It is held behind ', {}],
          ['OT-REC-1', { bold: true, font: MONO }],
          [
            ', a recovery procedure Meridian wrote after the ',
            {},
          ],
          ['last', { italics: true }],
          [
            ' incident, when a panicking operator hit the wrong abort and dropped a sector that did not need dropping. The rule says: before an emergency abort is authorised, an analyst must file an incident finding for every subsystem the intrusion touched. The console checks each finding against the logs before it accepts it.',
            {},
          ],
        ]),
        body(
          'There are five findings tonight. So the thing standing between you and the off switch is not a hacker and not a firewall. It is a form, written by a committee, that will not accept a wrong answer. NIGHTJAR knows this. It is part of why he picked tonight.',
          { after: 200 },
        ),

        callout([
          ['YOU HAVE 45 MINUTES.', { bold: true, color: RUST }],
          [
            'The clock on screen is real. When all five findings are filed, run abort. Then the console asks one more question, because stopping an attack and working out who did it are two different jobs.',
            {},
          ],
        ]),

        new Paragraph({ children: [new PageBreak()] }),

        // ── how the console works ─────────────────────────────────────
        h1('HOW THE CONSOLE WORKS'),
        body(
          'Everything happens by typing. There is nothing to click. Type a command, read what comes back, think about it, then file a finding.',
          { after: 200 },
        ),

        new Table({
          columnWidths: [2600, 6760],
          width: { size: CONTENT_W, type: WidthType.DXA },
          borders: thinBorders,
          rows: [
            new TableRow({
              tableHeader: true,
              children: [headerCell('COMMAND', 2600), headerCell('WHAT IT DOES', 6760)],
            }),
            ...COMMANDS.map(
              ([c, d], i) =>
                new TableRow({
                  children: [
                    cell(c, 2600, { mono: true, bold: true, fill: i % 2 ? PAPER : null }),
                    cell(d, 6760, { fill: i % 2 ? PAPER : null }),
                  ],
                }),
            ),
          ],
        }),

        gap(280),
        new Paragraph({
          spacing: { after: 140 },
          children: [
            new TextRun({
              text: 'COMMANDS FOR INVESTIGATING',
              font: SANS,
              size: 20,
              bold: true,
              color: RUST,
              characterSpacing: 18,
            }),
          ],
        }),

        new Table({
          columnWidths: [2600, 6760],
          width: { size: CONTENT_W, type: WidthType.DXA },
          borders: thinBorders,
          rows: INVESTIGATE.map(
            ([c, d], i) =>
              new TableRow({
                children: [
                  cell(c, 2600, { mono: true, bold: true, fill: i % 2 ? PAPER : null }),
                  cell(d, 6760, { fill: i % 2 ? PAPER : null }),
                ],
              }),
          ),
        }),

        gap(300),

        // ── ground rules ──────────────────────────────────────────────
        h1('SIX THINGS THAT ARE TRUE'),
        bullet(
          'Every tool you need is already in the terminal. You do not need Google, a calculator, or anything installed.',
          { bold: '' },
        ),
        bullet(
          'Read the man pages. Genuinely. They are short, and at least one of them tells you how to solve a finding.',
        ),
        bullet(
          'Nothing is hidden in a clever place. No pixel hunting, no guessing passwords, no trivia. Every answer is sitting in a file or a log you are allowed to read. The work is noticing which part of it matters.',
        ),
        bullet(
          'Hints are free and there is no score. Being stuck for ten minutes teaches you nothing, so spend them.',
        ),
        bullet(
          'Wrong answers cost nothing except the seconds it takes to type another one. There is a limit on how fast you can guess, which exists to tell you that guessing is not the intended route.',
        ),
        bullet(
          'You cannot break it. The filesystem is read-only, and refreshing the page does not lose your progress.',
        ),

        new Paragraph({ children: [new PageBreak()] }),

        // ── findings log ──────────────────────────────────────────────
        h1('FINDINGS LOG'),
        body(
          'Fill this in as you go. Writing down what you looked at, and not just the answer, is the part that matters at the end.',
          { after: 200 },
        ),

        new Table({
          columnWidths: [620, 1700, 3400, 2440, 1200],
          width: { size: CONTENT_W, type: WidthType.DXA },
          borders: thinBorders,
          rows: [
            new TableRow({
              tableHeader: true,
              children: [
                headerCell('#', 620),
                headerCell('FINDING', 1700),
                headerCell('WHAT I LOOKED AT', 3400),
                headerCell('WHAT I FILED', 2440),
                headerCell('TIME', 1200),
              ],
            }),
            ...FINDINGS.map(
              ([id, name]) =>
                new TableRow({
                  height: { value: 900, rule: HeightRule.ATLEAST },
                  children: [
                    cell(id, 620, { mono: true, bold: true, align: AlignmentType.CENTER }),
                    cell(name, 1700, { mono: true, bold: true }),
                    cell('', 3400),
                    cell('', 2440),
                    cell('', 1200),
                  ],
                }),
            ),
            new TableRow({
              height: { value: 900, rule: HeightRule.ATLEAST },
              children: [
                cell('', 620, { fill: PAPER }),
                cell('WHO WAS IT', 1700, { mono: true, bold: true, fill: PAPER }),
                cell('How do you know? Name the evidence.', 3400, { fill: PAPER }),
                cell('', 2440, { fill: PAPER }),
                cell('', 1200, { fill: PAPER }),
              ],
            }),
          ],
        }),

        gap(320),

        // ── debrief ───────────────────────────────────────────────────
        h1('FOR THE DEBRIEF'),
        body(
          'Nothing in this incident was a break-in. When you reach the end, the shift report tells you exactly which controls failed, and you will notice that almost none of them failed because the technology was weak.',
        ),
        rich(
          [
            ['Keep a note as you go. We are going to ask you this: ', {}],
            [
              'which of tonight’s failures was actually a technology problem, and which were organisational problems wearing a technology costume?',
              { bold: true },
            ],
          ],
          { after: 200 },
        ),
        ...writingLines(7),

        gap(240),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 200 },
          children: [
            new TextRun({
              text:
                'Everything in this scenario is fictional. The company, the people, the addresses and the domains are invented, and none of them resolve to anything real.',
              font: SANS,
              size: 16,
              italics: true,
              color: MUTED,
            }),
          ],
        }),
      ],
    },
  ],
});

const out = process.argv[2];
Packer.toBuffer(doc).then((buf) => {
  fs.writeFileSync(out, buf);
  console.log('wrote', out, buf.length, 'bytes');
});
