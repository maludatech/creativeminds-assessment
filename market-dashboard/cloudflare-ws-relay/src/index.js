// Relays a single Binance ticker WebSocket stream to the browser. Exists
// because Binance's WebSocket endpoint is unreachable (DNS/network-level
// block) on some ISPs, the same restriction that affected the REST calls
// before those were proxied through a Vercel serverless function. WebSocket
// can't be proxied the same way there (no persistent upstream connection on
// serverless/edge), but Cloudflare Workers support it, with a catch: a plain
// Worker `fetch` handler isn't guaranteed to keep the relay alive past the
// initial request (observed: connections dropped after ~1-2s, then
// reconnected, repeatedly). A Durable Object is Cloudflare's mechanism for
// an execution context that actually persists for the life of a connection.
//
// Only accepts <symbol>@ticker streams (matching what the app subscribes
// to), not an arbitrary upstream URL, so this can't be abused as an open
// relay to arbitrary WebSocket endpoints.
const STREAM_PATTERN = /^[a-z0-9]+@ticker$/;

export class BinanceRelay {
  async fetch(request) {
    const url = new URL(request.url);
    const streamPath = url.searchParams.get('stream');
    if (!streamPath || !STREAM_PATTERN.test(streamPath)) {
      return new Response('Bad stream', { status: 400 });
    }

    console.log(`[${streamPath}] connecting upstream`);
    const upstreamResponse = await fetch(`https://stream.binance.com:9443/ws/${streamPath}`, {
      headers: { Upgrade: 'websocket' },
    });
    const upstreamSocket = upstreamResponse.webSocket;
    if (!upstreamSocket) {
      console.log(`[${streamPath}] upstream did not upgrade, status=${upstreamResponse.status}`);
      return new Response('Upstream WebSocket connection failed', { status: 502 });
    }
    upstreamSocket.accept();
    console.log(`[${streamPath}] upstream accepted`);

    const [client, server] = Object.values(new WebSocketPair());
    server.accept();

    upstreamSocket.addEventListener('message', (event) => {
      server.send(event.data);
    });
    upstreamSocket.addEventListener('close', (event) => {
      console.log(`[${streamPath}] upstream closed code=${event.code} reason=${event.reason} clean=${event.wasClean}`);
      server.close(event.code, event.reason);
    });
    upstreamSocket.addEventListener('error', (event) => {
      console.log(`[${streamPath}] upstream error: ${event.message ?? event}`);
      server.close(1011, 'Upstream error');
    });

    server.addEventListener('message', (event) => {
      if (upstreamSocket.readyState === WebSocket.READY_STATE_OPEN) {
        upstreamSocket.send(event.data);
      }
    });
    server.addEventListener('close', (event) => {
      console.log(`[${streamPath}] client closed code=${event.code} reason=${event.reason} clean=${event.wasClean}`);
      upstreamSocket.close(event.code, event.reason);
    });

    return new Response(null, { status: 101, webSocket: client });
  }
}

export default {
  async fetch(request, env) {
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

    // Fresh Durable Object instance per connection, so each client gets its
    // own isolated, persistent relay rather than sharing one across everyone.
    const id = env.BINANCE_RELAY.newUniqueId();
    const stub = env.BINANCE_RELAY.get(id);

    const relayUrl = new URL(request.url);
    relayUrl.searchParams.set('stream', streamPath);
    return stub.fetch(new Request(relayUrl, request));
  },
};
