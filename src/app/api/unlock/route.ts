import { NextResponse } from 'next/server';

import { checkAnswer, isValidTarget, rejectionFor } from '@/server/answer-keys';
import { clearAttempts, takeAttempt, takeSharedAttempt } from '@/server/rate-limit';

export const runtime = 'nodejs';
/** Answers must never be prerendered or cached. */
export const dynamic = 'force-dynamic';

interface UnlockRequest {
  target?: unknown;
  answer?: unknown;
  browserId?: unknown;
}

/** Random per-browser id from the client. Anything that does not look like one is ignored. */
const BROWSER_ID = /^[A-Za-z0-9-]{16,64}$/;

export interface UnlockResponse {
  correct: boolean;
  message?: string;
  retryAfterSeconds?: number;
}

/**
 * Best-effort network address, for the roomy per-address ceiling. Not a
 * security boundary: it only has to stop a script from grinding the wordlist.
 */
function clientAddress(request: Request): string {
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

  // Behind a school network every student shares one address, so the tight
  // limit is per browser. A request without a valid id falls back to the address.
  const address = clientAddress(request);
  const browser =
    typeof body.browserId === 'string' && BROWSER_ID.test(body.browserId) ? body.browserId : '';
  const id = browser ? `${address}|${browser}` : address;
  const decision = takeAttempt(id, target);
  if (!takeSharedAttempt(address, target) || !decision.allowed) {
    return NextResponse.json(
      {
        correct: false,
        message: 'too many attempts on this lock. The console is throttling you.',
        retryAfterSeconds: decision.retryAfterSeconds || 20,
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
