import { ABORT_KEY, LOCKS, LOCKS_BY_ID } from '@/content/locks';
import { isLockId, type LockDefinition, type LockId } from '@/content/types';
import { ABORT_SUCCESS, AFTER_ACTION, NIGHTJAR_MIDPOINT } from '@/content/story';
import { BRIEFING_TXT } from '@/content/files';
import { dim, fail, hintLine, lines, ok, plain, rule, story, table } from '@/lib/terminal/output';
import { parseArgs } from '@/lib/terminal/parse';
import type { Command, CommandContext, GameState, OutputLine } from '@/lib/terminal/types';

export function isAvailable(lock: LockDefinition, state: Readonly<GameState>): boolean {
  return lock.requires.every((required) => state.open.includes(required));
}

function lockStatus(lock: LockDefinition, state: Readonly<GameState>): string {
  if (state.open.includes(lock.id)) return 'FILED';
  return isAvailable(lock, state) ? 'SEALED' : 'GATED';
}

export const locksCommand: Command = {
  name: 'locks',
  summary: 'list the five OT-REC-1 findings',
  usage: 'locks [id]',
  manual: [
    'With no argument, lists every lock and its state:',
    '',
    '  FILED   accepted',
    '  SEALED  available to work on now',
    '  GATED   needs an earlier lock first',
    '',
    'With an id, prints that lock\'s objective in full.',
  ],
  run(args, ctx) {
    const { positional } = parseArgs(args);
    if (positional.length > 0) {
      const id = positional[0].padStart(2, '0');
      if (!isLockId(id)) return [fail(`locks: no lock '${positional[0]}'`)];
      const lock = LOCKS_BY_ID.get(id)!;
      const state = lockStatus(lock, ctx.state);
      return [
        plain(`LOCK ${lock.id} · ${lock.codename}   [${state}]`),
        rule(),
        ...lines(wrap(lock.objective, 72)),
        plain(''),
        dim(`expected answer: ${lock.answerFormat}`),
        dim(`submit with    : unlock ${lock.id} <answer>`),
        ...(state === 'GATED'
          ? [dim(`requires       : ${lock.requires.join(', ')}`)]
          : []),
      ];
    }

    return [
      ...table(
        ['ID', 'CODENAME', 'STATE', 'OBJECTIVE'],
        LOCKS.map((lock) => [
          lock.id,
          lock.codename,
          lockStatus(lock, ctx.state),
          lockStatus(lock, ctx.state) === 'GATED' ? '(sealed behind earlier work)' : lock.brief,
        ]),
      ),
      plain(''),
      dim(`findings filed: ${ctx.state.open.length}/5      detail: locks <id>`),
    ];
  },
};

