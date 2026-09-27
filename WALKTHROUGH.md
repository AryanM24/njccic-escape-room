# WALKTHROUGH.md

**Full spoilers.** Every command, start to finish, in order.

Use this to smoke-test a deployment before class, or to bail out a team that has run
out of road. If you want the teaching material rather than the solution, read
[FACILITATOR.md](FACILITATOR.md) instead.

Start to finish this takes about four minutes if you already know the answers.

---

## Before you start

```bash
npm install
npm run dev
```

Open http://localhost:3000. The boot sequence plays on its own and NIGHTJAR's opening
types out. Press any key to skip the typing.

If you are replaying, run `reset --confirm` and reload first, or the console will say
"session restored" and skip the intro.

---

## Orientation (optional)

```
help
briefing
locks
```

`help` groups every command. `briefing` is Sana Bramble's shift note, which explains
OT-REC-1 in-fiction. `locks` shows all five findings and their state: FILED, SEALED
(workable now) or GATED (needs an earlier one).

At the start only finding 01 is SEALED. The other four are GATED.

---

## Finding 01 · INGRESS

**Answer: `meridian-grid.net`**

```
mail
```

Five messages. Four are ordinary: benefits, the telemetry change window, a printer
complaint, a vendor advisory. Message 3 is the phish.

```
mail 3
```

Reads well. Real signature block, a ticket number, a deadline two days out, and it
warns you it will ask for a password so that being asked feels normal. Nothing in the
body proves anything.

```
headers 3
```

Three tells, all in the plumbing:

- `Return-Path: <it-security@meridian-grid.net>` — the real domain is `meridiangrid.net`,
  with no hyphen.
- `Authentication-Results: spf=fail` — the sending machine was not authorised for that
  domain, and the gateway delivered it anyway because SPF is monitor-only.
- `Received: from wks-40719.corp.meridiangrid.net (10.40.7.19)` — the chain starts on a
  corporate workstation. The mail came from inside the building.

Keep `10.40.7.19` in mind. It comes back twice.

```
unlock 01 meridian-grid.net
```

Findings 02, 03 and 04 all unlock at once.

---

## Finding 02 · PREMISES

**Answer: `D-14`** (`loading dock` also accepted)

```
badge
```

Read the **HELD** column, not the HOLDER column. It is the number of seconds the door
sensor recorded the door standing open. Every row is 3 to 8 seconds except one:

```
23:04  Loading Dock  D-14  j.pell  in  47s
```

Two things are wrong with that single line:

1. **47 seconds.** A badge opens a door for one person and it shuts behind them. Forty-
   seven seconds is two people, or one person holding it open. That is tailgating, and
   the CED describes detecting it exactly this way.
2. **j.pell went home.** Three rows up: `17:30  Main Lobby  D-01  j.pell  out  6s`.
   Their card opened a door five and a half hours after they left, so the card that
   opened it was a copy.

The common wrong turn is reading HOLDER and accusing Jamie Pell. They are the first
victim, not the adversary.

```
unlock 02 D-14
```

---

## Finding 03 · CIPHER

**Answer: `WREN-4417`**

```
tree /var
cat /var/evidence/README
cat /var/evidence/note.txt
```

The note is a scan of something handwritten, pulled out of the recycling by the loading
dock. Every letter has been shifted along the alphabet. The digits came through
untouched, which is how you can tell it is a Caesar shift and not something serious:
`DYLU-4417` is obviously four letters, a hyphen and four digits.

You do not need to work out the shift. There are only 25 of them:

```
caesar --crack --file /var/evidence/note.txt
```

All 25 candidates print, most English-looking first. **Shift 7** is at the top:

```
DO NOT LEAVE THIS LYING AROUND AGAIN
THE OLD DESK STILL WORKS NOBODY TURNED IT OFF
RELAY CONSOLE PASSPHRASE IS NIGHTJAR WAKES AT DUSK
PAYMENT CLEARS TO BURNER ACCOUNT WREN-4417 ON FRIDAY
WIPE THE RELAY LOG BUT LEAVE THE BADGE LOG ALONE
DIFFERENT VENDOR NOBODY EVER READS BOTH
```

Note the file header and the analyst note become garbage at shift 7, because they were
already plain English. Exactly one block turns readable. That is the one.

If you want to see it the slow way: `caesar --shift -7 --file /var/evidence/note.txt`.

```
unlock 03 WREN-4417
```

---

## Finding 04 · PERIMETER

