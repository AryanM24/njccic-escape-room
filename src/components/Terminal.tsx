'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { runLine } from '@/lib/commands';
import { complete } from '@/lib/terminal/complete';
import { dim, plain } from '@/lib/terminal/output';
import type { CommandContext, GameState, OutputLine, UnlockOutcome } from '@/lib/terminal/types';
import { HOME } from '@/lib/vfs';
import { getBrowserId, initialState, loadState, saveState } from '@/lib/progress';
import { usePrefersReducedMotion } from '@/lib/hooks';
import {
  BANNER,
  BANNER_SUBTITLE,
  BOOT_SEQUENCE,
  DIRECTIONS,
  EMERGENCY_NOTICE,
  NIGHTJAR_OPENING,
  WELCOME_FOOTER,
} from '@/content/story';
import type { LockId } from '@/content/types';

import { StatusBar } from './StatusBar';
import { CrtLayers } from './CrtLayers';
import { OutputView } from './OutputView';

/**
 * ~2,200 characters a second at 60fps. Fast enough that a paragraph lands
 * almost at once and nobody sits waiting on the opening, slow enough that it
 * still reads as a machine printing rather than a page appearing.
 */
const CHARS_PER_TICK = 36;
const TICK_MS = 16;

const toLines = (
  source: readonly string[],
  tone: OutputLine['tone'],
  extra: { typed?: boolean; decorative?: boolean } = {},
): OutputLine[] => source.map((text) => ({ text, tone, ...extra }));

/**
 * Launching the console: the exe starts, the banner paints, the rules are
 * stated, and only then does NIGHTJAR speak. Everything up to the message
 * prints instantly; the message itself types.
 */
function openingSequence(): OutputLine[] {
  return [
    ...toLines(BOOT_SEQUENCE, 'dim'),
    ...toLines(BANNER, 'default', { decorative: true }),
    ...toLines(BANNER_SUBTITLE, 'dim'),
    ...toLines(EMERGENCY_NOTICE, 'alert'),
    ...toLines(DIRECTIONS, 'default'),
    ...toLines(NIGHTJAR_OPENING, 'story', { typed: true }),
    plain(''),
    ...toLines(WELCOME_FOOTER, 'dim'),
    plain(''),
  ];
}

const isTyped = (line: OutputLine): boolean => Boolean(line.typed) && line.text.length > 0;

/**
 * Splits output at the first line that needs typing. Everything before it can
 * be printed immediately; the rest waits in the queue. This is what keeps
 * ordinary command output instant while story beats still type out.
 */
function splitAtFirstTyped(lines: readonly OutputLine[]): [OutputLine[], OutputLine[]] {
  const index = lines.findIndex(isTyped);
  return index === -1 ? [[...lines], []] : [lines.slice(0, index), lines.slice(index)];
}

