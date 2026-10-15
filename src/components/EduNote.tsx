import Link from 'next/link';

import { CREDIT } from '@/content/about';

/**
 * A plain-language line under the terminal. It is rendered on the server, so
 * a page reviewer or content filter that reads the HTML sees what this site
 * is without having to run the game. It is visible to students too, on
 * purpose: it is a disclosure, not hidden text.
 */
export function EduNote() {
  return (
    <footer className="edu-note">
      Protocol: Nightjar is an AP Cybersecurity classroom activity. The scenario is fictional, the
      console is a simulation that connects to nothing, and no accounts or personal data are
      collected. {CREDIT} <Link href="/about">About this activity</Link>
    </footer>
  );
}
