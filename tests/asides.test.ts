import { describe, expect, it } from 'vitest';

import { LOCKS } from '@/content/locks';
import {
  ASIDES_AFTER_MISSES,
  ASIDE_FIRST_FINDING,
  ASIDE_FIRST_HINT,
  ASIDE_FOURTH_FINDING,
  ASIDE_LAST_HINT,
} from '@/content/asides';
import { abortKeyProgress } from '@/lib/commands/feedback';
import { TestTerminal } from './helpers';

const ALL_ASIDES = [
  ASIDE_FIRST_FINDING,
  ASIDE_FOURTH_FINDING,
  ASIDE_FIRST_HINT,
  ASIDE_LAST_HINT,
  ...ASIDES_AFTER_MISSES,
];

describe('abort key', () => {
  it('shows filed segments in lock order and dots for the rest', () => {
    const fragment = (id: string) => LOCKS.find((lock) => lock.id === id)!.fragment;
    expect(abortKeyProgress([])).toBe('····-····-····-····-····');
    expect(abortKeyProgress(['01', '04'])).toBe(
      `${fragment('01')}-····-····-${fragment('04')}-····`,
    );
  });

  it('is printed when a finding is accepted and by `status`', async () => {
    const term = new TestTerminal();
    const output = await term.run('unlock 01 meridian-grid.net');
    expect(output).toContain('abort key  ');
    expect(output).toContain(LOCKS[0].fragment);
    expect(output).toContain('····');
    expect(await term.run('status')).toContain(`abort key         ${LOCKS[0].fragment}-····`);
  });

  it('the finished key matches what `abort` assembles', () => {
    const all = LOCKS.map((lock) => lock.id);
    expect(abortKeyProgress(all)).toBe(LOCKS.map((lock) => lock.fragment).join('-'));
  });
});

describe('NIGHTJAR asides', () => {
  it('stay short enough not to wrap and always sign off', () => {
    for (const aside of ALL_ASIDES) {
      for (const line of aside) expect(line.length).toBeLessThanOrEqual(74);
      expect(aside[aside.length - 1]).toBe('-- NIGHTJAR');
    }
  });

  it('react to the first finding and the fourth, and say nothing at two', async () => {
    const term = new TestTerminal();
    expect(await term.run('unlock 01 meridian-grid.net')).toContain(
      'Nobody asks about the mail gateway',
    );
    expect(await term.run('unlock 02 D-14')).not.toContain('-- NIGHTJAR');
    await term.run('unlock 03 WREN-4417');
    expect(await term.run('unlock 04 10.20.4.31:23')).toContain('Do not look at the clock');
  });

  it('speak after every third wrong answer in a row, and a correct one resets the count', async () => {
    const term = new TestTerminal();
    expect(await term.run('unlock 01 nope-1.net')).not.toContain('-- NIGHTJAR');
    expect(await term.run('unlock 01 nope-2.net')).not.toContain('-- NIGHTJAR');
    expect(await term.run('unlock 01 nope-3.net')).toContain('There is a command for that');
    expect(term.state.misses).toBe(3);
    await term.run('unlock 01 nope-4.net');
    await term.run('unlock 01 nope-5.net');
    expect(await term.run('unlock 01 nope-6.net')).toContain('Read the evidence again');
    await term.run('unlock 01 meridian-grid.net');
    expect(term.state.misses).toBe(0);
  });

  it('comment on the first hint once, and on running a lock out of hints', async () => {
    const term = new TestTerminal();
    expect(await term.run('hint 01')).toContain('nobody offered me any');
    expect(await term.run('hint 01')).not.toContain('-- NIGHTJAR');
    expect(await term.run('hint 01')).toContain('I hid nothing');
    expect(await term.run('hint 01')).not.toContain('-- NIGHTJAR');
  });
});
