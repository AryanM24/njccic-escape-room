import { buildLlmsTxt } from '@/content/llms';

/**
 * The site's own address goes into the citation, so it is read from the
 * request. Behind a proxy the forwarded headers carry the public host.
 */
function originOf(request: Request): string {
  const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host');
  const proto = request.headers.get('x-forwarded-proto')?.split(',')[0]?.trim();
  if (host)
    return `${proto || new URL(request.url).protocol.replace(':', '')}://${host.split(',')[0].trim()}`;
  return new URL(request.url).origin;
}

export const dynamic = 'force-dynamic';

export function GET(request: Request): Response {
  return new Response(buildLlmsTxt(originOf(request)), {
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'public, max-age=3600',
    },
  });
}
