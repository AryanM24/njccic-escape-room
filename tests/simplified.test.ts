import { describe, expect, it } from 'vitest';

import { LOCKS_BY_ID } from '@/content/locks';
import { SCAN_HOSTS, SERVICE_KEY } from '@/content/network';
import { checkAnswer, rejectionFor } from '@/server/answer-keys';
import { TestTerminal } from './helpers';

/** The three simplifications: the email list, the scan key, and the finale pointer. */
describe('finding 01 is easier to get started on', () => {
  it('lists the real sender address of every message, so the odd one out is visible', async () => {
    const term = new TestTerminal();
    const list = await term.run('mail');
    const addresses = [...list.matchAll(/^\d\s+.{18}(\S+@\S+)$/gm)].map((m) => m[1]);
    expect(addresses).toHaveLength(5);
    expect(addresses.filter((a) => a.endsWith('@meridiangrid.net'))).toHaveLength(3);
  });

  it('explains the header fields in plain words under the raw headers', async () => {
    const term = new TestTerminal();
    const headers = await term.run('headers 3');
    expect(headers).toContain('Return-Path');
    expect(headers).toContain('where replies and bounces really go');
    expect(headers).toContain('pass or fail');
  });

  it('says to record the part after the @, and accepts a whole pasted address', () => {
    expect(LOCKS_BY_ID.get('01')!.objective).toContain('after the @');
    expect(checkAnswer('01', 'it-security@meridian-grid.net')).toBe(true);
    expect(checkAnswer('01', '<it-security@meridian-grid.net>')).toBe(true);
    expect(checkAnswer('01', 'benefits@meridiangrid.net')).toBe(false);
  });

  it('turns the two commonest wrong answers into a pointer', () => {
    expect(rejectionFor('01', 'meridiangrid.net')).toContain("Meridian's own domain");
    expect(rejectionFor('01', 'Meridian IT Security')).toContain('dot in it');
  });
});

describe('finding 04 is a matching exercise on the scan alone', () => {
  it('prints a key for every service it shows, including the one that is the answer', async () => {
    const term = new TestTerminal();
    const scan = await term.run('scan 10.20.4.0/24');
    expect(scan).toContain('what these services are:');
    for (const host of SCAN_HOSTS) {
      for (const port of host.ports) expect(SERVICE_KEY[port.service], port.service).toBeDefined();
    }
    expect(scan).toContain('readable text');
  });

  it('has exactly one telnet entry and no closed or filtered decoys', () => {
    const ports = SCAN_HOSTS.flatMap((host) => host.ports);
    expect(ports.filter((port) => port.service === 'telnet')).toHaveLength(1);
    expect(ports.every((port) => port.state === 'open')).toBe(true);
  });

  it('can be filed without ever running fw', async () => {
    const term = new TestTerminal();
    term.state = { ...term.state, open: ['01'] };
    expect(LOCKS_BY_ID.get('04')!.objective).not.toMatch(/read the firewall rules\./i);
    expect(await term.run('unlock 04 10.20.4.31:23')).toContain('ACCEPTED');
  });
});

describe('the final question points at where to look', () => {
  it('abort names the finding 05 address and the roster', async () => {
    const term = new TestTerminal();
    term.state = { ...term.state, open: ['01', '02', '03', '04', '05'] };
    const output = await term.run('abort');
    expect(output).toContain('the address you filed');
    expect(output).toContain('finding 05');
    expect(output).toContain('roster');
  });

  it('a machine name is refused with a pointer to the roster, not a dead end', () => {
    expect(rejectionFor('accuse', '10.40.7.19')).toContain('a machine, not a person');
    expect(rejectionFor('accuse', 'wks-40719')).toContain('roster');
    expect(rejectionFor('accuse', 'nobody')).toContain('finding 05');
  });
});
