import type { MailMessage } from './types';

/**
 * Lock 01. Four ordinary messages and one phish.
 *
 * The phish is written to be good, because a bad one teaches the wrong lesson.
 * No misspellings, no foreign prince, no all-caps urgency. It has a real
 * signature block, a plausible ticket number, a deadline two days out rather
 * than two minutes, and it tells the reader in advance that it will ask for a
 * password, which is the move that actually works on people.
 *
 * The tells are in the plumbing: a hyphenated look-alike domain, SPF fail, and
 * a Received chain that begins on a corporate workstation. A student who reads
 * only bodies will not find any of them.
 */
export const MAILBOX: readonly MailMessage[] = [
  {
    id: 1,
    from: 'benefits@meridiangrid.net',
    fromDisplay: 'Meridian Benefits',
    to: 'd.okonkwo@meridiangrid.net',
    subject: 'Open enrollment closes Friday',
    date: 'Tue 17 Sep 21:02',
    body: [
      'Open enrollment for the 2026 plan year closes Friday at 5pm.',
      'If you are keeping your current elections you do not need to do anything.',
      '',
      'Portal: https://benefits.meridiangrid.net/enroll',
      '',
      '-- People Operations',
    ],
    headers: [
      'Return-Path: <benefits@meridiangrid.net>',
      'Received: from mx01.meridiangrid.net (10.40.1.11) by mbox02.meridiangrid.net',
      'Authentication-Results: spf=pass dkim=pass dmarc=pass',
      'X-Originating-IP: 10.40.1.11',
    ],
  },
  {
    id: 2,
    from: 'noc@meridiangrid.net',
    fromDisplay: 'Meridian NOC',
    to: 'ot-staff@meridiangrid.net',
    subject: 'Telemetry window tonight 0100-0400, Sector 4',
    date: 'Tue 17 Sep 22:15',
    body: [
      'Collectors c4-01 through c4-06 restart between 0100 and 0400 tonight.',
      'Historian gaps in that window are expected. Do not raise them.',
      '',
      'Someone from OT engineering needs to be in Control Room B for the window.',
      'Dele has it.',
      '',
      'Change record CHG-4390. Approver: S. Bramble.',
      '',
      '-- Network Operations Center',
    ],
    headers: [
      'Return-Path: <noc@meridiangrid.net>',
      'Received: from mx02.meridiangrid.net (10.40.1.12) by mbox02.meridiangrid.net',
      'Authentication-Results: spf=pass dkim=pass dmarc=pass',
      'X-Originating-IP: 10.40.1.12',
    ],
  },
  {
    id: 3,
    from: 'it-security@meridian-grid.net',
    fromDisplay: 'Meridian IT Security',
    to: 'd.okonkwo@meridiangrid.net',
    subject: 'VPN certificate re-enrollment before Wednesday (INC-88214)',
    date: 'Tue 17 Sep 23:31',
    body: [
      'Dele,',
      '',
      'We are rotating VPN client certificates ahead of the quarterly audit.',
      'Yours is in the batch. Accounts that have not re-enrolled by Wednesday',
      'will lose remote access until helpdesk can re-issue, which this week is',
      'about a two day wait.',
      '',
      'Re-enrollment takes a minute:',
      '',
      '  https://vpn-portal.meridian-grid.net/reenroll?u=d.okonkwo',
      '',
      'It will ask for your network username and password to confirm identity',
      'before it issues the new certificate. That is expected.',
      '',
      'If you have already done this you can ignore this message.',
      '',
      'Thanks,',
      'Meridian IT Security Operations',
      'INC-88214  |  ext. 4417',
    ],
    headers: [
      'Return-Path: <it-security@meridian-grid.net>',
      'Received: from wks-40719.corp.meridiangrid.net (10.40.7.19)',
      '          by mx01.meridiangrid.net with SMTP',
      'Authentication-Results: spf=fail (domain of meridian-grid.net does not',
      '          designate 10.40.7.19 as permitted sender) dkim=none dmarc=fail',
      'X-Originating-IP: 10.40.7.19',
      'X-Mailer: swaks/20240301',
    ],
  },
  {
    id: 4,
    from: 'j.pell@meridiangrid.net',
    fromDisplay: 'Jamie Pell',
    to: 'helpdesk@meridiangrid.net',
    subject: 'Re: Re: Re: the printer on 3 again',
    date: 'Tue 17 Sep 23:58',
    body: [
      'It is still printing everything rotated ninety degrees.',
      'I have turned it off and on four times.',
      'Please.',
    ],
    headers: [
      'Return-Path: <j.pell@meridiangrid.net>',
      'Received: from mx01.meridiangrid.net (10.40.1.11) by mbox02.meridiangrid.net',
      'Authentication-Results: spf=pass dkim=pass dmarc=pass',
      'X-Originating-IP: 10.40.3.62',
    ],
  },
  {
    id: 5,
    from: 'advisories@arbiter-controls.example',
    fromDisplay: 'Arbiter Controls Advisories',
    to: 'ot-staff@meridiangrid.net',
    subject: 'ACSA-2026-011: legacy management service on RTU-3000 < 4.2.9',
    date: 'Wed 18 Sep 00:40',
    body: [
      'Arbiter Controls has published advisory ACSA-2026-011.',
      '',
      'Affected: RTU-3000 series on firmware earlier than 4.2.9. The legacy',
      'management service is enabled by default on these units and transmits',
      'credentials without encryption.',
      '',
      'Remediation: upgrade to 4.2.9, or disable the legacy service. We have',
      'been recommending the latter since 2021.',
      '',
      'Full text in the customer portal. This address is unmonitored.',
    ],
    headers: [
      'Return-Path: <advisories@arbiter-controls.example>',
      'Received: from mail.arbiter-controls.example (203.0.113.40)',
      '          by mx01.meridiangrid.net with ESMTPS',
      'Authentication-Results: spf=pass dkim=pass dmarc=pass',
      'X-Originating-IP: 203.0.113.40',
    ],
  },
];
