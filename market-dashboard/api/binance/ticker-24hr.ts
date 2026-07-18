// Pinned to fra1 — Binance 451s anything that looks US-origin, and Vercel
// defaults to whichever region is nearest the visitor.
//
// Named `GET` export, not default — a default export gets treated as the
// classic (req, res) signature and silently swallows our Response.
//
// No shared helper import on purpose: Vercel drops `_`-prefixed files from
// the bundle, which broke this in prod (worked locally, ERR_MODULE_NOT_FOUND
// on deploy) when it lived in api/_lib/.
export const config = { regions: ['fra1'] };

export async function GET(): Promise<Response> {
  const upstream = await fetch('https://api.binance.com/api/v3/ticker/24hr');
  const body = await upstream.text();
  return new Response(body, {
    status: upstream.status,
    headers: { 'content-type': upstream.headers.get('content-type') ?? 'application/json' },
  });
}
