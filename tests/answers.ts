/**
 * Every answer string. Shared by the leak tests so a new finding is added in
 * one place. Tests are never bundled or deployed, so listing them is safe.
 */
export const ANSWERS = [
  'meridian-grid.net',
  'D-14',
  'WREN-4417',
  '10.20.4.31:23',
  '10.40.7.19',
  'm.tso',
] as const;