export function Terminal() {
  const [state, setState] = useState<GameState>(initialState);
  const [cwd, setCwd] = useState(HOME);
  const [committed, setCommitted] = useState<OutputLine[]>([]);
  const [queue, setQueue] = useState<OutputLine[]>([]);
  const [partial, setPartial] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [entered, setEntered] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number | null>(null);
  const [booted, setBooted] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  /**
   * Commands run one at a time, chained rather than dropped.
   *
   * `unlock` awaits the server, and a team typing the next command during that
   * round trip must not lose it. The chain preserves order; `stateRef` is what
   * lets a queued command see the state the one before it just changed,
   * without waiting for a React render.
   */
  const chain = useRef<Promise<void>>(Promise.resolve());
  const stateRef = useRef(state);

  const reducedMotion = usePrefersReducedMotion();
  const animate = !reducedMotion && state.effects;
  const prompt = `soc-night@meridian-ot:${cwd === HOME ? '~' : cwd}$ `;

  /**
   * Adds output. Untyped lines land immediately; typed ones queue up behind
   * anything already typing so ordering is never scrambled.
   */
  const emit = useCallback(
    (lines: readonly OutputLine[], canTypeNow: boolean) => {
      if (lines.length === 0) return;
      if (!canTypeNow) {
        setQueue((rest) => [...rest, ...lines]);
        return;
      }
      const [immediate, deferred] = splitAtFirstTyped(lines);
      if (immediate.length > 0) setCommitted((previous) => [...previous, ...immediate]);
      if (deferred.length > 0) setQueue(deferred);
    },
    [],
  );

  const emitNow = useCallback(
    (lines: readonly OutputLine[]) => {
      // Safe to print straight away only when nothing is mid-typewriter.
      emit(animate ? lines : lines.map((line) => ({ ...line, typed: false })), queue.length === 0);
    },
    [animate, emit, queue.length],
  );

  // ── boot ────────────────────────────────────────────────────────
  useEffect(() => {
    const restored = loadState();
    const resuming = restored.open.length > 0 || restored.aborted;
    const opening = resuming
      ? [
          plain('session restored.'),
          plain(`OT-REC-1 findings filed: ${restored.open.length}/5`),
          dim('`status` for where you are, `locks` for what is left.'),
          plain(''),
        ]
      : openingSequence();

    // Restoring saved progress is a one-shot read of an external store
    // (localStorage) that cannot be a lazy initializer without breaking SSR,
    // so these setState calls on mount are deliberate and do not cascade.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState(restored);
    setQueue(opening);
    setBooted(true);
  }, []);

  useEffect(() => {
    stateRef.current = state;
    if (booted) saveState(state);
  }, [state, booted]);

  // ── typewriter ──────────────────────────────────────────────────
  useEffect(() => {
    if (queue.length === 0) return;
    const next = queue[0];

    if (!isTyped(next) || !animate) {
      // Not an animation: print this line and everything after it up to the
      // next typed one, all from a timer callback rather than the effect body.
      const [immediate, deferred] = splitAtFirstTyped(queue.slice(1));
      const id = window.setTimeout(() => {
        setCommitted((previous) => [...previous, next, ...immediate]);
        setQueue(deferred);
      }, 0);
      return () => window.clearTimeout(id);
    }

    let cursor = 0;
    const id = window.setInterval(() => {
      cursor += CHARS_PER_TICK;
      if (cursor < next.text.length) {
        setPartial(next.text.slice(0, cursor));
        return;
      }
      window.clearInterval(id);
      const [immediate, deferred] = splitAtFirstTyped(queue.slice(1));
      setPartial(null);
      setCommitted((previous) => [...previous, next, ...immediate]);
      setQueue(deferred);
    }, TICK_MS);
    return () => window.clearInterval(id);
  }, [queue, animate]);

  // Stick to the bottom. Setting scrollTop beats scrollIntoView on a sentinel,
  // which lagged behind fast bursts of output.
  useEffect(() => {
    const scroller = scrollRef.current;
    if (scroller) scroller.scrollTop = scroller.scrollHeight;
  }, [committed, partial]);

  /** Any keypress finishes the pending story block instantly. */
  const skipTyping = useCallback(() => {
    if (queue.length === 0) return;
    setPartial(null);
    setCommitted((previous) => [...previous, ...queue]);
    setQueue([]);
  }, [queue]);

  // ── command execution ───────────────────────────────────────────
  const submit = useCallback(
    async (target: LockId | 'accuse', answer: string): Promise<UnlockOutcome> => {
      try {
        const response = await fetch('/api/unlock', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ target, answer, browserId: getBrowserId() }),
        });
        return (await response.json()) as UnlockOutcome;
      } catch {
        return { correct: false, message: 'console offline. the validator did not answer.' };
      }
    },
    [],
  );

  const run = useCallback(
    (line: string) => {
      chain.current = chain.current.then(async () => {
        const patches: Partial<GameState>[] = [];
        const ctx: CommandContext = {
          cwd,
          state: stateRef.current,
          setCwd,
          submit,
          patchState: (patch) => {
            patches.push(patch);
            // Applied to the ref immediately so the next queued command sees it.
            stateRef.current = { ...stateRef.current, ...patch };
          },
          clearScreen: () => {
            setCommitted([]);
            setQueue([]);
          },
        };

        const output = await runLine(line, ctx, prompt);
        if (patches.length > 0) setState(stateRef.current);
        emitNow(output);
      });
    },
    [cwd, emitNow, prompt, submit],
  );

  // ── keyboard ────────────────────────────────────────────────────
  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      skipTyping();
      const line = input;
      setInput('');
      setHistoryIndex(null);
      if (line.trim()) setEntered((previous) => [...previous, line]);
      run(line);
      return;
    }

    if (event.key === 'Tab') {
      event.preventDefault();
      const result = complete(input, cwd);
      setInput(result.value);
      if (result.candidates.length > 0) {
        emitNow([
          { text: `${prompt}${input}`, tone: 'input' },
          dim(result.candidates.join('   ')),
        ]);
      }
      return;
    }

    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      if (entered.length === 0) return;
      event.preventDefault();
      const current = historyIndex ?? entered.length;
      const next =
        event.key === 'ArrowUp' ? Math.max(0, current - 1) : Math.min(entered.length, current + 1);
      setHistoryIndex(next);
      setInput(next === entered.length ? '' : entered[next]);
      return;
    }

    if (event.ctrlKey && event.key === 'l') {
      event.preventDefault();
      setCommitted([]);
      setQueue([]);
      return;
    }

    if (event.ctrlKey && event.key === 'c') {
      event.preventDefault();
      emitNow([{ text: `${prompt}${input}^C`, tone: 'input' }]);
      setInput('');
      return;
    }

    skipTyping();
  };

  return (
    <div
      className={`term-shell${state.effects ? ' crt-on' : ''}`}
      onClick={() => inputRef.current?.focus()}
    >
      <StatusBar
        startedAt={state.startedAt}
        findings={state.open.length}
        team={state.team}
        aborted={state.aborted}
      />

      <div className="term-scroll" ref={scrollRef}>
        <OutputView lines={committed} partial={partial} />
      </div>

      <div className="term-prompt-row">
        <label className="term-prompt" htmlFor="term-input">
          {prompt}
        </label>
        <input
          id="term-input"
          ref={inputRef}
          className="term-input"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={onKeyDown}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          aria-label="terminal command input"
          autoFocus
        />
      </div>

      {state.effects ? <CrtLayers /> : null}
    </div>
  );
}
