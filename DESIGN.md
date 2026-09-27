# DESIGN.md: Protocol Nightjar

Visual and interaction design. Content design for the puzzles lives in `LOCKS.md`.

## Design thesis

The screen is a 1980s utility SCADA console that has been kept alive about fifteen years
too long. Amber phosphor, fixed-width everything, no branding anywhere.

It is deliberately not hacker green on black. Amber reads as industrial control rather
than Hollywood cybercrime, and it is the more legible of the two on the kind of projector
a classroom actually has.

Three rules:

1. **Everything is text.** If a feature needs a button, redesign the feature.
2. **The chrome never moves.** No animation that isn't either the cursor, the
   typewriter reveal, or a deliberate story beat. Motion is a signal, not decoration.
3. **The effect layer is optional.** Scanlines, glow, and flicker are one toggle away
   from off, and default off for `prefers-reduced-motion`.

## Color

One dark theme, not switchable. The fiction is one machine and machines do not have a
light mode.

| Token             | Value     | Use                                            |
| ----------------- | --------- | ---------------------------------------------- |
| `--bg`            | `#0b0906` | Terminal background (warm near-black, not #000) |
| `--bg-raised`     | `#151009` | Inline panels, table fills                      |
| `--fg`            | `#ffb648` | Primary amber text                             |
| `--fg-dim`        | `#a8722a` | Prompts, metadata, timestamps                  |
| `--fg-faint`      | `#5c4116` | Rules, box drawing, disabled                   |
| `--accent-cyan`   | `#5fd3f3` | NIGHTJAR voice, finding beats, the report      |
| `--accent-green`  | `#6ee787` | Success, `FINDING ACCEPTED`                     |
| `--accent-red`    | `#ff6b5e` | Denials, alerts, the countdown under 10 min    |
| `--accent-violet` | `#c39bff` | Hints                                          |

Contrast: `--fg` on `--bg` is ≈ 9.8:1. `--fg-dim` ≈ 4.7:1. `--fg-faint` is decorative
only and never carries meaning alone.

## Type

One family: `ui-monospace, "Cascadia Code", "JetBrains Mono", Menlo, Consolas, monospace`.
No webfont. A font request that fails would break the illusion mid-boot, on the one
network least likely to allow it.

- Base `15px` / `1.55`. Min `13px` at ≤1024px width.
- The output column is capped at `96ch` so ASCII tables and box drawing never reflow.
- `font-variant-ligatures: none`, because `!=` has to look like `!=` when a puzzle is
  about exact characters.

## Layout

```
┌──────────────────────────────────────────────────────────────────┐
│ STATUSBAR  MERIDIAN GRID · OT CONSOLE · FINDINGS 3/5 · CASCADE ARMED · T-24:08│  fixed, 1 line
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  scrollback (the only scrolling region, auto-sticks to bottom)   │
│                                                                  │
├──────────────────────────────────────────────────────────────────┤
│ soc-night@meridian-ot:/home/soc$ ▍                               │  fixed
└──────────────────────────────────────────────────────────────────┘
```

Full viewport, no page scroll. The status bar turns red inside T-10:00.

## Interaction

| Input             | Behavior                                                        |
| ----------------- | --------------------------------------------------------------- |
| `Enter`           | Run. Blank line echoes a bare prompt, like a real shell.          |
| `↑` / `↓`         | History. Survives `clear`; persisted with progress.               |
| `Tab`             | Complete command, then path/argument. Ambiguous → list matches.   |
| `Ctrl+L`          | `clear`, when the browser allows it. `clear` always works.        |
| `Ctrl+C`          | Abandon the current line, echo `^C`                               |
| Click anywhere    | Focus the input. The whole page is the prompt.                    |

**Typewriter reveal.** Ordinary command output prints instantly, because waiting for a
`cat` to finish typing is infuriating. So does the launch sequence, the banner and the
directions. Only the story voice types: NIGHTJAR, the finding beats and the ending, at
roughly 2,250 characters a second, which puts the whole opening message under a second.
Any keypress skips to the end, and it is instant under `prefers-reduced-motion`.

Typing only ever re-renders the one line being typed. The committed scrollback is a
separately memoized component, because re-rendering several hundred lines sixty times a
second is what makes a terminal toy feel slow after twenty minutes of play.

## Opening sequence

The first ten seconds have a job: establish that this is a machine, say what the
machine wants, and get out of the way.

```
C:\MERIDIAN\OT> meridian-grid.exe     the program starts
  loading ... ok                       five status lines
  MERIDIAN CONSOLE                     block-letter banner, decorative
  !! EMERGENCY MODE ENGAGED            red, three lines
  HOW THIS CONSOLE WORKS               the rules, stated once, completely
  >> unsigned message                  NIGHTJAR, cyan, typed
  Type help to begin
```

Everything above the message prints instantly. The banner is `decorative`, which means
`aria-hidden` and a tightened line-height so the strokes join; the subtitle underneath
says the same words, so nothing is lost to a screen reader.

The directions block is the only place the rules are written down, so it has to be
complete enough that a student who reads nothing else can still start.

## Output grammar

Consistent prefixes so students can skim:

```
$ command                 echoed input, --fg-dim
  plain output            --fg
[ ok ]  ...               --accent-green
[fail]  ...               --accent-red
[hint]  ...               --accent-violet
» NIGHTJAR                --accent-cyan, typed
── section ──             --fg-faint rule
```

Errors are shell-shaped and never scold: `cat: /etc/shadow: Permission denied` teaches
more than "Oops! Try again 🙂".

## Accessibility

This is the part most terminal toys skip. It is not optional for a classroom.

- The input is a **real focusable `<input>`**, not a contenteditable div or a keydown
  trap on `document`. Screen readers and IME work.
- Scrollback is `role="log" aria-live="polite"`; the newest block is announced once.
  Typewriter text is inserted into the live region only when complete, so a screen
  reader hears a sentence, not 40 characters.
- `prefers-reduced-motion`: no flicker, no scanline drift, no typewriter, no cursor blink.
- `effects off` command and a boot-time note that it exists. State persisted.
- Everything meaningful is real text: selectable, copyable, findable with Ctrl+F. No
  ASCII art carries information that is not also written out in words.
- Color never carries meaning alone; `[ ok ]` / `[fail]` labels do the work.
- Full keyboard operation is the only operation. There is nothing to click.

## CRT effect layer (off-switchable)

Three cheap, GPU-friendly layers, all `pointer-events: none`:

1. `repeating-linear-gradient` scanlines at 2px, ~6% opacity.
2. A radial vignette plus a 1px amber `text-shadow` bloom.
3. A 6-second `opacity` flicker on a `@keyframes`, amplitude under 2%, never strobing.
   **Nothing in this app flashes faster than 3Hz.** That is a photosensitivity limit and
   it is not negotiable for a room of thirty students.

## Facilitator view (`/facilitator`)

The only surface that is not a terminal, and it is deliberately plain HTML. A teacher
with four minutes before the bell should not have to fight an amber CRT. Light
background, printable, one block per lock: objective, answer, common wrong turns, the
three hints, expected minutes, and a debrief question.

It is gated behind `FACILITATOR_CODE`, because students can reach that URL too.

## What this must never become

- A neon-cyan "cyberpunk" template with glitch text and a Matrix rain background.
- A quiz with a text field labelled "Enter your answer:".
- An experience where the fastest path is guessing rather than reading.