export const unlock: Command = {
  name: 'unlock',
  summary: 'submit an answer for a lock',
  usage: 'unlock <id> <answer>',
  manual: [
    'Submits an answer. Validation happens on the server. The answers are not',
    'in the page, and yes, somebody checks that every build.',
    '',
    '  unlock 01 example.net',
    '  unlock 06 ABCD-1234',
    '',
    'Wrong answers cost nothing but time. There is a rate limit, so if you are',
    'guessing fast enough to hit it, stop guessing and use `hint`.',
  ],
  async run(args, ctx) {
    const { positional } = parseArgs(args);
    if (positional.length < 2) return [fail('unlock: usage: unlock <id> <answer>')];

    const id = positional[0].padStart(2, '0');
    if (!isLockId(id)) return [fail(`unlock: no lock '${positional[0]}'`)];

    const lock = LOCKS_BY_ID.get(id)!;
    if (ctx.state.open.includes(id)) return [dim(`lock ${id} is already open.`)];
    if (!isAvailable(lock, ctx.state)) {
      return [
        fail(`lock ${id} is gated.`),
        dim(`  needs: ${lock.requires.filter((r) => !ctx.state.open.includes(r)).join(', ')}`),
      ];
    }

    const answer = positional.slice(1).join(' ');
    const result = await ctx.submit(id, answer);
    if (!result.correct) {
      return [
        fail(result.message ?? 'rejected.'),
        ...(result.retryAfterSeconds
          ? [dim(`  wait ${result.retryAfterSeconds}s`)]
          : [dim(`  expected: ${lock.answerFormat}      stuck? hint ${id}`)]),
      ];
    }

    const open = [...ctx.state.open, id];
    ctx.patchState({ open });

    const out: OutputLine[] = [
      ok(`FINDING ${id} · ${lock.codename} ACCEPTED`),
      plain(
        `OT-REC-1  ${open.length}/5 filed    authorization segment ${lock.fragment} released`,
      ),
      plain(''),
      ...lines(lock.beat),
      plain(''),
    ];

    if (open.length === 3 && !ctx.state.seenBeats.includes('midpoint')) {
      ctx.patchState({ seenBeats: [...ctx.state.seenBeats, 'midpoint'] });
      out.push(rule(), ...story(NIGHTJAR_MIDPOINT), rule());
    }
    if (open.length === 5) {
      out.push(ok('all five findings filed. OT-REC-1 satisfied. run `abort`'));
    }
    return out;
  },
};

export const hint: Command = {
  name: 'hint',
  summary: 'reveal the next hint for a lock',
  usage: 'hint <id>',
  manual: [
    'Three tiers per lock, revealed one at a time:',
    '',
    '  1  points you at the right artifact',
    '  2  names the technique and the command',
    '  3  leaves you one step from the answer',
    '',
    'Hints are free and cost nothing. Being stuck teaches nobody anything.',
  ],
  run(args, ctx) {
    const { positional } = parseArgs(args);
    const id = (positional[0] ?? '').padStart(2, '0');
    if (!isLockId(id)) return [fail('hint: usage: hint <id>, e.g. hint 03')];

    const lock = LOCKS_BY_ID.get(id)!;
    if (!isAvailable(lock, ctx.state)) return [fail(`lock ${id} is gated. Nothing to hint at yet.`)];

    const used = ctx.state.hints[id] ?? 0;
    const next = Math.min(used + 1, 3);
    if (used >= 3) {
      return [
        dim(`all three hints for lock ${id} are already out:`),
        ...lock.hints.flatMap((text, index) => [hintLine(`${index + 1}/3  ${text}`), plain('')]),
      ];
    }

    ctx.patchState({ hints: { ...ctx.state.hints, [id]: next } });
    return [
      hintLine(`lock ${id} · hint ${next}/3`),
      ...lines(wrap(lock.hints[next - 1], 72), 'hint'),
      ...(next < 3 ? [plain(''), dim(`still stuck? hint ${id}`)] : []),
    ];
  },
};

export const status: Command = {
  name: 'status',
  summary: 'incident status and findings filed',
  usage: 'status',
  manual: ['Where you are: findings filed, hints used, what is still workable.'],
  run(_args, ctx) {
    const open = ctx.state.open.length;
    const hintsUsed = Object.values(ctx.state.hints).reduce<number>((sum, n) => sum + (n ?? 0), 0);
    const sealed = LOCKS.filter(
      (lock) => !ctx.state.open.includes(lock.id) && isAvailable(lock, ctx.state),
    );

    return [
      plain('INCIDENT 2026-0917-01   "NIGHTJAR"'),
      plain(`  team              ${ctx.state.team ?? '(unnamed, try `team <name>`)'}`),
      plain(`  findings filed    ${open}/5   ${'█'.repeat(open)}${'░'.repeat(5 - open)}`),
      plain(`  hints used        ${hintsUsed}`),
      plain(`  cascade           ${ctx.state.aborted ? 'STOOD DOWN' : 'ARMED for 03:00'}`),
      plain(`  attribution       ${ctx.state.attributed ? 'CLOSED' : 'OPEN'}`),
      plain(''),
      ...(sealed.length > 0
        ? [dim(`workable now: ${sealed.map((lock) => `${lock.id} ${lock.codename}`).join('   ')}`)]
        : []),
      ...(open === 5 && !ctx.state.aborted ? [ok('all five findings filed. run `abort`')] : []),
    ];
  },
};

