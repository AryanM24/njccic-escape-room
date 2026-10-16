import { MAILBOX } from '@/content/mail';
import { BADGE_EVENTS, BADGE_NOTES, STAFF, STAFF_FOOTER } from '@/content/badge';
import {
  CHANGE_TICKET,
  FIREWALL_RULES,
  SCAN_HOSTS,
  SERVICE_KEY,
  SUBNET_LEGEND,
} from '@/content/network';
import { LOG_SOURCES } from '@/content/logs';
import { dim, fail, lines, plain, rule, table, truncate } from '@/lib/terminal/output';
import { parseArgs } from '@/lib/terminal/parse';
import type { Command, OutputLine } from '@/lib/terminal/types';

export const mail: Command = {
  name: 'mail',
  summary: "read d.okonkwo's mail spool",
  usage: 'mail [id]',
  manual: [
    'With no argument, lists the spool. With an id, prints that message.',
    '',
    'Use `headers <id>` to see what the mail client hides by default, which is',
    'where a forged sender stops being convincing.',
  ],
  run(args) {
    const { positional } = parseArgs(args);
    if (positional.length === 0) {
      // Address on the first line, subject under it. The address is shown
      // because it is what the sender actually used, and two lines per
      // message fit a classroom laptop where a four-column table would wrap.
      return [
        dim('spool: d.okonkwo@meridiangrid.net   5 messages'),
        plain(''),
        ...MAILBOX.flatMap((message) => [
          plain(`${String(message.id).padEnd(3)}${message.date.padEnd(18)}${message.from}`),
          dim(`   ${truncate(message.subject, 64)}`),
        ]),
        plain(''),
        dim('read a message: mail <id>      inspect delivery: headers <id>'),
      ];
    }

    const message = MAILBOX.find((entry) => entry.id === Number(positional[0]));
    if (!message) return [fail(`mail: no message ${positional[0]}`)];
    return [
      plain(`From:    ${message.fromDisplay} <${message.from}>`),
      plain(`To:      ${message.to}`),
      plain(`Date:    ${message.date}`),
      plain(`Subject: ${message.subject}`),
      rule(),
      ...lines(message.body),
    ];
  },
};

/** Plain-English reading guide under the raw headers. It explains the fields and judges nothing. */
const HEADER_KEY: readonly string[] = [
  'key:',
  '  Return-Path             where replies and bounces really go',
  '  Received                each machine that handled the message. The last',
  '                          one listed is where it entered',
  '  Authentication-Results  whether the sending machine was allowed to send',
  '                          for that domain (pass or fail)',
];

export const headers: Command = {
  name: 'headers',
  summary: 'show the delivery headers of a message',
  usage: 'headers <id>',
  manual: [
    'Prints the Return-Path, the delivery chain, and the authentication result.',
    '',
    'Received lines are added by each machine a message passes through, so the',
    'bottom one is where it entered. SPF says whether the sending machine was',
    'authorised to send for that domain. A fail is not a maybe.',
  ],
  run(args) {
    const { positional } = parseArgs(args);
    const message = MAILBOX.find((entry) => entry.id === Number(positional[0]));
    if (!message) return [fail(`headers: no message ${positional[0]}`)];
    return [
      dim(`-- delivery headers, message ${message.id} --`),
      ...lines(message.headers),
      plain(''),
      ...lines(HEADER_KEY, 'dim'),
    ];
  },
};

export const badge: Command = {
  name: 'badge',
  summary: 'read the physical access control log',
  usage: 'badge',
  manual: [
    'Every door event tonight: time, door, who badged, and HELD, which is how',
    'many seconds the door sensor recorded the door standing open.',
    '',
    'HELD is the column people forget exists. A badge reader opens a door for',
    'one person and it shuts behind them, so a normal entry is a few seconds.',
    'A door held open much longer than normal is how this log shows you that a',
    'second person walked through on one badge.',
    '',
    'This system is a different vendor from everything else in the building,',
    'which is the real reason nobody reads it next to the network logs.',
  ],
  run() {
    return [
      dim('Arbiter BadgePoint -- door events, current shift'),
      ...table(
        ['TIME', 'DOOR', 'ID', 'HOLDER', 'DIR', 'HELD'],
        BADGE_EVENTS.map((event) => [
          event.time,
          event.door,
          event.doorId,
          event.holder,
          event.direction,
          `${event.heldSeconds}s`,
        ]),
      ),
      plain(''),
      ...lines(
        BADGE_NOTES.map((note) => `  ${note}`),
        'dim',
      ),
    ];
  },
};

export const roster: Command = {
  name: 'roster',
  summary: 'staff directory: desks, badges, employment status',
  usage: 'roster',
  manual: [
    'Who works here, which workstation is assigned to them, whether their',
    'badge is active, and where they are tonight.',
    '',
    'A directory is not evidence on its own. It becomes evidence the moment an',
    'address in a log matches a desk in this table.',
  ],
  run() {
    // Two lines per person rather than a table: six columns of this width
    // wrap on a classroom laptop, and a wrapped table is unreadable.
    return [
      ...STAFF.flatMap((person) => [
        plain(`${person.handle.padEnd(12)}${person.name.padEnd(16)}${person.role}`),
        dim(
          `            ${person.workstation.padEnd(24)}badge ${person.badge.padEnd(20)}` +
            person.status,
        ),
      ]),
      plain(''),
      ...lines(
        STAFF_FOOTER.map((note) => `  ${note}`),
        'dim',
      ),
    ];
  },
};

