export const LOCK_IDS = ['01', '02', '03', '04', '05'] as const;
export type LockId = (typeof LOCK_IDS)[number];

export function isLockId(value: string): value is LockId {
  return (LOCK_IDS as readonly string[]).includes(value);
}

/** The finale is not a finding; it is the attribution field on the same form. */
export const FINALE_ID = 'accuse';

export interface LockDefinition {
  id: LockId;
  codename: string;
  /**
   * The AP Cybersecurity idea this finding exists to teach, with the CED
   * topic it comes from. Everything here must sit in Units 1-3, which is
   * what a semester 1 student has actually covered.
   */
  concept: string;
  /** CED topic reference, e.g. "2.4.C.3". Shown to the teacher, not the player. */
  ced: string;
  /** One line shown by `locks`, in the voice of the console. */
  brief: string;
  /** Where to start looking. The mission text, not a hint. */
  objective: string;
  /** Findings that must be filed first. */
  requires: LockId[];
  /** Released on acceptance. Five of these assemble the abort authorization. */
  fragment: string;
  /** Shape of the expected answer, e.g. "a door identifier". Never the answer. */
  answerFormat: string;
  /** Nudge -> method -> near-answer. Never the literal answer. */
  hints: readonly [string, string, string];
  /** Story beat printed on acceptance. */
  beat: readonly string[];
  /** No finding is case-sensitive any more, but the plumbing still supports it. */
  caseSensitive?: boolean;
}

export interface MailMessage {
  id: number;
  from: string;
  fromDisplay: string;
  to: string;
  subject: string;
  date: string;
  body: readonly string[];
  headers: readonly string[];
}

export interface ScanHost {
  ip: string;
  hostname: string;
  ports: readonly { port: number; service: string; state: string; note?: string }[];
}

/** An ACL rule in the form the CED uses in Unit 3.4. */
export interface FirewallRule {
  id: string;
  action: 'ALLOW' | 'DENY';
  direction: 'inbound' | 'outbound';
  protocol: string;
  port: string;
  source: string;
  comment: string;
}

/** A door event from the physical access control system (Unit 2.4). */
export interface BadgeEvent {
  time: string;
  door: string;
  doorId: string;
  holder: string;
  direction: 'in' | 'out';
  /** Seconds the door sensor recorded it open. The tell for lock 02. */
  heldSeconds: number;
}

export interface LogLine {
  time: string;
  text: string;
}

export interface LogSource {
  name: string;
  description: string;
  header: string;
  lines: readonly LogLine[];
}

export interface StaffRecord {
  handle: string;
  name: string;
  role: string;
  workstation: string;
  badge: string;
  status: string;
}
