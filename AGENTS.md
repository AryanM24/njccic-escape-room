# AGENTS.md: working agreements

Read `PRODUCT.md`, `STORY.md`, `DESIGN.md`, and `LOCKS.md` before changing behavior.
`STORY.md` is canon: if a name, IP, or timestamp appears in two places, STORY.md wins.

## The scope rule, before anything else

This activity is for students who have finished **semester 1** of AP Cybersecurity,
which is **Units 1 to 3** of the CED. Hashing, salting, encryption, key exchange and
access control models are Units 4 and 5 and must not be required by any finding, not
even as an optional shortcut. Base64 and hex are not in the CED at all.

The Caesar cipher in finding 03 is the one documented exception, and it is labelled a
Unit 5.3 preview wherever it appears. Every other finding cites a CED topic in its
`ced` field, and a test checks that every finding has one.

If you are adding content, check it against LOCKS.md before anything else.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript strict · Tailwind v4 · Vitest.
No state library, no UI kit, no animation library. If a dependency is being added,
justify it in the PR body.

## Layout

```
src/
  app/
    page.tsx               shell; renders <Terminal>
    facilitator/page.tsx   teacher answer key (plain HTML, printable)
    api/unlock/route.ts    POST { lockId, answer } -> { correct, ... }
  components/              presentational only, no game rules
  lib/
    terminal/              parser, command registry, history, completion
    commands/              one file per command, each a `Command`
    tools/                 caesar (the only toolbelt tool) + sha256 for the server
    vfs.ts                 read-only virtual filesystem
    progress.ts            localStorage persistence (versioned)
  content/                 story, files, logs, hints. NEVER answers
  server/
    answer-keys.ts         'server-only'; salted SHA-256 digests
    rate-limit.ts          in-memory, per-client, per-lock
```

## Non-negotiables

1. **No plaintext answer may ever reach the client.** Not in `content/`, not in a
   comment, not in a test fixture imported by client code. `src/server/**` is
   `import 'server-only'` and validation is a route handler. There is a test that
   greps the client build for every answer string. It stays green.
2. **Commands are pure where possible.** A `Command` takes `(args, ctx)` and returns
   output blocks. It does not touch `window`, `fetch`, or `localStorage` directly; it
   goes through `ctx`. This is what makes them testable, and they are all tested.
3. **Content is data, not code.** Emails, logs, files, and hints are typed objects in
   `src/content/`. Adding a lock should not require touching the renderer.
4. **Accessibility rules in DESIGN.md are requirements.** Real `<input>`, `role="log"`,
   `prefers-reduced-motion` honored, no flash above 3Hz, color never the sole signal.
5. **No dead ends.** Every command a student plausibly types either works or returns a
   shell-shaped error that hints at the right command. `help` is always correct.

## Conventions

- Named exports. Default exports only where Next requires them (pages, routes).
- No `any`. No non-null `!` except immediately after a checked guard.
- Files under ~200 lines; a command file under ~80. Split before it sprawls.
- Comments explain *why*. The fiction is not a reason to be cryptic in source.
- Fictional strings only: RFC 5737 / RFC 1918 addresses, `.invalid`-safe made-up
  domains. Never a real person, real utility, or resolvable attacker domain.

## Tests

`npm test`. Required coverage:

- `caesar` round-trips at every shift and cracks in exactly 25 candidates;
- **every finding's intended solution path runs end to end in a test.** The test
  runs the actual commands, extracts the answer from the actual content, and asserts the
  digest matches. If a puzzle becomes unsolvable, CI fails, not a student;
- gating: a gated finding rejects a correct answer, an open one accepts it;
- no-plaintext-answers scan over all of `src/` except `src/server/`;
- a scan of the built client bundle, via `npm run verify:bundle`;
- content invariants: exactly one anomalous door hold, the permit above the deny.

## Before you say it works

`npm run check` = typecheck + lint + test + build. Run it. Paste the output.
Do not report a puzzle as playable without having solved it through the test harness.

## Adding a finding

1. Find the CED topic it teaches. If it is in Unit 4 or 5, stop.
2. Write the spec in `LOCKS.md`: concept, CED reference, artifact, wrong turns, hints.
3. Add the artifacts to `src/content/` and wire them into the VFS or a command.
4. Add the digest to `src/server/answer-keys.ts` via `npm run mint-answer`.
5. Add the answer, wrong turns and a debrief question to `src/server/facilitator-key.ts`.
6. Add the solution-path test. It must fail before step 3 and pass after.
7. Add the answer string to `tests/no-answer-leak.test.ts` and `scripts/verify-bundle.mjs`.
