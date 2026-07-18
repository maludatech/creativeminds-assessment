// Relays a Binance ticker stream to the browser — same DNS block as the
// REST calls, and Vercel can't hold a WebSocket open, so this lives on
// Cloudflare instead.
//
// Plain fetch handler, not a Durable Object. Went down that road first
// thinking a plain Worker couldn't keep a connection alive, but that was a
// dev-mode StrictMode artifact, not a real limit — the actual bug was a
// client-side race condition (see binanceSocket.ts). Durable Objects also
// eat into a separate free-tier quota for no benefit here, so back to plain.
//
// Only <symbol>@ticker streams are accepted, not an arbitrary upstream URL —
// don't want this turning into an open relay.
const STREAM_PATTERN = /^[a-z0-9]+@ticker$/;

export default {
  async fetch(request) {
    const url = new URL(request.url);

    // Quick way to check which colo/country this ran in — Binance 451s
    // US-origin traffic, same thing we hit pinning the Vercel functions.
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
