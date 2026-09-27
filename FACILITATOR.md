# FACILITATOR.md

Answer key and teaching notes. **Spoilers.** The same content renders at `/facilitator`
if you set `FACILITATOR_CODE` and open `/facilitator?key=<that value>`.

## The setup, in thirty seconds

Students are the overnight SOC analyst at Meridian Grid Authority. A former contractor
called NIGHTJAR has scheduled a load-shedding cascade for 03:00. The abort is blocked by
OT-REC-1, the utility's own post-incident procedure, which requires a correct filed
finding for each of the five subsystems the intrusion touched.

The clock on screen is 45 real minutes, which is 02:15 to 03:00 in the fiction.

Worth saying out loud in the debrief: the attacker did not build the puzzles. The
paperwork did, and the paperwork exists because of a previous incident.

## Scope

Everything is solvable with **Units 1 to 3**, the semester 1 material. No hashing, no
encryption, no access control models.

Finding 03, the Caesar cipher, is the one deliberate exception. It is not in the CED,
but it requires no prior knowledge and previews Unit 5.3.

## CED alignment

```
01 INGRESS     1.1.A social engineering indicators
               1.2.B weak authentication
               3.1.A.3 credential harvesting
02 PREMISES    2.2.A.3 tailgating
               2.2.A.6 card cloning
               2.4.C.3 detecting piggybacking from door-held-open times
03 CIPHER      preview of 5.3, no prerequisites
04 PERIMETER   3.1.B network vulnerabilities
               3.3.B why segmentation increases security
               3.4.B.2 / 3.4.D.3 ACL rules are checked in order, first match wins
05 DETECTION   3.5.A log sources and automated detection
               3.5.C.2 anomaly-based detection against a baseline
               2.1.C.7 evading detection by editing logs
FINALE         2.1.B.3 the insider adversary
               2.1.C the six attack phases, end to end
```

The findings also walk Unit 2.1.C in order, which is worth drawing on the board:
reconnaissance (he worked here), initial access (02 and 01), persistence (03, the desk
nobody turned off), lateral movement (04), taking action (05, the cascade), evading
detection (05, the rotated log lines).

## Run of show

| Time | What you do |
| --- | --- |
| 0:00 | Open the URL on each laptop. The boot sequence plays itself. Do not explain the plot. |
| 0:02 | Say two things and stop talking: "type help" and "hints are free". |
| 0:07 | Everyone should be through finding 01. If a team has not run `headers 3`, tell them to. |
| 0:10 | Findings 02, 03 and 04 all open at once. Say so out loud. |
| 0:30 | Any team below 3 findings: tell them to spend hints. A stuck team is learning nothing. |
| 0:38 | Finishers run `abort`, then `roster`, then `accuse`. The shift report is your handout. |
| 0:45 | Whole-room debrief. |

Between periods: `reset --confirm` on each machine, then reload.

## Gating

```
01 -> [ 02  03  04 ] -> 05 -> abort -> accuse
```

## Answer key

| # | Codename | Answer | Also accepted |
| - | --- | --- | --- |
| 01 | INGRESS | `meridian-grid.net` | |
| 02 | PREMISES | `D-14` | `loading dock` |
| 03 | CIPHER | `WREN-4417` | `WREN4417` |
| 04 | PERIMETER | `10.20.4.31:23` | `relay-ctrl-02:23` |
| 05 | DETECTION | `10.40.7.19` | `wks-40719` |
| — | ATTRIBUTION | `m.tso` | `marcus tso`, `tso` |

Extra spaces and wrong capitalisation are accepted everywhere. Nothing is
case-sensitive.

## Per finding

### 01 INGRESS, about 7 minutes

`mail` lists five. `mail 3` reads the phish. `headers 3` shows the plumbing.

**Wrong turns:** the real domain `meridiangrid.net`; the display name; never running
`headers`.

**Debrief:** Three things gave this away: the hyphen in the domain, the SPF fail, and a
delivery chain that starts on a desk inside the building. Which would a tired engineer
notice at 23:31? Which should the gateway have caught with nobody looking?

### 02 PREMISES, about 9 minutes

`badge`. Every door hold is 3 to 8 seconds except one at 47.

**Wrong turns:** reading the HOLDER column and accusing j.pell, who went home at 17:30 —
this near-miss is designed in, and it is the best teaching moment in the finding;
submitting the time or the person instead of the door.

**Debrief:** The badge system recorded this correctly, in real time, at 23:04. It just
was not wired to anything that would notice. What is the difference between a system
that logs an attack and one that detects it?

### 03 CIPHER, about 8 minutes

`cat /var/evidence/note.txt`, then `caesar --crack --file /var/evidence/note.txt`. The
shift is 7, but nobody needs to know that.

**Wrong turns:** working the shift out by hand; submitting the passphrase or the day
instead of the account code; not finding the file (point them at `tree /var`).

**Debrief:** 25 possible keys, so `--crack` wins instantly. Ask how many keys would be
enough, then tell them a real key today is a number with about 77 digits. Note also
that the digits came through untouched: the cipher hid the letters and leaked the shape.

### 04 PERIMETER, about 10 minutes

`scan 10.20.4.0/24` and `fw`.

**Wrong turns:** naming 502/modbus, which is unencrypted but belongs there and is worth
two minutes of argument; host without port; missing that RULE 20 sits above RULE 30.

**Debrief:** Nobody wrote a bad rule. RULE 30 is a good rule in the wrong position, and
a rule set with dead code reads exactly like a correct one. How would you catch that in
a review?

### 05 DETECTION, about 8 minutes

`log baseline` and `log relay`, side by side.

**Wrong turns:** reading the relay log without the baseline; naming 10.99.1.20, the
normal source, because it appears most often; submitting the time.

**Debrief:** Three systems recorded this attack correctly while it was happening. None
raised an alert. What turns a log into detection?

### Attribution

`abort`, then `roster`, then `accuse m.tso`.

The chain:

1. Finding 01: the phish was relayed from 10.40.7.19.
2. Finding 02: somebody entered on a cloned badge, and m.tso has no badge.
3. Finding 03: "the old desk still works, nobody turned it off".
4. Finding 04: RULE 20 was raised from 10.40.7.19 and permits its subnet into OT.
5. Finding 05: the relay session came from 10.40.7.19.
6. `roster`: wks-40719 is 10.40.7.19, assigned to m.tso, contract ended 29 August.

Wrong accusations return the evidence that clears that person. Jamie Pell gets the
17:30 badge-out, Rhea Vance gets the forged timestamp, Dele Okonkwo gets the phish.

**Debrief:** He is the insider adversary from 2.1.B.3: access that was legitimate and
was never revoked. His badge was switched off the day his contract ended, because
badges have an owner who does that. His account, his workstation and his firewall rule
were not, because they belong to two other teams and there is no list. Have them read
`cat /var/policy/offboarding.txt`.

## Closing question for the room

Nothing here was a break-in. Every control that failed was switched off, ordered wrong,
or left running by somebody with a reason at the time and no ticket to undo it later.

So: which of tonight's five failures was actually a technology problem, and which were
organisational problems wearing a technology costume?

## If something goes wrong

- A puzzle looks broken: run `npm test`. Every finding is solved end to end in the suite.
- A team is stuck and out of hints: give them the answer and move them on. The debrief
  is where the learning is, and a team that never reaches finding 04 misses the best
  conversation in the activity.
- Someone says they found the answers in DevTools: they did not, but ask them to show
  you. It is a good five minutes about where trust boundaries actually live.
