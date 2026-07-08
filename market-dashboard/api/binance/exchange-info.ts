// Pinned away from US regions: api.binance.com returns 451 (Unavailable For
// Legal Reasons) to US-origin requests, and Vercel otherwise routes to
// whichever region is nearest the visitor, which can land on a US region.
//
// Web-standard Request/Response signature, not the classic (req, res)
// Express-style one — Vercel's Node.js runtime (Fluid Compute) expects this
// form.
//
// Deliberately self-contained (no relative import of a shared helper):
// Vercel excludes `_`-prefixed files/folders under api/ from bundling, which
// broke a prior version that imported from `api/_lib/binanceProxy.ts` with
// ERR_MODULE_NOT_FOUND in production despite working locally.
export const config = { regions: ['fra1'] };

export default async function handler(): Promise<Response> {
  const upstream = await fetch('https://api.binance.com/api/v3/exchangeInfo');
  const body = await upstream.text();
  return new Response(body, {
    status: upstream.status,
    headers: { 'content-type': upstream.headers.get('content-type') ?? 'application/json' },
  });
}
