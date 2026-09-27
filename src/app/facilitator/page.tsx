import type { Metadata } from 'next';

import { LOCKS_BY_ID } from '@/content/locks';
import {
  CED_ALIGNMENT,
  FACILITATOR_FINALE,
  FACILITATOR_KEY,
  FACILITATOR_NOTES,
  RUN_OF_SHOW,
} from '@/server/facilitator-key';

import styles from './facilitator.module.css';

export const metadata: Metadata = {
  title: 'Protocol: Nightjar facilitator sheet',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

/**
 * The teacher's page. Deliberately plain, light, and printable — a teacher
 * with four minutes before the bell should not have to fight an amber CRT.
 *
 * Gated: answers render only when FACILITATOR_CODE is set AND matches ?key=.
 * Without the env var the page still gives the run of show, because a locked
 * door that hides the timetable too is just annoying.
 */
export default async function FacilitatorPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const expected = process.env.FACILITATOR_CODE;
  const supplied = typeof params.key === 'string' ? params.key : '';
  const unlocked = Boolean(expected) && supplied === expected;

  return (
    <main className={styles.page}>
      <header>
        <h1>Protocol: Nightjar facilitator sheet</h1>
        <p className={styles.sub}>
          A cybersecurity escape room that runs entirely inside a simulated terminal. Five
          findings, a 45 minute clock, teams of 2 to 4 on one laptop. Scoped to AP
          Cybersecurity Units 1 to 3, which is semester 1.
        </p>
      </header>

      <section>
        <h2>Run of show</h2>
        <ol className={styles.runsheet}>
          {RUN_OF_SHOW.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </section>

      <section>
        <h2>CED alignment</h2>
        <ul className={styles.ced}>
          {CED_ALIGNMENT.map((row) => (
            <li key={row}>
              <code>{row}</code>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2>Notes</h2>
        <ul>
          {FACILITATOR_NOTES.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      </section>

      {!unlocked ? (
        <section className={styles.gate}>
          <h2>Answers are hidden</h2>
          {expected ? (
            <p>
              Add <code>?key=…</code> to this URL with the value of <code>FACILITATOR_CODE</code>.
            </p>
          ) : (
            <p>
              Set <code>FACILITATOR_CODE</code> in the environment, then visit this page with{' '}
              <code>?key=&lt;that value&gt;</code>. Until then the answer key stays off the web, because
              your students can reach this URL too. The full key is also in{' '}
              <code>FACILITATOR.md</code> in the repository.
            </p>
          )}
        </section>
      ) : (
        <>
          <section>
            <h2>Answer key</h2>
            {FACILITATOR_KEY.map((entry) => {
              const lock = LOCKS_BY_ID.get(entry.id);
              if (!lock) return null;
              return (
                <article key={entry.id} className={styles.lock}>
                  <h3>
                    {entry.id} · {lock.codename}
                    <span className={styles.minutes}>~{entry.minutes} min</span>
                  </h3>
                  <p className={styles.concept}>{lock.concept}</p>
                  <p className={styles.answer}>
                    Answer: <code>{entry.answer}</code>
                    {lock.caseSensitive ? <em> (case-sensitive)</em> : null}
                  </p>
                  {entry.alsoAccepted.length > 0 ? (
                    <p className={styles.concept}>
                      also accepted: {entry.alsoAccepted.map((alt) => alt).join(', ')}
                    </p>
                  ) : null}
                  <p className={styles.concept}>CED: {lock.ced}</p>

                  <h4>Common wrong turns</h4>
                  <ul>
                    {entry.wrongTurns.map((turn) => (
                      <li key={turn}>{turn}</li>
                    ))}
                  </ul>

                  <h4>Hints, in order</h4>
                  <ol>
                    {lock.hints.map((hint) => (
                      <li key={hint}>{hint}</li>
                    ))}
                  </ol>

                  <h4>Debrief question</h4>
                  <p className={styles.debrief}>{entry.debrief}</p>
                </article>
              );
            })}
          </section>

          <section className={styles.lock}>
            <h3>Finale · Attribution</h3>
            <p className={styles.answer}>
              Answer: <code>{FACILITATOR_FINALE.answer}</code>
            </p>
            <h4>The chain of evidence</h4>
            <ol>
              {FACILITATOR_FINALE.chain.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
            <h4>Debrief question</h4>
            <p className={styles.debrief}>{FACILITATOR_FINALE.debrief}</p>
          </section>
        </>
      )}
    </main>
  );
}
