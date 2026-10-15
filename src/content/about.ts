/**
 * Text for /about, the page a teacher or a school IT reviewer reads. Every
 * claim here is checkable in the code: no cookies, no third-party requests,
 * and one same-origin POST. If any of that changes, change this file too.
 */
export interface AboutSection {
  heading: string;
  paragraphs?: readonly string[];
  bullets?: readonly string[];
}

export const ABOUT_TITLE = 'About Protocol: Nightjar';

/** Shown in the page footer, on /about, and in the handout. Keep the wording identical everywhere. */
export const CREDIT = 'Made by Team 10 of the Advanced Interns at NJCCIC.';

/** Names only. These pages are public, so no emails or phone numbers. */
export const TEAM = [
  'Chaitanya Palasamudrum',
  'Bibhuti Swain',
  'Aryan Mittal',
  'Rohan Bhamidipati',
];

export const ABOUT_LEAD =
  'Protocol: Nightjar is a classroom activity for students who have finished the first semester of AP Cybersecurity. Teams of two to four work through five short investigations inside a simulated terminal, in one 45 minute class period.';

export const ABOUT_SECTIONS: readonly AboutSection[] = [
  {
    heading: 'What students do',
    paragraphs: [
      'Students play the overnight analyst at a fictional power utility. They read made-up email, door logs, network scans, firewall rules and system logs, decide what they show, and type their conclusions to file five incident findings. All of that material is plain text that ships with the page.',
    ],
  },
  {
    heading: 'What it teaches',
    paragraphs: [
      'Each finding practises one idea from Units 1 to 3 of the AP Cybersecurity course framework.',
    ],
    bullets: [
      'Recognising social engineering and phishing indicators',
      'Physical security controls and spotting a physical intrusion in access logs',
      'Network segmentation and how firewall rules are evaluated',
      'Reading logs, baselines and anomaly-based detection',
      'Insider threats and how an attack unfolds from start to finish',
      'One short preview of a classical substitution cipher, labelled as a Unit 5.3 preview',
    ],
  },
  {
    heading: 'What it is not',
    paragraphs: [
      'It is not a hacking tool and it cannot touch a real system. The terminal is a simulation: it does not run real commands, scan real networks or connect to any other computer. The files are read-only and the whole scenario is fictional. Every company, person, address and domain in it is invented, the addresses come from ranges reserved for documentation and private networks, and there is no working exploit code anywhere in it.',
    ],
  },
  {
    heading: 'Who made it',
    paragraphs: [CREDIT, `Team members: ${TEAM.join(', ')}.`],
  },
  {
    heading: 'Data and privacy',
    bullets: [
      'There are no accounts, no logins, no ads, no analytics and no cookies.',
      'There are no third-party scripts, fonts, images or embeds. The page loads everything from this one site.',
      'Progress, including an optional team name, is saved in the browser’s local storage on that one computer and is never sent anywhere.',
      'When a student submits an answer, the page sends the finding number, the typed answer and a random anonymous id for that browser to this same site so it can be checked. The id is made up by the browser, is not linked to a name, and exists only so one laptop can be told apart from the rest of a class sharing a network address.',
      'To slow down guessing, the server counts recent attempts per browser id and per network address, in memory only, and forgets them within minutes. The hosting provider may keep ordinary server logs.',
    ],
  },
  {
    heading: 'For IT staff',
    paragraphs: ['To run correctly the activity needs the following, and nothing else.'],
    bullets: [
      'HTTPS access to this one hostname',
      'JavaScript and browser local storage enabled',
      'An HTTP POST to /api/unlock on the same hostname, which must stay reachable for the whole session',
      'No other domains, no WebSockets, no downloads, no plugins or extensions, and no camera, microphone or location',
    ],
  },
];
