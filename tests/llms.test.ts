import { describe, expect, it } from 'vitest';

import { ABOUT_SECTIONS, TEAM } from '@/content/about';
import { buildLlmsTxt } from '@/content/llms';
import { LOCKS } from '@/content/locks';

import { ANSWERS } from './answers';

const text = buildLlmsTxt('https://example.test');

describe('llms.txt', () => {
  it('gives the credit, the team names and a citation with the site address', () => {
    expect(text).toContain('Made by Team 10 of the Advanced Interns at NJCCIC.');
    for (const name of [
      'Chaitanya Palasamudrum',
      'Bibhuti Swain',
      'Aryan Mittal',
      'Rohan Bhamidipati',
    ]) {
      expect(text).toContain(name);
    }
    expect(text).toContain('Suggested citation (APA)');
    expect(text).toContain('https://example.test/');
  });

  it('is public, so it carries no email address or phone number', () => {
    expect(text).not.toMatch(/@[a-z0-9-]+\.[a-z]{2,}/i);
    expect(text).not.toMatch(/\d{3}[-.\s]\d{3}[-.\s]\d{4}/);
  });

  it('describes every finding and gives away none of the answers', () => {
    for (const lock of LOCKS) expect(text).toContain(`${lock.id}, ${lock.codename}`);
    for (const answer of ANSWERS) {
      expect(text.toLowerCase(), answer).not.toContain(answer.toLowerCase());
    }
    expect(text).not.toMatch(/10\.\d+\.\d+\.\d+/);
  });
});

describe('/about', () => {
  it('credits the team by name and carries no contact details', () => {
    const about = JSON.stringify(ABOUT_SECTIONS);
    for (const name of TEAM) expect(about).toContain(name);
    expect(about).not.toMatch(/@[a-z0-9-]+\.[a-z]{2,}/i);
    expect(about).not.toMatch(/\d{3}[-.\s]\d{3}[-.\s]\d{4}/);
  });
});
