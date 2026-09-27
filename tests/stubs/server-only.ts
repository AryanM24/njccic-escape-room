// `server-only` throws by design when imported outside a React Server
// Component. Vitest runs in plain Node, so it is aliased to this no-op —
// the guarantee it enforces (answers never reach the client) is verified
// directly by tests/no-answer-leak.test.ts instead.
export {};
