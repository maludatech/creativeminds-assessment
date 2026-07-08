// Pinned away from US regions: api.binance.com returns 451 (Unavailable For
// Legal Reasons) to US-origin requests, and Vercel's edge network will
// otherwise route to whichever region is nearest the visitor.
export const proxyConfig = { runtime: 'edge' as const, regions: ['fra1'] };

export async function proxyBinance(binancePath: string): Promise<Response> {
  const upstream = await fetch(`https://api.binance.com/api/v3/${binancePath}`);
  return new Response(upstream.body, {
    status: upstream.status,
    headers: { 'content-type': upstream.headers.get('content-type') ?? 'application/json' },
  });
}
