# LOCKS.md: the five findings

Content design for the five OT-REC-1 findings. **Answers are deliberately not here.**
They live in `FACILITATOR.md` for humans and as salted SHA-256 digests in
`src/server/answer-keys.ts` for the machine.

## The scope rule

Every finding has to be solvable by a student who has finished **semester 1** of AP
Cybersecurity. Working from the CED pacing (Unit 1 ~10 periods, Unit 2 ~21, Unit 3 ~26,
Unit 4 ~23, Unit 5 ~30, so 110 in total), the first half of the year is **Units 1 to 3**.

That rules out, and these are the ones that are tempting:

| Idea | Where it actually lives | Verdict |
| --- | --- | --- |
| Password hashing, salting | 4.2, 5.3 | out |
| Encryption, keys, key exchange | 5.3, 5.4 | out |
| Asymmetric crypto, signing | 5.4 | out |
| Access control models, least privilege | 5.2 | out |
| Base64 / hex / encoding | not in the CED at all | out |
| MFA and authentication design | 4.2 | out |

An earlier draft of this project had findings built on four of those six. They were good
puzzles and they were wrong for the audience, so they were cut rather than simplified.

**One deliberate exception: the Caesar cipher in finding 03.** It is not in the CED
either. It stays because it has no prerequisites at all beyond knowing the alphabet, it
is the single most requested thing in a cybersecurity escape room, and it sets up Unit
5.3 next semester by showing what a key space is and why 25 of them is not one. It is
labelled as a preview everywhere it appears, including on the facilitator sheet.

## The ladder

| # | Codename | CED | Idea | Tools | Target |
| - | --- | --- | --- | --- | --- |
| 01 | INGRESS | 1.1.A, 1.2.B, 3.1.A.3 | Social engineering, urgency, credential harvesting | `mail`, `headers` | 7 min |
| 02 | PREMISES | 2.2.A.3, 2.2.A.6, 2.4.C.3 | Tailgating, card cloning, door sensor data | `badge` | 9 min |
| 03 | CIPHER | preview of 5.3 | Substitution cipher, exhaustible key space | `caesar` | 8 min |
| 04 | PERIMETER | 3.1.B, 3.3.B, 3.4.B.2, 3.4.D.3 | Segmentation, ACLs, first-match rule order | `scan`, `fw` | 10 min |
| 05 | DETECTION | 3.5.A, 3.5.C.2, 2.1.C.7 | Baselines, anomaly detection, IoCs | `log` | 8 min |

Then **ATTRIBUTION**, which introduces no new technique. It is `roster` plus the four
places one address has already turned up, and it lands on Unit 2.1.B.3, the insider
adversary.

Forty-two minutes of target time against a 45-minute clock. That is deliberate: the
clock should feel tight and be beatable, and a team using hints freely still finishes.

## Gating

```
01 -> ┬-> 02 ┐
      ├-> 03 ├-> 05 -> ABORT -> ACCUSE
      └-> 04 ┘
```

Finding 01 is alone at the front because it teaches `mail` and `headers` and is the
gentlest thing in the game. Findings 02, 03 and 04 all open at once so a stuck team can
move sideways rather than stall. Finding 05 needs all three, because it is the
synthesis: the address it asks for has already appeared in two of them.

## The six attack phases

The findings follow Unit 2.1.C in order, which is worth pointing out in the debrief
because it lets students map a real incident onto the framework they were taught:

| Phase (2.1.C) | Where it shows up |
| --- | --- |
| Reconnaissance | He worked here. He did not need to do any. |
| Initial access | 02, walking in on a cloned badge; 01, phishing a password |
| Persistence | 03, "the old desk still works, nobody turned it off" |
| Lateral movement | 04, corporate floor into the control network |
| Taking action | 05, the cascade armed at 02:06 |
| Evading detection | 05, 41 log lines rotated out manually at 02:11 |

## Writing rules for this content

**A hint never lies and never points at the wrong artifact.** That is the worst possible
bug in this repository. A wrong hint costs a team ten minutes and costs you their trust
for the rest of the period.

**The beat is a finding, not a lecture.** The console records what happened and what it
cost, then stops. If a beat ends on an aphorism, cut the aphorism. The debrief questions
in `FACILITATOR.md` are where the teaching happens, out loud, with a human running it.

