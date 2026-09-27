import type { LogSource } from './types';

/**
 * Lock 05. Unit 3.5.C.2: anomaly-based detection compares observed activity
 * against a baseline recorded on an uncompromised system.
 *
 * The baseline and the relay log are separate sources on purpose. Neither one
 * is damning alone. Read together, one session breaks both the source rule
 * and the time-of-day rule.
 */

export const BASELINE_LOG: LogSource = {
  name: 'baseline',
  description: 'Recorded normal activity for relay-ctrl-02, 90-day sample',
  header: 'PROPERTY              OBSERVED NORMAL',
  lines: [
    { time: '', text: 'sample window         2026-06-18 to 2026-09-16, no known incidents' },
    { time: '', text: 'session sources       10.99.1.20 only (ot-jump, via the screened subnet)' },
    { time: '', text: 'session hours         06:00 - 18:00, weekdays' },
    { time: '', text: 'sessions per day      2 to 6' },
    { time: '', text: 'session protocol      ssh/22' },
    { time: '', text: 'firmware writes       0 outside a change window' },
    { time: '', text: 'log rotations         nightly 04:00, automatic' },
    { time: '', text: '' },
    { time: '', text: 'note: a baseline is only meaningful if it was recorded while the' },
    { time: '', text: 'system was clean. This one predates the incident by a day.' },
  ],
};

export const RELAY_LOG: LogSource = {
  name: 'relay',
  description: 'Session and command log, relay-ctrl-02 (10.20.4.31)',
  header: 'TIME   SOURCE          EVENT',
  lines: [
    { time: '09:14', text: '09:14  10.99.1.20      ssh session opened (operator: d.okonkwo)' },
    { time: '09:52', text: '09:52  10.99.1.20      telemetry poll interval read' },
    { time: '11:03', text: '11:03  10.99.1.20      ssh session closed' },
    { time: '14:20', text: '14:20  10.99.1.20      ssh session opened (operator: r.vance)' },
    { time: '14:38', text: '14:38  10.99.1.20      ssh session closed' },
    { time: '01:52', text: '01:52  10.40.7.19      telnet session opened (plaintext)' },
    { time: '01:53', text: '01:53  10.40.7.19      login accepted: relay console passphrase' },
    { time: '02:03', text: '02:03  10.40.7.19      write /opt/relay/control/interlock.override' },
    { time: '02:06', text: '02:06  10.40.7.19      schedule armed: load-shed cascade @ 03:00' },
    { time: '02:07', text: '02:07  10.40.7.19      operator console lock engaged' },
    { time: '02:11', text: '02:11  10.40.7.19      log rotation triggered manually' },
    { time: '02:11', text: '02:11  --              [gap] 41 lines removed, not recoverable' },
  ],
};

export const LOG_SOURCES: readonly LogSource[] = [BASELINE_LOG, RELAY_LOG];
