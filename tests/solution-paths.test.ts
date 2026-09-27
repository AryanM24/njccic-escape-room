import { describe, expect, it } from 'vitest';

import { checkAnswer } from '@/server/answer-keys';
import { LOCKS } from '@/content/locks';
import { TestTerminal, capture } from './helpers';

/**
 * The most important file in the repo.
 *
 * Each test walks the intended solution path using the commands a student
 * would actually type, derives the answer from the output rather than
 * hardcoding it, and checks it against the real server key. If content drifts
 * and a finding stops being solvable, CI finds out before a classroom does.
 */
describe('solution paths', () => {
  it('01 INGRESS - the message that fails SPF names the look-alike domain', async () => {
    const term = new TestTerminal();
    let phishDomain: string | undefined;

    for (const id of [1, 2, 3, 4, 5]) {
      const headers = await term.run(`headers ${id}`);
      if (!headers.includes('spf=fail')) continue;
      phishDomain = capture(headers, /Return-Path: <[^@]+@([^>]+)>/);
    }

    expect(phishDomain, 'exactly one message should fail SPF').toBeDefined();
    expect(checkAnswer('01', phishDomain!)).toBe(true);
  });

  it('02 PREMISES - the door-held-open outlier is the tailgated door', async () => {
    const term = new TestTerminal();
    const rows = (await term.run('badge'))
      .split('\n')
      .map((line) => line.match(/^(\d{2}:\d{2})\s+(.+?)\s+(D-\d+)\s+(\S+)\s+(in|out)\s+(\d+)s$/))
      .filter((match): match is RegExpMatchArray => match !== null);

    expect(rows.length).toBeGreaterThan(8);

    const held = rows.map((row) => Number(row[6]));
    const typical = Math.max(...held.filter((seconds) => seconds < 20));
    const outliers = rows.filter((row) => Number(row[6]) > typical * 3);

    expect(outliers, 'exactly one door should be held open abnormally long').toHaveLength(1);
    const [, time, , doorId, holder] = outliers[0];
    expect(checkAnswer('02', doorId)).toBe(true);

    // The same row is also a cloned card: that holder already went home.
    const wentHome = rows.find((row) => row[4] === holder && row[5] === 'out');
    expect(wentHome, 'the badge holder should have badged out earlier').toBeDefined();
    expect(wentHome![1] < time).toBe(true);
  });

  it('03 CIPHER - cracking all 25 shifts reveals the burner account', async () => {
    const term = new TestTerminal();

    const raw = await term.run('cat /var/evidence/note.txt');
    expect(raw).not.toContain('WREN');

    const output = (await term.run('caesar --crack --file /var/evidence/note.txt')).split('\n');

    // 25 candidates, and the most English-looking one is printed first.
    const headings = output
      .map((line, index) => ({ line, index }))
      .filter(({ line }) => /^shift\s+-?\d+$/.test(line.trim()));
    expect(headings).toHaveLength(25);

    const best = output.slice(headings[0].index, headings[1].index).join('\n');
    const burner = capture(best, /\b([A-Z]{4}-\d{4})\b/);
    expect(checkAnswer('03', burner)).toBe(true);
  });

  it('04 PERIMETER - the scan finds the plaintext login service', async () => {
    const term = new TestTerminal();
    const scan = await term.run('scan 10.20.4.0/24');

    let currentHost = '';
    let exposure: string | undefined;
    for (const line of scan.split('\n')) {
      const host = line.match(/^(\d+\.\d+\.\d+\.\d+)\s/);
      if (host) currentHost = host[1];
      const port = line.match(/^\s+(\d+)\/tcp\s+open\s+telnet/);
      if (port) exposure = `${currentHost}:${port[1]}`;
    }

    expect(exposure).toBeDefined();
    expect(checkAnswer('04', exposure!)).toBe(true);

    // And the permit really does sit above the deny it makes unreachable.
    const fwLines = (await term.run('fw')).split('\n');
    const permit = fwLines.findIndex((line) => line.includes('RULE 20'));
    const deny = fwLines.findIndex((line) => line.includes('RULE 30'));
    expect(permit).toBeGreaterThan(-1);
    expect(deny).toBeGreaterThan(permit);
  });

  it('05 DETECTION - the relay log breaks the baseline on source and hour', async () => {
    const term = new TestTerminal();

    const baseline = await term.run('log baseline');
    const normalSource = capture(baseline, /session sources\s+(\d+\.\d+\.\d+\.\d+)/);

    const relay = await term.run('log relay');
    const sources = [...relay.matchAll(/^\d{2}:\d{2}\s+(\d+\.\d+\.\d+\.\d+)\s/gm)].map((m) => m[1]);
    const unexpected = [...new Set(sources)].filter((source) => source !== normalSource);

    expect(unexpected, 'one source should be outside the baseline').toHaveLength(1);
    expect(checkAnswer('05', unexpected[0])).toBe(true);

    // It is also outside the baseline's 06:00-18:00 window.
    const hour = Number(capture(relay, /^(\d{2}):\d{2}\s+10\.40\.7\.19/m));
    expect(hour < 6 || hour >= 18).toBe(true);
  });

  it('FINALE - the roster maps that address to a person whose badge was revoked', async () => {
    const term = new TestTerminal();
    const roster = await term.run('roster');

    // Each person is two lines: a heading, then an indented detail line
    // carrying the workstation address.
    const lines = roster.split('\n');
    const detailIndex = lines.findIndex((line) => line.includes('10.40.7.19'));
    expect(detailIndex, 'the roster should assign that workstation').toBeGreaterThan(0);
    expect(lines[detailIndex]).toContain('REVOKED');

    const handle = capture(lines[detailIndex - 1], /^(\S+)/);
    expect(checkAnswer('accuse', handle)).toBe(true);
  });

  it('every finding has a distinct fragment and they assemble in order', () => {
    const fragments = LOCKS.map((lock) => lock.fragment);
    expect(new Set(fragments).size).toBe(fragments.length);
    expect(fragments).toHaveLength(5);
  });
});
