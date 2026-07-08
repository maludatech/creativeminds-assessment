export const config = { runtime: 'edge' };

const ALLOWED_PATHS = new Set(['exchangeInfo', 'ticker/24hr']);

export default async function handler(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname.replace(/^\/api\/binance\//, '');

  if (!ALLOWED_PATHS.has(path)) {
    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { 'content-type': 'application/json' },
    });
  }

  const upstream = await fetch(`https://api.binance.com/api/v3/${path}`);
  return new Response(upstream.body, {
    status: upstream.status,
    headers: { 'content-type': upstream.headers.get('content-type') ?? 'application/json' },
  });
}
