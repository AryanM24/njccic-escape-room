# STORY.md: Protocol Nightjar

> Canon. Every string the player sees has to agree with this file.
> If a name, time, or address appears in two places, STORY.md wins.

## Logline

At 02:15 on a Tuesday night, the operations console at a regional power utility locks
its operators out. A former contractor calling himself NIGHTJAR has scheduled a
load-shedding cascade for 03:00. The player is the overnight SOC analyst. The abort
exists, but the utility's own recovery procedure will not release it until somebody
files a correct finding for each of the five subsystems the intrusion touched.

The clock is real, the attacker is still in the building, and the thing standing between
the player and the abort is paperwork the utility wrote after the last incident.

## Why the locks exist

This is the load-bearing piece of the fiction, so it is worth stating plainly.

NIGHTJAR did not build a puzzle box. Attackers do not do that. What happened is that
Meridian had a bad night in 2021, somebody hit the wrong abort and dropped a sector that
did not need dropping, and the corrective action written by committee was **OT-REC-1**:
an emergency abort now requires a filed incident finding for every subsystem the console
flags, and the console validates each finding against what the logs actually show before
it releases that subsystem's authorization segment.

It was meant to stop a panicking operator mashing abort. Tonight it means the analyst
has to understand the intrusion before they are allowed to stop it. NIGHTJAR knows this
and it is part of why he picked tonight.

The player is not solving riddles an attacker left behind. They are filling in an
incident form that refuses to accept a wrong answer, which is a real thing that really
exists and really does infuriate people at three in the morning.

## The organization

**Meridian Grid Authority**, a public regional transmission operator, about 1,400 staff.

| Network | Range | Purpose |
| --- | --- | --- |
| Corporate | `10.40.0.0/16` | Desks, email, helpdesk, printers |
| Corporate floor 4 | `10.40.7.0/24` | Contractor and helpdesk workstations |
| Screened subnet | `10.99.1.0/24` | Vendor jump host, historian replica |
| OT / control | `10.20.4.0/24` | Relay controllers, breakers, telemetry |

The whole plot is one sentence of policy failure: corporate can reach control, because a
rule with the word TEMP in the comment sits above the rule that was supposed to stop it.

## Cast

| Handle | Name | Role | Tonight |
| --- | --- | --- | --- |
| `d.okonkwo` | Dele Okonkwo | SCADA Engineer II | Control Room B for the telemetry window |
| `j.pell` | Jamie Pell | Facilities Coordinator | Went home 17:30. Badge cloned. |
| `s.bramble` | Sana Bramble | OT Security Lead | Left site 22:50 |
| `r.vance` | Rhea Vance | Senior Controls Engineer | Lisbon, on PTO, resigning |
| `m.tso` | Marcus Tso | Ex-contractor, Arbiter Controls | In the building. Should not be. |
| `soc-night` | *the player* | Overnight SOC analyst | You |

Dele is in Control Room B because CHG-4390 restarts the Sector 4 telemetry collectors
between 01:00 and 04:00 and somebody has to watch the historian for gaps. That is his
alibi and it is also just his job.

## Marcus Tso

He is not a whistleblower and the story should never let him sound like one.

Marcus spent two years as an Arbiter Controls contractor at Meridian's helpdesk. In
November 2025 he was told to get a contractor imaging workflow running before an
onboarding wave, with no budget, no project, and a change process that would have taken
six weeks. So he did what the job rewarded: he raised a small ticket, forged an approval
because he could not get a real one in time, got a firewall exception, and shipped it.
Nobody reviewed it. The onboarding went fine. He got a thank-you email.

On 29 August his contract was not renewed. Cost reduction. Facilities switched his badge
off the same day, because badges are the one thing on the offboarding checklist that has
an owner who actually does it. His network account, his workstation and his firewall
rule stayed exactly where they were, because those belong to two other teams and there
is no list.

He is selling the access. There is a buyer, a payout, and a burner. He is bitter, but
the bitterness is not the point and he would be irritated by the suggestion that it is.
He is doing this because it is worth money and because he knows from the inside exactly
how long it takes Meridian to notice anything.

## Jamie Pell and Rhea Vance

Two different kinds of innocent, which is the point.

**Jamie Pell** is the accident. Their badge was cloned, so the badge log says they
opened a door at 23:04 when they had been at home since half past five. A student who
reads the HOLDER column and stops will accuse them. That near-miss is designed in.

**Rhea Vance** is the temptation. Eleven years, six written warnings about segmentation,
a resignation draft in her home directory, and her name on the approval for CHG-4417.
She did not do it: the approval is timestamped fourteen minutes before the ticket was
created, because Marcus pasted the block out of an older ticket without touching the
date. Her badge and her account are silent all night and she is in Lisbon.

The evidence against her is the satisfying kind. The evidence clearing her is a
timestamp nobody compared. That is worth a debrief conversation on its own.

## Timeline

All one night, which keeps the whole thing readable in 45 minutes.

| Time | Event |
| --- | --- |
| 17:30 | `j.pell` badges out of the Main Lobby and goes home. |
| 18:05 | `d.okonkwo` arrives for the night shift. |
| 22:50 | `s.bramble` leaves site. The building is down to one engineer. |
| 23:04 | A cloned copy of Jamie Pell's badge opens D-14. The door is held 47 seconds. |
| 23:19 | The same card opens Corporate Floor 4. |
| 23:31 | Phishing mail relayed from `wks-40719` to `d.okonkwo`. SPF fails. Delivered. |
| 23:47 | Dele enters his password on the fake portal. |
| 01:52 | Telnet session, `10.40.7.19` to `10.20.4.31:23`, in the clear. |
| 02:03 | Interlock override written. |
| 02:06 | Cascade scheduled for 03:00. |
| 02:07 | Operator console locked. |
| 02:11 | 41 lines rotated out of the relay log by hand. |
| 02:12 | The player badges into the SOC. |
| 02:15 | **Play begins.** |
| 03:00 | Four sectors shed. 240,000 meters. **Deadline.** |

Forty-five minutes, which is a class period, and which is how the CED paces this course.

## Tone

Procedural. The console is not a character and has no feelings about you. It reports, it
refuses, and it occasionally explains something because OT-REC-1 requires an explanation
to be recorded.

NIGHTJAR gives three full messages: at the start, at the halfway mark, and once at the
end. Between those he may add a one- or two-line aside, only in reaction to something the
player just did: the first and fourth findings filed, three wrong answers in a row, the
first hint, and the last hint of a lock. The console itself still never congratulates
anyone. He is tired and a little smug and he is not interested in being understood. He
never delivers a moral, and he never says anything that narrows down an answer. If a line
of his reads like a thesis statement, cut it.

Nothing in the fiction is real. RFC 1918 and RFC 5737 addresses only, invented domains,
no working exploit code, no real utility and no real person. The worst thing that
happens is that the lights go out.

## Ending

Five findings filed, the console releases the abort, the cascade stops.

Then the form asks who. The answer is not in any single finding: it is one workstation
address appearing in the mail headers, in the firewall rule and in the relay log, and a
staff directory that says whose desk that is and that his badge was revoked a month ago.
The console points the player there on purpose: after `abort` it names the finding 05
address and the roster, because the lookup is the lesson and the hunt for it was not.

Naming Jamie gets a refusal citing the 17:30 badge-out. Naming Rhea gets the timestamp.
Naming Dele gets the phish. Being wrong should still teach something.
