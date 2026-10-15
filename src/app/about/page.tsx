import type { Metadata } from 'next';
import Link from 'next/link';

import { ABOUT_LEAD, ABOUT_SECTIONS, ABOUT_TITLE } from '@/content/about';

import styles from './about.module.css';

export const metadata: Metadata = {
  title: `${ABOUT_TITLE} | AP Cybersecurity classroom activity`,
  description: ABOUT_LEAD,
};

export default function AboutPage() {
  return (
    <main className={styles.page}>
      <h1>{ABOUT_TITLE}</h1>
      <p className={styles.lead}>{ABOUT_LEAD}</p>

      {ABOUT_SECTIONS.map((section) => (
        <section key={section.heading}>
          <h2>{section.heading}</h2>
          {section.paragraphs?.map((text) => (
            <p key={text}>{text}</p>
          ))}
          {section.bullets ? (
            <ul>
              {section.bullets.map((text) => (
                <li key={text}>{text}</li>
              ))}
            </ul>
          ) : null}
        </section>
      ))}

      <p className={styles.back}>
        <Link href="/">Open the activity</Link>
      </p>
    </main>
  );
}
