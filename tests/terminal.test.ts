import { describe, expect, it } from 'vitest';

import { COMMANDS, findCommand, suggest } from '@/lib/commands';
import { LOCKS, LOCKS_BY_ID } from '@/content/locks';
import { LOCK_IDS } from '@/content/types';
import { BADGE_EVENTS } from '@/content/badge';
import { FIREWALL_RULES } from '@/content/network';
import { ALPHABET_SIZE, caesarCrack, caesarShift } from '@/lib/tools/caesar';
import { parseArgs, tokenize } from '@/lib/terminal/parse';
import { complete } from '@/lib/terminal/complete';
import { RATE_LIMIT_CONFIG, takeAttempt } from '@/server/rate-limit';
import { TestTerminal } from './helpers';

describe('caesar', () => {
  it('round-trips at every shift', () => {
    const text = 'Attack at dawn, bring WREN-4417.';
    for (let shift = 0; shift < ALPHABET_SIZE; shift++) {
      expect(caesarShift(caesarShift(text, shift), -shift)).toBe(text);
    }
  });

  it('leaves digits, punctuation and case alone', () => {
    const shifted = caesarShift('WREN-4417, go.', 7);
    expect(shifted).toMatch(/^[A-Z]{4}-4417, [a-z]{2}\.$/);
  });

  it('wraps around the end of the alphabet', () => {
    expect(caesarShift('xyz', 3)).toBe('abc');
    expect(caesarShift('XYZ', 3)).toBe('ABC');
  });

  it('offers exactly 25 candidate decryptions', () => {
    const candidates = caesarCrack(caesarShift('the quick brown fox', 11));
    expect(candidates).toHaveLength(25);
    expect(candidates.filter((c) => c.text === 'the quick brown fox')).toHaveLength(1);
  });

  it('ranks the English decryption first', () => {
    const cipher = caesarShift('this is the note and it is not encrypted at all', 19);
    const best = [...caesarCrack(cipher)].sort((a, b) => b.score - a.score)[0];
    expect(best.text).toContain('this is the note');
    expect(best.shift).toBe(19);
  });
});

describe('argument parsing', () => {
  it('keeps quoted strings together', () => {
    expect(tokenize('caesar --shift 3 "hold the door"')).toEqual([
      'caesar',
      '--shift',
      '3',
      'hold the door',
    ]);
  });

  it('treats undeclared --flags as boolean so values are not swallowed', () => {
    const parsed = parseArgs(['--crack', 'ciphertext'], ['file', 'shift']);
    expect(parsed.flags.crack).toBe(true);
    expect(parsed.positional).toEqual(['ciphertext']);
  });

  it('reads declared value flags, including negative numbers', () => {
    const parsed = parseArgs(['--shift', '-3', 'text'], ['file', 'shift']);
    expect(parsed.flags.shift).toBe('-3');
    expect(parsed.positional).toEqual(['text']);
  });
});

