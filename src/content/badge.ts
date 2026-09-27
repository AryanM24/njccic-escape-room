import type { BadgeEvent, StaffRecord } from './types';

/**
 * Lock 02. Unit 2.4.C.3: "a sensor can record how long the door was open. In
 * reviewing entry logs for the door, potential piggybacking or tailgating can
 * be detected by doors being open for longer than normal lengths of time."
 *
 * Every row here is between 3 and 8 seconds except one, which is 47. That row
 * also uses a badge whose owner went home at 17:30, so it is a cloned card
 * (2.2.A.6) and a tailgated door (2.2.A.3) in the same line.
 */
export const BADGE_EVENTS: readonly BadgeEvent[] = [
  { time: '16:44', door: 'Main Lobby', doorId: 'D-01', holder: 'r.vance', direction: 'out', heldSeconds: 5 },
  { time: '17:12', door: 'Main Lobby', doorId: 'D-01', holder: 's.bramble', direction: 'in', heldSeconds: 4 },
  { time: '17:30', door: 'Main Lobby', doorId: 'D-01', holder: 'j.pell', direction: 'out', heldSeconds: 6 },
  { time: '18:05', door: 'Main Lobby', doorId: 'D-01', holder: 'd.okonkwo', direction: 'in', heldSeconds: 5 },
  { time: '18:09', door: 'Control Room B', doorId: 'D-22', holder: 'd.okonkwo', direction: 'in', heldSeconds: 4 },
  { time: '19:41', door: 'Control Room B', doorId: 'D-22', holder: 'd.okonkwo', direction: 'out', heldSeconds: 3 },
  { time: '20:16', door: 'Server Room', doorId: 'D-09', holder: 's.bramble', direction: 'in', heldSeconds: 7 },
  { time: '20:24', door: 'Server Room', doorId: 'D-09', holder: 's.bramble', direction: 'out', heldSeconds: 5 },
  { time: '22:50', door: 'Main Lobby', doorId: 'D-01', holder: 's.bramble', direction: 'out', heldSeconds: 6 },
  { time: '23:04', door: 'Loading Dock', doorId: 'D-14', holder: 'j.pell', direction: 'in', heldSeconds: 47 },
  { time: '23:19', door: 'Corporate Floor 4', doorId: 'D-31', holder: 'j.pell', direction: 'in', heldSeconds: 8 },
  { time: '01:38', door: 'Control Room B', doorId: 'D-22', holder: 'd.okonkwo', direction: 'in', heldSeconds: 4 },
  { time: '02:12', door: 'SOC', doorId: 'D-05', holder: 'soc-night', direction: 'in', heldSeconds: 5 },
];

export const BADGE_NOTES: readonly string[] = [
  'Arbiter BadgePoint v3. Separate vendor from the network logging stack.',
  'HELD is the number of seconds the door sensor recorded the door open.',
  'Alert threshold for door-held-open: NOT CONFIGURED.',
  'Daily exception report delivered to: helpdesk-reports@meridiangrid.net',
];

/**
 * The staff directory. Boring on its own, which is the point: it only becomes
 * evidence once a workstation address means something to you.
 */
export const STAFF: readonly StaffRecord[] = [
  {
    handle: 'd.okonkwo',
    name: 'Dele Okonkwo',
    role: 'SCADA Engineer II',
    workstation: 'wks-40204 (10.40.2.4)',
    badge: 'active',
    status: 'on shift, Control Room B',
  },
  {
    handle: 'r.vance',
    name: 'Rhea Vance',
    role: 'Senior Controls Engineer',
    workstation: 'wks-40188 (10.40.1.88)',
    badge: 'active',
    status: 'PTO until 09/30',
  },
  {
    handle: 's.bramble',
    name: 'Sana Bramble',
    role: 'OT Security Lead',
    workstation: 'wks-40151 (10.40.1.51)',
    badge: 'active',
    status: 'left site 22:50',
  },
  {
    handle: 'j.pell',
    name: 'Jamie Pell',
    role: 'Facilities Coordinator',
    workstation: 'wks-40362 (10.40.3.62)',
    badge: 'active',
    status: 'left site 17:30',
  },
  {
    handle: 'm.tso',
    name: 'Marcus Tso',
    role: 'Helpdesk contractor (Arbiter Controls)',
    workstation: 'wks-40719 (10.40.7.19)',
    badge: 'REVOKED 2026-08-29',
    status: 'no longer employed',
  },
  {
    handle: 'soc-night',
    name: '(you)',
    role: 'SOC Analyst, overnight',
    workstation: 'wks-40261 (10.40.2.61)',
    badge: 'active',
    status: 'on shift, SOC',
  },
];

export const STAFF_FOOTER: readonly string[] = [
  'Source: HR directory export, nightly. Workstation assignments are from the',
  'asset register and are not reconciled against what is actually powered on.',
];
