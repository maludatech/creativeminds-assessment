// Pinned away from US regions via `regions` in each function's config below:
// api.binance.com returns 451 (Unavailable For Legal Reasons) to US-origin
// requests, and Vercel otherwise routes to whichever region is nearest the
// visitor, which can land on a US region.
//
// Web-standard Request/Response signature, not the classic (req, res)
// Express-style one — Vercel's Node.js runtime (Fluid Compute) expects this
// form; (req, res) with res.status()/res.send() crashed with
// FUNCTION_INVOCATION_FAILED before the handler even ran.
export async function proxyBinance(binancePath: string): Promise<Response> {
  const upstream = await fetch(`https://api.binance.com/api/v3/${binancePath}`);
  return new Response(upstream.body, {
    status: upstream.status,
    headers: { 'content-type': upstream.headers.get('content-type') ?? 'application/json' },
  });
}
