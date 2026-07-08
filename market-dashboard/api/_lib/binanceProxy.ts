// Pinned away from US regions via `regions` in each function's config below:
// api.binance.com returns 451 (Unavailable For Legal Reasons) to US-origin
// requests, and Vercel otherwise routes to whichever region is nearest the
// visitor, which can land on a US region.
//
// Uses the classic Node.js Serverless Function (req, res) signature rather
// than the Edge runtime — Vercel only honors per-function region pinning on
// the Node runtime.
export async function proxyBinance(res: any, binancePath: string): Promise<void> {
  const upstream = await fetch(`https://api.binance.com/api/v3/${binancePath}`);
  const body = await upstream.text();
  res.status(upstream.status);
  res.setHeader('content-type', upstream.headers.get('content-type') ?? 'application/json');
  res.send(body);
}