describe('command surface', () => {
  it('every command has a usage line and a manual', () => {
    for (const command of COMMANDS) {
      expect(command.usage, command.name).not.toBe('');
      expect(command.manual.length, command.name).toBeGreaterThan(0);
    }
  });

  it('command names are unique', () => {
    const names = COMMANDS.map((command) => command.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it('every command listed in `help` actually exists', async () => {
    const term = new TestTerminal();
    const help = await term.run('help');
    const listed = help
      .split('\n')
      .map((line) => line.match(/^ {2}(\S+)/)?.[1])
      .filter((name): name is string => Boolean(name));

    expect(listed.length).toBeGreaterThan(15);
    for (const name of listed) expect(findCommand(name), name).toBeDefined();
  });

  it('no out-of-scope tool survived the semester 1 rescope', () => {
    // Hashing is Unit 4.2/5.3 and encoding is not in the CED at all. If one
    // of these comes back, the scope rule in LOCKS.md has been broken.
    for (const name of ['hash', 'b64', 'hex', 'xor', 'verify', 'perms']) {
      expect(findCommand(name), `${name} should no longer exist`).toBeUndefined();
    }
  });

  it('suggests a command for a near miss instead of dead-ending', async () => {
    expect(suggest('caeser')).toBe('caesar');
    const term = new TestTerminal();
    expect(await term.run('hlep')).toContain('did you mean');
  });

  it('refuses /etc/shadow but points somewhere useful', async () => {
    const term = new TestTerminal();
    const output = await term.run('cat /etc/shadow');
    expect(output).toContain('Permission denied');
    expect(output).toContain('/var');
  });

  it('pipes into grep', async () => {
    const term = new TestTerminal();
    const output = await term.run('log relay | grep 10.40');
    expect(output.split('\n').every((line) => line.includes('10.40'))).toBe(true);
  });

  it('completes commands and paths', () => {
    expect(complete('cae', '/home/soc').value).toBe('caesar ');
    expect(complete('cat /var/evid', '/home/soc').value).toBe('cat /var/evidence');
  });
});

describe('content invariants', () => {
  it('exactly one badge row is an abnormally long door hold', () => {
    const normal = BADGE_EVENTS.filter((event) => event.heldSeconds <= 10);
    const outliers = BADGE_EVENTS.filter((event) => event.heldSeconds > 10);
    expect(outliers).toHaveLength(1);
    expect(normal.length).toBeGreaterThan(8);
    expect(outliers[0].heldSeconds).toBeGreaterThan(30);
  });

  it('the badge log is in chronological order within the shift', () => {
    const minutes = BADGE_EVENTS.map((event) => {
      const [h, m] = event.time.split(':').map(Number);
      // The shift runs past midnight, so early hours belong at the end.
      return (h < 12 ? h + 24 : h) * 60 + m;
    });
    expect(minutes).toEqual([...minutes].sort((a, b) => a - b));
  });

  it('the permit that defeats the deny is listed above it', () => {
    const permit = FIREWALL_RULES.findIndex((r) => r.action === 'ALLOW' && r.source === '10.40.7.0/24');
    const deny = FIREWALL_RULES.findIndex((r) => r.action === 'DENY' && r.source === '10.40.0.0/16');
    expect(permit).toBeGreaterThan(-1);
    expect(deny).toBeGreaterThan(permit);
  });

  it('every finding cites the CED topic it comes from', () => {
    for (const lock of LOCKS) {
      expect(lock.ced, lock.id).not.toBe('');
    }
  });
});

describe('finding gating', () => {
  it('01 opens first, 02-04 are a pool behind it, 05 needs all three', () => {
    expect(LOCKS_BY_ID.get('01')!.requires).toEqual([]);
    for (const id of ['02', '03', '04'] as const) {
      expect(LOCKS_BY_ID.get(id)!.requires).toEqual(['01']);
    }
    expect(LOCKS_BY_ID.get('05')!.requires).toEqual(['02', '03', '04']);
  });

  it('refuses a correct answer for a gated finding', async () => {
    const term = new TestTerminal();
    const output = await term.run('unlock 05 10.40.7.19');
    expect(output).toContain('gated');
    expect(term.state.open).toEqual([]);
  });

  it('accepts it once the prerequisites are filed', async () => {
    const term = new TestTerminal();
    term.state = { ...term.state, open: ['01', '02', '03', '04'] };
    const output = await term.run('unlock 05 10.40.7.19');
    expect(output).toContain('ACCEPTED');
    expect(term.state.open).toContain('05');
  });

  it('will not abort on a partial key', async () => {
    const term = new TestTerminal();
    term.state = { ...term.state, open: ['01', '02', '03', '04'] };
    expect(await term.run('abort')).toContain('4/5');
  });

  it('will not attribute before containment', async () => {
    const term = new TestTerminal();
    term.state = { ...term.state, open: [...LOCK_IDS] };
    expect(await term.run('accuse m.tso')).toContain('contain the incident first');
  });

  it('closes the incident after abort', async () => {
    const term = new TestTerminal();
    term.state = { ...term.state, open: [...LOCK_IDS] };
    await term.run('abort');
    expect(term.state.aborted).toBe(true);
    const output = await term.run('accuse m.tso');
    expect(output).toContain('ATTRIBUTION ACCEPTED');
    expect(term.state.attributed).toBe(true);
  });

  it('a wrong accusation explains why, rather than just saying no', async () => {
    const term = new TestTerminal();
    term.state = { ...term.state, open: [...LOCK_IDS], aborted: true };
    expect((await term.run('accuse j.pell')).toLowerCase()).toContain('cloned');
    expect((await term.run('accuse r.vance')).toLowerCase()).toContain('forgery');
    expect((await term.run('accuse d.okonkwo')).toLowerCase()).toContain('phished');
  });
});

describe('hints', () => {
  it('every finding has exactly three tiers', () => {
    for (const lock of LOCKS) {
      expect(lock.hints, lock.id).toHaveLength(3);
      for (const text of lock.hints) expect(text.length, lock.id).toBeGreaterThan(30);
    }
  });

  it('reveals one tier at a time and stops at three', async () => {
    const term = new TestTerminal();
    expect(await term.run('hint 01')).toContain('hint 1/3');
    expect(await term.run('hint 01')).toContain('hint 2/3');
    expect(await term.run('hint 01')).toContain('hint 3/3');
    expect(await term.run('hint 01')).toContain('already out');
    expect(term.state.hints['01']).toBe(3);
  });

  it('refuses to hint at a gated finding', async () => {
    const term = new TestTerminal();
    expect(await term.run('hint 05')).toContain('gated');
  });
});

describe('rate limiting', () => {
  it('allows a run of typos then throttles a grinder', () => {
    const client = 'test-client';
    for (let attempt = 0; attempt < RATE_LIMIT_CONFIG.MAX_ATTEMPTS; attempt++) {
      expect(takeAttempt(client, '03', 1_000 + attempt).allowed).toBe(true);
    }
    const blocked = takeAttempt(client, '03', 1_100);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
  });

  it('limits each finding independently', () => {
    const client = 'other-client';
    for (let attempt = 0; attempt < RATE_LIMIT_CONFIG.MAX_ATTEMPTS; attempt++) {
      takeAttempt(client, '01', 1_000 + attempt);
    }
    expect(takeAttempt(client, '02', 1_100).allowed).toBe(true);
  });
});