export const scan: Command = {
  name: 'scan',
  summary: 'port scan a subnet',
  usage: 'scan <cidr>',
  manual: [
    'Scans a range and reports which ports are open.',
    '',
    '  scan 10.20.4.0/24',
    '',
    'A /24 fixes the first three numbers of an address and holds 256 of them.',
    'A /16 fixes the first two and holds 65,536. Which range a host sits in',
    'decides which firewall rules apply to it, so the notation matters.',
    '',
    'Under the results, a short key says what each service is in plain words.',
    'See `fw` for the firewall rules and the list of subnets.',
  ],
  run(args) {
    const { positional } = parseArgs(args);
    const target = positional[0];
    if (!target) return [fail('scan: usage: scan <cidr>, e.g. scan 10.20.4.0/24')];

    const prefix = target.split('/')[0].split('.').slice(0, 3).join('.');
    const hosts = SCAN_HOSTS.filter((host) => host.ip.startsWith(`${prefix}.`));
    if (hosts.length === 0) {
      return [
        dim(`scanning ${target} ...`),
        plain('0 hosts responded.'),
        dim('  the control network is 10.20.4.0/24. see `fw` for the subnet list'),
      ];
    }

    const out: OutputLine[] = [dim(`scanning ${target} ...   ${hosts.length} hosts up`), plain('')];
    const seen = new Set<string>();
    for (const host of hosts) {
      out.push(plain(`${host.ip}   ${host.hostname}`));
      for (const port of host.ports) {
        seen.add(port.service);
        out.push(
          plain(
            `    ${String(port.port).padStart(5)}/tcp  ${port.state.padEnd(9)}${port.service}` +
              (port.note ? `   ${port.note}` : ''),
          ),
        );
      }
      out.push(plain(''));
    }

    const key = Object.entries(SERVICE_KEY).filter(([service]) => seen.has(service));
    if (key.length > 0) {
      out.push(dim('what these services are:'));
      for (const [service, meaning] of key) out.push(dim(`  ${service.padEnd(11)}${meaning}`));
    }
    return out;
  },
};

export const fw: Command = {
  name: 'fw',
  summary: 'print the firewall access control list',
  usage: 'fw',
  manual: [
    'Prints the subnets and the ACL in the order the firewall evaluates it.',
    '',
    'Rules are checked from the top and the FIRST one that matches is the one',
    'that runs. Nothing below it is considered for that traffic. A permit',
    'placed above a deny turns the deny into dead code, and the rule set still',
    'reads perfectly sensibly to a human skimming it.',
  ],
  run() {
    return [
      dim('subnets:'),
      ...lines(SUBNET_LEGEND.map((entry) => `  ${entry}`)),
      plain(''),
      dim('access control list, evaluated top to bottom, first match wins:'),
      plain(''),
      ...FIREWALL_RULES.flatMap((entry) => [
        plain(
          `  ${entry.id.padEnd(9)}${entry.action.padEnd(6)}${entry.direction.padEnd(10)}` +
            `${entry.protocol.padEnd(5)}port ${entry.port.padEnd(5)}from ${entry.source}`,
        ),
        dim(`            ${entry.comment}`),
      ]),
      plain(''),
      dim('  expiry dates in comments are comments. Nothing enforces them.'),
      dim('  the ticket behind a rule: `ticket CHG-4417`'),
    ];
  },
};

export const log: Command = {
  name: 'log',
  summary: 'read a log source',
  usage: 'log <baseline|relay>',
  manual: [
    'Prints a log. Sources: baseline and relay.',
    '',
    '  log relay',
    '  log relay | grep 10.40',
    '',
    'The baseline records what this system looked like over 90 days when',
    'nothing was wrong. Comparing today against it is what anomaly-based',
    'detection means, and it is the only reason an unfamiliar address in a log',
    'is obviously unfamiliar.',
  ],
  run(args) {
    const { positional } = parseArgs(args);
    const name = positional[0];
    if (!name) {
      return [
        dim('log sources:'),
        ...LOG_SOURCES.map((source) => plain(`  ${source.name.padEnd(10)}${source.description}`)),
      ];
    }
    const source = LOG_SOURCES.find((entry) => entry.name === name);
    if (!source) {
      return [fail(`log: unknown source '${name}' (try: baseline, relay)`)];
    }
    return [
      dim(`-- ${source.name}: ${source.description} --`),
      dim(source.header),
      ...lines(source.lines.map((entry) => entry.text)),
    ];
  },
};

export const ticket: Command = {
  name: 'ticket',
  summary: 'print a change management ticket',
  usage: 'ticket <id>',
  manual: [
    'Prints a change request: who asked for it, from which machine, who',
    'approved it, and when.',
    '',
    'Change control is only a control if somebody reads the dates.',
  ],
  run(args) {
    const { positional } = parseArgs(args);
    const id = (positional[0] ?? '').toUpperCase();
    if (id !== 'CHG-4417') {
      return [fail(`ticket: no such ticket '${positional[0] ?? ''}' (try CHG-4417)`)];
    }
    return lines(CHANGE_TICKET);
  },
};

export const INVESTIGATE_COMMANDS = [mail, headers, badge, roster, scan, fw, log, ticket];
