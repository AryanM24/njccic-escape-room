/** Shell-ish tokenizer: whitespace separated, single and double quotes honored. */
export function tokenize(input: string): string[] {
  const tokens: string[] = [];
  let current = '';
  let quote: '"' | "'" | null = null;
  let started = false;

  for (const char of input) {
    if (quote) {
      if (char === quote) quote = null;
      else current += char;
      continue;
    }
    if (char === '"' || char === "'") {
      quote = char;
      started = true;
      continue;
    }
    if (/\s/.test(char)) {
      if (started || current) tokens.push(current);
      current = '';
      started = false;
      continue;
    }
    current += char;
  }
  if (started || current) tokens.push(current);
  return tokens;
}

export interface ParsedArgs {
  /** Positional arguments, in order. */
  positional: string[];
  /** `--key value` and `--flag` (true), plus short `-d` style flags. */
  flags: Record<string, string | true>;
}

/**
 * Splits tokens into positionals and flags.
 *
 * Only flags named in `valueFlags` consume the following token. Everything
 * else is boolean — otherwise `hash --sha1 hunter2` would read "hunter2" as
 * the value of --sha1 and hash nothing at all.
 */
export function parseArgs(
  tokens: readonly string[],
  valueFlags: readonly string[] = ['file', 'key', 'crib'],
): ParsedArgs {
  const positional: string[] = [];
  const flags: Record<string, string | true> = {};

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (token.startsWith('--') && token.length > 2) {
      const [key, inlineValue] = splitOnce(token.slice(2), '=');
      if (inlineValue !== undefined) {
        flags[key] = inlineValue;
        continue;
      }
      const next = tokens[i + 1];
      if (valueFlags.includes(key) && next !== undefined) {
        flags[key] = next;
        i++;
      } else {
        flags[key] = true;
      }
    } else if (/^-[A-Za-z]+$/.test(token)) {
      for (const short of token.slice(1)) flags[short] = true;
    } else {
      positional.push(token);
    }
  }
  return { positional, flags };
}

function splitOnce(value: string, separator: string): [string, string | undefined] {
  const index = value.indexOf(separator);
  if (index === -1) return [value, undefined];
  return [value.slice(0, index), value.slice(index + 1)];
}

export function flagString(
  flags: ParsedArgs['flags'],
  ...names: string[]
): string | undefined {
  for (const name of names) {
    const value = flags[name];
    if (typeof value === 'string') return value;
  }
  return undefined;
}

export function hasFlag(flags: ParsedArgs['flags'], ...names: string[]): boolean {
  return names.some((name) => name in flags);
}
