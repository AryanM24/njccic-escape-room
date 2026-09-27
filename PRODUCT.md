# PRODUCT.md: Protocol Nightjar

## What this is

A cybersecurity escape room for a high-school AP Cybersecurity class. The whole
experience is a simulated terminal. There is no other interface: no buttons, no modals,
no forms. Students type commands, read output, reason about what they read, and file
findings with `unlock`.

It is scoped to **semester 1** of AP Cybersecurity, which is Units 1 to 3 of the
course framework. LOCKS.md has the mapping and what that scope rules out.

It deploys as a single page. Students open a URL and are inside the fiction in ten
seconds.

## Who plays it

Ninth to twelfth graders, in teams of two to four at one laptop. Mixed experience: a few
have used a shell, most have not.

One teacher, twenty-five to thirty students, one class period. The CED paces this
course in 45-minute periods, so the clock in the game is 45 real minutes and the
debrief comes after it.

They are on school laptops that may be locked down, which sets most of the constraints:

- No installs, no external tools, no shell on the host machine.
- **Every puzzle is solvable inside the simulated terminal.** It ships its own toolbelt
  (`b64`, `hex`, `xor`, `hash`, `grep`) so nobody needs CyberChef or a real shell.
  Learning to drive those tools is part of the objective, not a workaround.
- Works offline after first load. No database, no accounts, no personal data.

## Design goals

**The fiction never breaks.** No score, no confetti, no "Great job!". Feedback is system
output: `FINDING 02 · PREMISES ACCEPTED`. The console is a machine and does not
congratulate anyone.

**Every finding teaches one named idea from the course**, cited by CED topic, so the
debrief can point at it. A finding that is only a riddle does not belong here, and
neither does one that needs Unit 4 or 5 content.

**No guess-and-check.** Answers are specific strings pulled out of evidence: a domain, an
IP and port, a username, a cracked password. Guessing is impractical and rate-limited.

**Answers are not in the client bundle.** Students in this class will open DevTools, and
they should. Validation happens server-side against salted digests, so "view source" is a
dead end, and saying that out loud in the debrief is its own small lesson about where
trust boundaries live.

**Nobody is stuck for ten minutes.** Three hints per lock, free and self-serve, escalating
from nudge to method to nearly-the-answer. A stuck team is a bored team and a bored team
learns nothing.

**Sideways movement when possible.** Finding 01 comes first because it is the gentlest
and it teaches the mail commands. Findings 02, 03 and 04 then open together, so a team
that stalls on one can go and do another. Finding 05 needs all three, because it is
the synthesis.

## Why the locks exist in the fiction

This mattered enough to get its own section in STORY.md, and it is a product decision as
much as a writing one.

An attacker who hides the abort key behind five educational puzzles about his own
attack is not believable, and students notice. So the findings are not his doing.
They are OT-REC-1, the utility's own post-incident recovery procedure, written by a
committee after a previous outage, which will not release the abort until an analyst
files a correct finding for every affected subsystem.

The obstacle is the organisation's paperwork, which is both plausible and thematically
the whole point of the story.

## Scope

**In**

- Terminal: history, tab completion, a consistent read-only virtual filesystem, CRT
  styling with a real off switch.
- Five findings with server-side validation and a hint ladder, plus an attribution
  finale.
- Narrative: boot, briefing, a beat per lock, three appearances by the antagonist, a
  shift report at the end that doubles as the debrief handout.
- Progress in `localStorage`, so a refresh or a dead battery does not reset a team.
- A gated `/facilitator` page: answer key, objective, expected time, wrong turns, hints,
  debrief prompts. Printable.
- Team name and a countdown, mostly for classroom theatre.

**Out, for now**

- Multiplayer sync across machines, leaderboards, server-side persistence, accounts, a
  content authoring UI, mobile layout. It is a terminal, so it wants a keyboard.

## What good looks like

- A team with no shell experience clears finding 01 within seven minutes of boot.
- The median team is into finding 05 by the 35 minute mark.
- At debrief, students can name the idea behind at least four of the five findings,
  and can say roughly where each one sits in the course.
- No team is blocked by a bug, a typo in an accepted answer, or a hint that points at
  the wrong artifact.

## Non-goals

This is not a CTF. It does not teach offensive tooling, does not encourage attacking real
systems, and contains no working exploit code. Every "attack" is an artifact the students
examine afterwards, as responders.
