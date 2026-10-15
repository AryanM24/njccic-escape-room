# Protocol: Nightjar

A cybersecurity escape room for AP Cybersecurity students that runs entirely inside a
simulated terminal in the browser.

Students play the overnight SOC analyst at a regional power utility. At 02:15 the
operations console locks its operators out, a former contractor calling himself NIGHTJAR
has scheduled a load-shedding cascade for 03:00, and the abort is behind the utility's
own recovery procedure, which will not release it until the analyst files a correct
finding for each of the five subsystems the intrusion touched.

Five findings, a 45-minute clock, one class period.

## Scoped to semester 1

Everything here is solvable with **Units 1 to 3** of the AP Cybersecurity course
framework, which is the first half of the year by the CED's own pacing.

That means no hashing, no salting, no encryption, no key exchange and no access control
models, because those are Units 4 and 5. Every finding cites the CED topic it teaches,
and a test enforces that each one has a citation.

There is one deliberate exception. Finding 03 is a Caesar cipher, which is not in the
CED at all. It stays because it needs no prerequisites beyond the alphabet and it sets
up Unit 5.3 next semester. It is labelled as a preview everywhere it appears.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000. The boot sequence starts on its own. Type `help`.

Everything a student needs is inside the terminal, so nothing has to be installed on a
school laptop and no external site has to be reachable.

## The five findings

| # | Codename | CED | What they do |
| - | --- | --- | --- |
| 01 | INGRESS | 1.1.A, 1.2.B, 3.1.A.3 | Five emails. Find the phish, name the look-alike domain. |
| 02 | PREMISES | 2.2.A.3, 2.2.A.6, 2.4.C.3 | A badge log with door-hold times. Find the tailgated door. |
| 03 | CIPHER | preview of 5.3 | A Caesar-shifted note from the recycling. Crack it. |
| 04 | PERIMETER | 3.3.B, 3.4.B.2, 3.4.D.3 | Scan and read the ACL. Find the service a bad rule order exposes. |
| 05 | DETECTION | 3.5.A, 3.5.C.2, 2.1.C.7 | Compare the relay log against its baseline. Name the odd address. |

Then attribution, which is a synthesis rather than a new idea, and lands on the insider
adversary of Unit 2.1.B.3.

Gating is `01 → [02, 03, 04] → 05 → abort → accuse`, so three findings are open at once
and a stuck team can always move sideways.

## For the teacher

The answer key, the run of show, the common wrong turns, the CED alignment and a debrief
question per finding are in [FACILITATOR.md](FACILITATOR.md).

The same material renders as a printable page at `/facilitator`, gated, because your
students can reach that URL too. Set `FACILITATOR_CODE` and open
`/facilitator?key=<that value>`:

```bash
cp .env.example .env.local
```

Without the variable set, the page shows the run of show and no answers.

[STUDENT-BRIEFING.md](STUDENT-BRIEFING.md) is the spoiler-free version to read aloud
before they start, and **Protocol-Nightjar-Student-Guide.docx** is the printable
guide: the scenario, a few starter commands, and the idea behind each finding. It asks
students to write nothing down. Neither gives anything away.

If the school filter blocks the site, [IT-REQUEST.md](IT-REQUEST.md) is an email to send the
IT contact. The site also serves `/about`, a plain page for teachers and IT staff that says what
the activity is and what it needs, and every page carries a one-line description of itself in
the footer.

Rebuild the handout with `npm i --no-save docx && node scripts/build-student-guide.mjs
Protocol-Nightjar-Student-Guide.docx`. `docx` is not a project dependency on purpose.

Between class periods, type `reset --confirm` in the terminal on each machine and
reload.

## Why answers are not in the page

Students in this course will open DevTools. That is the course.

Answers never reach the browser. `unlock` posts to `/api/unlock`, which compares a
salted SHA-256 digest server-side and returns a boolean. `src/server/**` is marked
`import 'server-only'`, so pulling it into a client component is a build error rather
than a leak.

Two checks keep it that way, and both have caught real mistakes:

- `tests/no-answer-leak.test.ts` scans the source for every answer string, with an
  explicit allow-list of the artifacts each one legitimately belongs in.
- `npm run verify:bundle` scans the compiled client assets after a build.

The Caesar note ships encrypted, so finding 03's answer is not in the bundle in
readable form either.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server |
| `npm test` | Vitest, including a real solve of all five findings |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm run verify:bundle` | Scan the built client assets for answer strings |
| `npm run check` | All of the above plus a production build |
| `npm run mint-answer` | Mint a salted digest when adding or changing a finding |

The test suite plays the puzzles the way a student would. It reads the real content,
runs the real commands, pulls the answer out of the output and checks it against the
real server key. If a content edit makes a finding unsolvable, CI finds out instead of a
classroom.

## Documents

- [PRODUCT.md](PRODUCT.md) what this is for and who it is for
- [STORY.md](STORY.md) canon: cast, timeline, and why the findings exist at all
- [DESIGN.md](DESIGN.md) visual and interaction design, including accessibility rules
- [LOCKS.md](LOCKS.md) puzzle design, the semester 1 scope rule, one entry per finding
- [STUDENT-BRIEFING.md](STUDENT-BRIEFING.md) spoiler-free briefing to read aloud
- **Protocol-Nightjar-Student-Guide.docx** printable student guide
- [WALKTHROUGH.md](WALKTHROUGH.md) the full solution, command by command
- [AGENTS.md](AGENTS.md) working agreements for anyone editing this

## Content notes

Everything in the fiction is invented. Addresses are RFC 1918 and RFC 5737 documentation
ranges, no domain in it resolves, there is no real utility or real person anywhere in
it, and there is no working exploit code. The worst thing that happens in the story is
that the lights go out.

Built with Next.js, React and TypeScript. No state library, no UI kit, no animation
library. The only runtime dependency beyond the framework is `server-only`.
