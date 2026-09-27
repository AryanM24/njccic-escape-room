import { NextResponse } from 'next/server';

import { checkAnswer, isValidTarget, rejectionFor } from '@/server/answer-keys';
import { clearAttempts, takeAttempt } from '@/server/rate-limit';

export const runtime = 'nodejs';
/** Answers must never be prerendered or cached. */
export const dynamic = 'force-dynamic';

interface UnlockRequest {
  target?: unknown;
  answer?: unknown;
}

export interface UnlockResponse {
  correct: boolean;
  message?: string;
  retryAfterSeconds?: number;
}

/**
 * Best-effort client identity for rate limiting. Not a security boundary —
 * it only has to stop one classroom laptop from grinding the wordlist.
 */
function clientId(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  return forwarded || request.headers.get('x-real-ip') || 'local';
}

export async function POST(request: Request): Promise<NextResponse<UnlockResponse>> {
  let body: UnlockRequest;
  try {
    body = (await request.json()) as UnlockRequest;
  } catch {
    return NextResponse.json({ correct: false, message: 'malformed request' }, { status: 400 });
  }

  const target = typeof body.target === 'string' ? body.target : '';
  const answer = typeof body.answer === 'string' ? body.answer : '';

  if (!isValidTarget(target)) {
    return NextResponse.json({ correct: false, message: 'unknown lock' }, { status: 400 });
  }
  if (answer.length === 0 || answer.length > 200) {
    return NextResponse.json({ correct: false, message: 'answer must be 1-200 characters' });
  }

  const id = clientId(request);
  const decision = takeAttempt(id, target);
  if (!decision.allowed) {
    return NextResponse.json(
      {
        correct: false,
        message: 'too many attempts on this lock. The console is throttling you.',
        retryAfterSeconds: decision.retryAfterSeconds,
      },
      { status: 429 },
    );
  }

  if (!checkAnswer(target, answer)) {
    return NextResponse.json({ correct: false, message: rejectionFor(target, answer) });
  }

  clearAttempts(id, target);
  return NextResponse.json({ correct: true });
}
