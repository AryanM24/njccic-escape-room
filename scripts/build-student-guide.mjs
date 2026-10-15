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
 *
 * It is an orientation guide, not a worksheet. Each finding gets the idea
 * behind it and the kind of thing to look for, and stops short of naming the
 * command or the step that solves it. That line sits roughly at the first
 * hint tier in src/content/locks.ts. Nothing here may go further than that,
 * and nothing here asks students to write anything down.
 *
 * Styling is deliberately plain, like a class handout: Times New Roman, black
 * ink, one simple table. It has to photocopy.
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
  Footer,
  PageNumber,
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
  new Paragraph({ spacing: { before, after, line: LINE }, alignment: align, children: runs(parts) });

const heading = (text) =>
  new Paragraph({
    spacing: { before: 280, after: 100 },
    keepNext: true,
    children: [new TextRun({ text, font: SERIF, size: SIZE, bold: true })],
  });

const line = { style: BorderStyle.SINGLE, size: 4, color: '000000' };
const borders = { top: line, bottom: line, left: line, right: line, insideHorizontal: line, insideVertical: line };

const cell = (parts, width, mono = false) =>
  new TableCell({
    width: { size: width, type: WidthType.DXA },
    margins: { top: 50, bottom: 50, left: 100, right: 100 },
    children: [
      new Paragraph({
        spacing: { after: 0 },
        children: runs([[parts, { mono }]]),
      }),
    ],
  });

const table = (widths, rows) =>
  new Table({
    columnWidths: widths,
    width: { size: CONTENT_W, type: WidthType.DXA },
    borders,
    rows: rows.map(
      ([command, use]) =>
        new TableRow({ children: [cell(command, widths[0], true), cell(use, widths[1])] }),
    ),
  });

// ── content ───────────────────────────────────────────────────────────
const BASICS = [
  ['help', 'Lists every command.'],
  ['locks', 'Lists the findings. locks 02 shows what finding 02 asks for.'],
  ['hint 02', 'Gives the next hint for finding 02. There are three per finding.'],
  ['unlock 02 answer', 'Files an answer for finding 02.'],
  ['man command', 'Explains a command and the idea behind it.'],
  ['status', 'Shows your progress and the abort key as it fills in.'],
];

/**
 * One paragraph per finding: what stage of the attack it is, the course idea
 * behind it, and a way of thinking about the evidence. No commands, no
 * columns, no values. The format line repeats what `locks <id>` already prints.
 */
const FINDINGS = [
  {
    title: 'Finding 01: INGRESS',
    note: 'Opens first. You will record a domain name.',
    text:
      'This finding is about how the attacker first got in. Social engineering works through pressure, so the usual signs are urgency, a request for something sensitive, and a sender who seems more official than the situation calls for. However, none of those prove anything alone, because the sender controls everything a message says about itself. Instead, ask which parts of a message are the sender’s claims and which parts are records that somebody else made.',
  },
  {
    title: 'Finding 02: PREMISES',
    note: 'Opens after 01. You will record a door.',
    text:
      'This finding is about a person who was inside the building without being allowed to be. A badge reader controls who may enter, but it only protects anything if somebody reads what it recorded, because attackers depend on the gap between a door opening and anyone noticing. Rather than asking who went through, ask which entry does not behave like the others. The answer is a place, not a person.',
  },
  {
    title: 'Finding 03: CIPHER',
    note: 'Opens after 01. You will record an account code.',
    text:
      'A note was thrown away that was never meant to be read, and its writer hid it with a Caesar cipher, which replaces each letter with one a fixed distance away in the alphabet. This is a preview of Unit 5.3, so the console gives you a tool for it. Think about how many different distances are possible, because that number decides how much protection the cipher gives. The note also holds several secrets, and the finding asks for only one.',
  },
  {
    title: 'Finding 04: PERIMETER',
    note: 'Opens after 01. You will record a host and a port.',
    text:
      'The corporate network and the control network are supposed to stay separate, and a firewall enforces that with a list of rules. This finding has two sides, which are what is actually running on the control network and what the firewall actually lets reach it, and neither tells the whole story alone. Some services there are risky but expected, because they do the machine’s real job. You want the one that sends login details in a way anyone watching could read.',
  },
  {
    title: 'Finding 05: DETECTION',
    note: 'Opens after 02, 03 and 04. You will record an address.',
    text:
      'Several systems recorded what the attacker did, yet nothing raised an alert, which shows the difference between recording an event and detecting one. Detection by anomaly depends on a baseline, meaning a record of what normal looks like, because without it there is nothing to compare against. The most common entry in a log is usually the normal one, so frequency alone will mislead you, and normal can mean more than one thing.',
  },
];

// ── document ──────────────────────────────────────────────────────────
const doc = new Document({
  creator: 'Protocol: Nightjar',
  title: 'Protocol: Nightjar Student Guide',
  description: 'Student guide for the Protocol: Nightjar cybersecurity escape room.',
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
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 60 },
          children: [new TextRun({ text: 'Protocol: Nightjar', font: SERIF, size: 32, bold: true })],
        }),
        para('Student Guide', { align: AlignmentType.CENTER, after: 280 }),

        para(
          'Tonight you are the overnight analyst at Meridian Grid Authority, and a former contractor calling himself NIGHTJAR has scheduled a blackout for 03:00. The abort works, but you cannot use it until you file one correct finding for each of the five systems he touched. You have 45 minutes. This guide has no answers and no step-by-step instructions. It explains the idea behind each finding so you know what kind of evidence to look for, because every answer is already in a file or a log that you are allowed to read.',
        ),

        heading('Getting Started'),
        para([
          ['Type '],
          ['help', { mono: true }],
          [', then try '],
          ['mail', { mono: true }],
          [
            '. Finding 01 opens first. After it is filed, findings 02, 03 and 04 open together so you can switch if you get stuck, and finding 05 opens last. Hints are free, there is no score, and you cannot break anything. In a team, it works well for one person to type while another reads the evidence out loud, and to swap after each finding.',
          ],
        ]),
        table([2700, 6660], BASICS),
        para(
          'The other commands are for looking at evidence: mail, badge, roster, scan, fw, log, ticket, caesar, ls, cat, grep and tree. Part of the job is choosing the one that fits your question.',
          { before: 160 },
        ),

        heading('The Five Findings'),
        ...FINDINGS.flatMap((f) => [
          new Paragraph({
            spacing: { before: 200, after: 40 },
            keepNext: true,
            children: [
              new TextRun({ text: f.title, font: SERIF, size: SIZE, bold: true }),
              new TextRun({ text: `   ${f.note}`, font: SERIF, size: SIZE, italics: true }),
            ],
          }),
          para(f.text, { after: 120 }),
        ]),

        heading('After the Abort'),
        para(
          'Once all five findings are filed and you run abort, the console asks you to name NIGHTJAR. Your findings are the evidence for that, so remember what you notice along the way.',
        ),

        para(
          [
            [
              'Everything in this scenario is fictional, and none of the names, addresses or domains are real. Made by Team 10 of the Advanced Interns at NJCCIC.',
              { italics: true },
            ],
          ],
          { after: 0, before: 240, align: AlignmentType.CENTER },
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
