import type { FirewallRule, ScanHost } from './types';

/**
 * Lock 04. Unit 3.3 (segmentation) and 3.4 (ACLs, first-match rule order).
 *
 * Six OT hosts. Most open ports are legitimate for a control network: modbus
 * on 502 is unencrypted but it is the control protocol and it belongs there.
 * Exactly one controller answers on telnet, and exactly one ACL rule lets the
 * corporate floor reach it before the deny that was supposed to stop it.
 */
export const OT_SUBNET = '10.20.4.0/24';

export const SCAN_HOSTS: readonly ScanHost[] = [
  {
    ip: '10.20.4.10',
    hostname: 'historian-01',
    ports: [
      { port: 22, service: 'ssh', state: 'open' },
      { port: 5432, service: 'postgresql', state: 'open' },
    ],
  },
  {
    ip: '10.20.4.20',
    hostname: 'hmi-console-a',
    ports: [
      { port: 443, service: 'https', state: 'open' },
      { port: 3389, service: 'ms-wbt-server', state: 'filtered' },
    ],
  },
  {
    ip: '10.20.4.30',
    hostname: 'relay-ctrl-01',
    ports: [
      { port: 502, service: 'modbus', state: 'open', note: 'control protocol, expected' },
      { port: 44818, service: 'ethernet-ip', state: 'open' },
    ],
  },
  {
    ip: '10.20.4.31',
    hostname: 'relay-ctrl-02',
    ports: [
      {
        port: 23,
        service: 'telnet',
        state: 'open',
        note: 'banner: Arbiter RTU-3000 fw 4.1.2 -- login:',
      },
      { port: 502, service: 'modbus', state: 'open', note: 'control protocol, expected' },
      { port: 44818, service: 'ethernet-ip', state: 'open' },
    ],
  },
  {
    ip: '10.20.4.40',
    hostname: 'breaker-gw',
    ports: [
      { port: 502, service: 'modbus', state: 'open', note: 'control protocol, expected' },
      { port: 161, service: 'snmp', state: 'open' },
    ],
  },
  {
    ip: '10.20.4.99',
    hostname: 'ot-jump',
    ports: [
      { port: 22, service: 'ssh', state: 'open' },
      { port: 23, service: 'telnet', state: 'closed' },
    ],
  },
];

/**
 * Written in the form the CED uses in Unit 3.4: action, direction, protocol,
 * port, source. Evaluated top to bottom, first match wins (3.4.B.2), which is
 * the entire lock.
 */
export const FIREWALL_RULES: readonly FirewallRule[] = [
  {
    id: 'RULE 10',
    action: 'ALLOW',
    direction: 'inbound',
    protocol: 'TCP',
    port: '22',
    source: '10.99.1.0/24',
    comment: 'DMZ jump host to OT jump host. Reviewed 2025-11.',
  },
  {
    id: 'RULE 20',
    action: 'ALLOW',
    direction: 'inbound',
    protocol: 'TCP',
    port: 'ALL',
    source: '10.40.7.0/24',
    comment: 'TEMP: contractor imaging. CHG-4417. Expires 2025-12-01.',
  },
  {
    id: 'RULE 30',
    action: 'DENY',
    direction: 'inbound',
    protocol: 'TCP',
    port: 'ALL',
    source: '10.40.0.0/16',
    comment: 'Corporate must not reach OT. Policy OT-SEG-1.',
  },
  {
    id: 'RULE 40',
    action: 'ALLOW',
    direction: 'outbound',
    protocol: 'TCP',
    port: '5432',
    source: '10.20.4.10/32',
    comment: 'Historian replication to the DMZ replica.',
  },
  {
    id: 'RULE 50',
    action: 'DENY',
    direction: 'inbound',
    protocol: 'ALL',
    port: 'ALL',
    source: 'ALL',
    comment: 'Implicit deny.',
  },
];

export const SUBNET_LEGEND: readonly string[] = [
  '10.40.0.0/16   corporate         desks, email, helpdesk, printers',
  '  10.40.7.0/24 corporate floor 4 contractor and helpdesk workstations',
  '10.99.1.0/24   screened subnet   vendor jump host, historian replica',
  '10.20.4.0/24   OT / control      relay controllers, breakers, telemetry',
];

export const CHANGE_TICKET: readonly string[] = [
  'CHG-4417  Contractor imaging access',
  '  requested-by : m.tso              from : 10.40.7.19 (wks-40719)',
  '  created      : 2025-11-04 16:48',
  '  approved-by  : r.vance            at   : 2025-11-04 16:34',
  '  stated scope : imaging VLAN only, expires 2025-12-01',
  '  implemented  : RULE 20  ALLOW inbound TCP ALL from 10.40.7.0/24',
  '  status       : still active. expiry was a comment, nothing enforces it.',
  '',
  '  note: the approval timestamp is 14 minutes before the ticket was created.',
  '        r.vance has no delegation for OT paths and did not approve this.',
];