export const abort: Command = {
  name: 'abort',
  summary: 'release the authorization and stop the cascade',
  usage: 'abort',
  manual: ['Available once all five findings are filed. This is the point of tonight.'],
  run(_args, ctx) {
    if (ctx.state.open.length < 5) {
      return [
        fail(`abort: OT-REC-1 not satisfied. ${ctx.state.open.length}/5 findings filed.`),
        dim('  the console will not release a partial authorization. see `locks`'),
      ];
    }
    if (ctx.state.aborted) {
      return [dim('cascade already stood down. attribution is still open. try `accuse <username>`')];
    }
    ctx.patchState({ aborted: true });
    return [
      plain(`assembling abort authorization ... ${ABORT_KEY}`),
      plain(''),
      ...story(ABORT_SUCCESS),
    ];
  },
};

export const accuse: Command = {
  name: 'accuse',
  summary: 'name NIGHTJAR',
  usage: 'accuse <username>',
  manual: [
    'Attribution. Only available after the cascade is stopped, because',
    'containment comes first and always has.',
  ],
  async run(args, ctx) {
    const { positional } = parseArgs(args);
    if (!ctx.state.aborted) {
      return [fail('accuse: contain the incident first. Run `abort`.')];
    }
    if (ctx.state.attributed) return [dim('attribution is closed. Read the report again: `report`.')];
    if (positional.length === 0) return [fail('accuse: usage: accuse <username>, e.g. accuse a.person')];

    const result = await ctx.submit('accuse', positional[0]);
    if (!result.correct) {
      return [
        fail(result.message ?? 'That does not hold up.'),
        dim('  attribution needs evidence, not motive. Re-read findings 01, 02 and 05.'),
      ];
    }
    ctx.patchState({ attributed: true });
    return [ok('ATTRIBUTION ACCEPTED'), plain(''), ...story(AFTER_ACTION)];
  },
};

export const report: Command = {
  name: 'report',
  summary: 'reprint the after-action report',
  usage: 'report',
  manual: ['Available once the incident is attributed. This is your debrief handout.'],
  run(_args, ctx) {
    if (!ctx.state.attributed) return [fail('report: incident is not closed yet.')];
    return lines(AFTER_ACTION);
  },
};

export const briefing: Command = {
  name: 'briefing',
  summary: 'reread the shift briefing',
  usage: 'briefing',
  manual: ['What you walked into.'],
  run() {
    return lines(BRIEFING_TXT.replace(/\n$/, '').split('\n'));
  },
};

export const team: Command = {
  name: 'team',
  summary: 'set your team name',
  usage: 'team <name>',
  manual: ['Cosmetic. It goes in the status bar and the report.'],
  run(args, ctx) {
    const name = args.join(' ').trim();
    if (!name) return [plain(`team: ${ctx.state.team ?? '(unnamed)'}`)];
    ctx.patchState({ team: name.slice(0, 32) });
    return [ok(`team set: ${name.slice(0, 32)}`)];
  },
};

/** Wraps prose to a column width without breaking words. */
export function wrap(text: string, width: number): string[] {
  const out: string[] = [];
  let current = '';
  for (const word of text.split(/\s+/)) {
    if (current.length + word.length + 1 > width && current.length > 0) {
      out.push(current);
      current = word;
    } else {
      current = current ? `${current} ${word}` : word;
    }
  }
  if (current) out.push(current);
  return out;
}

export const GAME_COMMANDS: Command[] = [
  locksCommand,
  unlock,
  hint,
  status,
  abort,
  accuse,
  report,
  briefing,
  team,
];

export type { CommandContext, LockId };
