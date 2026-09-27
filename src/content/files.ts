/**
 * Static text artifacts. Everything here is readable by the player, so nothing
 * here may state an answer.
 *
 * Voice: these are documents written by people at work. A shift briefing is
 * curt because the person writing it wanted to go home. Nothing in this file
 * should read like narration.
 */

export const BRIEFING_TXT = `SHIFT BRIEFING -- OVERNIGHT -- MERIDIAN GRID AUTHORITY

You are the only analyst on site from 22:00. Coffee is in the SOC, the good
kettle is broken again, do not use the one in Control Room B.

If the OT console goes into emergency mode:

  1. Do not power-cycle the relay controllers. Not once, not "just to see".
  2. The abort is behind OT-REC-1. You will have to file a finding for every
     subsystem the console flags before it will release the authorization.
     I know. I was on the committee and I lost that argument.
  3. Findings have to be right. The console checks them against the logs.
  4. Once it releases, run 'abort'. Then do attribution. In that order.

Commands worth knowing:

  locks            what the console is still waiting on
  unlock <id> <answer>
  hint <id>        three per finding, they are free, use them
  man <command>    what a command actually does

Page me if it is bad. My phone is off between 23:00 and 05:00 because of the
last three times it was not bad.

S. Bramble
OT Security Lead
`;

export const MOTD = `Meridian Grid Authority -- OT Operations Console
Unauthorized access is prohibited and logged.
System: meridian-ot  |  Build 4.2.9  |  Last patched: 2024-08-19
`;

/**
 * Lock 03. Caesar shift of 7. Non-letters pass through unchanged, which is
 * itself a teaching point: the cipher preserves the shape of the message, so
 * an account code still reads as four letters, a hyphen and four digits.
 *
 * Regenerate with scripts/caesar-note.mjs if the plaintext ever changes. The
 * solution-path test decodes this for real and will catch a mismatch.
 */
export const EVIDENCE_NOTE = `EVIDENCE ITEM 2026-0917-04
recovered 02:22 from the recycling bin outside the loading dock
scanned verbatim, handwriting, ballpoint, one side

KV UVA SLHCL AOPZ SFPUN HYVBUK HNHPU
AOL VSK KLZR ZAPSS DVYRZ UVIVKF ABYULK PA VMM
YLSHF JVUZVSL WHZZWOYHZL PZ UPNOAQHY DHRLZ HA KBZR
WHFTLUA JSLHYZ AV IBYULY HJJVBUA DYLU-4417 VU MYPKHF
DPWL AOL YLSHF SVN IBA SLHCL AOL IHKNL SVN HSVUL
KPMMLYLUA CLUKVY UVIVKF LCLY YLHKZ IVAO

[analyst note: not encrypted in any serious sense. every letter has been
 moved along the alphabet by the same amount. the numbers came through
 untouched, which is how you can tell.]
`;

export const EVIDENCE_LOG = `/var/evidence -- items collected this shift

2026-0917-01  door sensor export, all doors, this shift  (see: badge)
2026-0917-02  mail spool copy, d.okonkwo               (see: mail)
2026-0917-03  relay controller session log             (see: log relay)
2026-0917-04  handwritten note, recycling, loading dock -> note.txt

Chain of custody is a formality at 02:30 with one analyst on site. Write down
what you touched and when.
`;

export const VANCE_RESIGNATION = `draft -- do not send yet

Sana,

Eleven years, and six times in writing about segmentation. I still have the
emails. The corporate floor can reach the control network because somebody's
temporary rule outlived the contractor who asked for it, and every audit cycle
it comes back marked "risk accepted" by a person who has never stood in
Control Room B during a fault.

I am not doing a twelfth year of this.

Last day is the 30th. I will do the handover properly, which is more than I
was given.

One more thing while I am in Lisbon and cannot be talked out of saying it. When
somebody's contract ends here, three different people have to remember to turn
three different things off, and there is no list. Ask how many old accounts are
still live. Nobody knows. That is the answer.

-- Rhea
`;

export const OFFBOARDING_MEMO = `IT OPERATIONS -- OFFBOARDING CHECKLIST (rev 3)

When a worker leaves, the following must be completed within 24 hours:

  [ ] badge deactivated                    owner: Facilities
  [ ] network account disabled             owner: IT Helpdesk
  [ ] workstation collected and wiped      owner: IT Helpdesk
  [ ] VPN certificate revoked              owner: Network Ops
  [ ] firewall exceptions reviewed         owner: Network Ops

There is no automated check that any of these happened. There is no single
owner. Facilities does not receive contractor end dates from HR, and IT
Helpdesk does not receive them either unless the manager forwards the email.

This has been flagged in the last two audits as MEDIUM and accepted both times.
`;