**Nothing may require a Unit 4 or 5 idea**, including as an optional shortcut. If a
finding can be solved faster by someone who already knows about hashing, it is
mis-scoped.

## Finding specs

### 01 · INGRESS

`mail` lists five messages. Four are ordinary: benefits, a change window notice, a
printer complaint, a vendor advisory. One is the phish. `mail 3` reads a body,
`headers 3` shows the Return-Path, the delivery chain and the SPF result.

The phish is written to be good. Correct signature block, plausible ticket number, a
deadline two days out rather than two minutes, and it warns the reader it will ask for a
password, which is the move that actually works on people. Every tell is in the
plumbing, and there are three of them, so a careful reader finds at least one.

**Answer:** the look-alike domain.
**Wrong turns:** the real domain; the display name; never running `headers`.
**Feeds forward:** the delivery chain starts on a corporate workstation whose address
turns up again in 04 and 05.

### 02 · PREMISES

`badge` prints every door event of the shift with a HELD column: the seconds the door
sensor recorded the door standing open. This is 2.4.C.3 almost verbatim.

Every row is between three and eight seconds except one, which is forty-seven. That same
row uses a badge whose owner went home at 17:30, so it is a cloned card (2.2.A.6) and a
tailgated door (2.2.A.3) in a single line. A student who reads only the HOLDER column
accuses the wrong person, which is the intended near-miss.

**Answer:** the door identifier.
**Wrong turns:** accusing the badge holder; submitting the time or the person.

### 03 · CIPHER

A note recovered from the recycling outside the loading dock, at
`/var/evidence/note.txt`, Caesar-shifted by 7. Digits and punctuation pass through
untouched, which is a teaching point in itself: the cipher preserves the shape of the
message, so a code with four letters and four digits still looks like one.

`caesar --crack` prints all 25 candidate decryptions ranked by how English they look.
The intended reaction is that this takes about four seconds.

**Answer:** the burner account named in the decrypted note.
**Wrong turns:** working the shift out by hand; submitting the passphrase instead.

### 04 · PERIMETER

`scan 10.20.4.0/24` returns six hosts. Most open ports are legitimate for a control
network: modbus on 502 is unencrypted but it is the control protocol and belongs there,
which is worth two minutes of argument. One controller answers on telnet.

`fw` prints the ACL in the CED's own format. RULE 20 permits the corporate floor into
the whole OT range; RULE 30 denies corporate into OT. RULE 30 never runs, because rules
are evaluated in order and the first match wins (3.4.B.2, 3.4.D.3). Nobody wrote a bad
rule. Somebody wrote a good rule in the wrong place.

**Answer:** `host:port` of the plaintext login service.
**Wrong turns:** naming 502/modbus; host without port; missing the rule order.

### 05 · DETECTION

Two sources that only mean something together. `log baseline` is 90 days of recorded
normal for the relay controller: one source address, business hours, a handful of
sessions a day. `log relay` is tonight.

One session breaks both rules at once. It is also the address from 01's mail headers and
04's firewall rule, which is why this finding is gated behind all three.

The log also ends with 41 lines rotated out manually, which is 2.1.C.7, the evading-
detection phase, sitting in plain sight.

**Answer:** the source address that is not in the baseline.
**Wrong turns:** reading the relay log without the baseline; naming the normal source.

### FINALE · ATTRIBUTION

`abort` releases the authorization and stops the cascade. OT-REC-1 then asks who,
because containment and attribution are different fields on the same form.

`roster` assigns the workstation to a contractor whose badge was revoked on 29 August and
whose account, desk and firewall rule were not. That is the insider adversary of
2.1.B.3, and the offboarding memo in `/var/policy` explains exactly how it happened.

A wrong accusation returns the evidence that clears that person, because being wrong
should still teach something.

## Anti-brute-force

- Answers are specific strings from a large space. No multiple choice anywhere.
- Server-side limit of 8 attempts per finding per minute, then a 20 second cool-down
  with an in-fiction message. Loose enough that a typo-prone team never notices, tight
  enough that guessing is not worth the trouble.
- Wrong answers never leak how close they were.

## Hint ladder

Three tiers, always the same shape:

1. **Nudge.** Points at the right artifact or the right column.
2. **Method.** Names the technique and the command.
3. **Nearly.** Leaves exactly one step. Never the literal string.