**Answer: `10.20.4.31:23`** (`relay-ctrl-02:23` also accepted)

```
scan 10.20.4.0/24
```

Six hosts. Most of the open ports belong on a control network — modbus on 502 is
unencrypted but it is the control protocol, and that is worth arguing about rather than
answering with. One host stands out:

```
10.20.4.31   relay-ctrl-02
       23/tcp  open  telnet   banner: Arbiter RTU-3000 fw 4.1.2 -- login:
```

Telnet sends the username and password across the wire as readable text. The other
relay controller, `relay-ctrl-01`, does not answer on 23.

```
fw
```

Read the ACL from the top, because the first rule that matches is the one that runs:

```
RULE 20   ALLOW  inbound  TCP  port ALL  from 10.40.7.0/24
RULE 30   DENY   inbound  TCP  port ALL  from 10.40.0.0/16
```

RULE 30 is the control that was supposed to keep corporate out of the control network.
It never executes, because traffic from `10.40.7.0/24` matches RULE 20 first. Nobody
wrote a bad rule here; somebody put a good rule in the wrong position, which looks
identical in a review.

`10.40.7.0/24` is the corporate floor, and `10.40.7.19` is the address from finding 01.

Optional, and good evidence for later:

```
ticket CHG-4417
```

Raised from 10.40.7.19 by m.tso, approved by r.vance fourteen minutes *before* the
ticket was created, which makes the approval a forgery.

```
unlock 04 10.20.4.31:23
```

---

## Finding 05 · DETECTION

**Answer: `10.40.7.19`** (`wks-40719` also accepted)

This one is gated behind the other three.

```
log baseline
```

Ninety days of recorded normal for relay-ctrl-02, taken before the incident:

- session sources: **10.99.1.20 only**
- session hours: **06:00 to 18:00**
- protocol: ssh/22

```
log relay
```

The first five entries fit the baseline perfectly: 10.99.1.20, business hours, ssh. Then:

```
01:52  10.40.7.19  telnet session opened (plaintext)
```

Wrong source, wrong hour, wrong protocol. That is the indicator of compromise, and it is
the same address from the mail headers in 01 and the firewall rule in 04.

The last line is worth reading out loud in the debrief:

```
02:11  --  [gap] 41 lines removed, not recoverable
```

That is the evading-detection phase of the attack, sitting in plain sight.

```
unlock 05 10.40.7.19
```

---

## Finale · Attribution

**Answer: `m.tso`** (`marcus tso`, `tso` also accepted)

```
abort
```

The cascade stops. NIGHTJAR signs off. The console then asks one more question, because
containment and attribution are different fields on the same form.

```
roster
```

```
m.tso       Marcus Tso      Helpdesk contractor (Arbiter Controls)
            wks-40719 (10.40.7.19)  badge REVOKED 2026-08-29  no longer employed
```

`wks-40719` is `10.40.7.19`. It sent the phish, it raised the firewall rule, and it
opened the telnet session. His badge was revoked a month ago, which is why he had to
come in on a copy of somebody else's.

```
accuse m.tso
```

The shift report prints. That is your debrief handout.

```
report
```

reprints it at any time afterwards.

---

## Wrong answers worth demonstrating

Each of these returns the specific evidence that clears the person, so they are useful
to show the class deliberately:

```
accuse j.pell      -> went home at 17:30, card was cloned
accuse r.vance     -> approval timestamped before the ticket existed
accuse d.okonkwo   -> phished at 23:31, in Control Room B all night
```

---

## Everything else worth typing

| Command | Why |
| --- | --- |
| `hint 03` | Three tiers per finding, free, self-serve |
| `status` | Findings filed, hints used, what is workable now |
| `locks 04` | The full objective for one finding |
| `man caesar` | Every `man` page explains the security idea, not just the flags |
| `cat /var/policy/offboarding.txt` | Five checkboxes, three teams, no list. The whole incident. |
| `cat /home/r.vance/resignation-draft.txt` | The red herring's motive, in her own words |
| `log relay \| grep 10.40` | Piping works; `grep` is case-insensitive |
| `effects off` | Kills scanlines, glow and flicker |
| `reset --confirm` | Wipes progress on this machine, for between periods |

---

## Fast path

For a deployment smoke test, paste these in order:

```
unlock 01 meridian-grid.net
unlock 02 D-14
unlock 03 WREN-4417
unlock 04 10.20.4.31:23
unlock 05 10.40.7.19
abort
accuse m.tso
```

If all seven land and the shift report prints, the deployment is good.
