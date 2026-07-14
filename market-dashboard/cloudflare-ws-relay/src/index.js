// Relays a single Binance ticker WebSocket stream to the browser. Exists
// because Binance's WebSocket endpoint is unreachable (DNS/network-level
// block) on some ISPs, the same restriction that affected the REST calls
// before those were proxied through a Vercel serverless function. Vercel's
// serverless/edge functions can't hold a persistent upstream WebSocket
// connection reliably, but Cloudflare Workers can.
//
// Plain Worker fetch handler, not a Durable Object. A Durable Object was
// tried first, on the assumption that a plain Worker couldn't hold a
// connection open past the initial request -- that assumption came from a
// dev-mode test (React StrictMode double-invokes effects, which mimics a
// rapid disconnect+reconnect) rather than a real limitation, and the actual
// bug turned out to be a client-side race condition in binanceSocket.ts
// (see its comments). Durable Objects also carry a separate free-tier
// duration quota that a plain Worker doesn't, so once the real bug was
// fixed client-side, there was no remaining reason to pay that cost.
//
// Only accepts <symbol>@ticker streams (matching what the app subscribes
// to), not an arbitrary upstream URL, so this can't be abused as an open
// relay to arbitrary WebSocket endpoints.
const STREAM_PATTERN = /^[a-z0-9]+@ticker$/;

export default {
  async fetch(request) {
    const url = new URL(request.url);

    // Lets us confirm which Cloudflare colo/country this Worker executed in
    // (Binance returns 451 to US-origin traffic, same issue we hit pinning
    // Vercel function regions).
    if (url.pathname === '/debug') {
      return new Response(JSON.stringify({ colo: request.cf?.colo, country: request.cf?.country }), {
        headers: { 'content-type': 'application/json' },
      });
    }

    if (request.headers.get('Upgrade') !== 'websocket') {
      return new Response('Expected a websocket request', { status: 426 });
    }

    const streamPath = url.pathname.replace(/^\/ws\//, '');
    if (streamPath === url.pathname || !STREAM_PATTERN.test(streamPath)) {
      return new Response('Not found', { status: 404 });
    }

    const upstreamResponse = await fetch(`https://stream.binance.com:9443/ws/${streamPath}`, {
      headers: { Upgrade: 'websocket' },
    });
    const upstreamSocket = upstreamResponse.webSocket;
    if (!upstreamSocket) {
      return new Response('Upstream WebSocket connection failed', { status: 502 });
    }
    upstreamSocket.accept();

    const [client, server] = Object.values(new WebSocketPair());
    server.accept();

    upstreamSocket.addEventListener('message', (event) => {
      server.send(event.data);
    });
    upstreamSocket.addEventListener('close', (event) => {
      server.close(event.code, event.reason);
    });
    upstreamSocket.addEventListener('error', () => {
      server.close(1011, 'Upstream error');
    });

    server.addEventListener('message', (event) => {
      if (upstreamSocket.readyState === WebSocket.READY_STATE_OPEN) {
        upstreamSocket.send(event.data);
      }
    });
    server.addEventListener('close', (event) => {
      upstreamSocket.close(event.code, event.reason);
    });

    return new Response(null, { status: 101, webSocket: client });
  },
};
