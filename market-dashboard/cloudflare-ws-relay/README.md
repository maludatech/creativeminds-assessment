# Binance WebSocket Relay

A small Cloudflare Worker that relays a single Binance ticker stream
(`wss://stream.binance.com:9443/ws/<symbol>@ticker`) to the browser. See the
"Trade-off" section in `../README.md` for why this exists: Binance's
WebSocket endpoint is blocked at the DNS level on some networks, and Vercel
(where the rest of `market-dashboard` is deployed) can't hold a persistent
upstream WebSocket connection reliably, but Cloudflare Workers can.

## Deploying

```bash
npm install
npx wrangler login   # one-time, opens a browser to authorize
npm run deploy
```

The deployed URL is `wss://creativeminds-binance-ws-relay.<your-subdomain>.workers.dev`.
`src/services/binanceSocket.ts` in the main app points at this URL directly, update it there
if you redeploy under a different subdomain.

## How it works

- `src/index.js` exports a default `fetch` handler (routing + a `/debug` endpoint that reports
  `request.cf.colo`/`country`, useful for confirming the Worker isn't executing in a region
  Binance blocks) and a `BinanceRelay` Durable Object class that does the actual relay.
- Each incoming WebSocket upgrade request gets a **fresh Durable Object instance**
  (`env.BINANCE_RELAY.newUniqueId()`), so every browser tab gets its own isolated relay rather
  than sharing one across all visitors.
- The Durable Object opens an outbound WebSocket to Binance (`fetch()` with an `Upgrade` header,
  the Workers-specific pattern for a client-side WebSocket connection), then pipes messages both
  directions between that and the browser-facing socket.
- Only `<symbol>@ticker` paths are accepted (`STREAM_PATTERN` in `src/index.js`), not an
  arbitrary upstream path, so this can't be used as an open relay to other WebSocket endpoints.

**Why a Durable Object and not a plain Worker:** the first version used a plain `fetch` handler
with no Durable Object. It worked initially, then dropped the connection after roughly 1-2
seconds and reconnected in a loop, every time, confirmed with a 30-second stability test before
and after the fix. A Durable Object is Cloudflare's mechanism for an execution context that
persists for the life of a connection rather than a single request/response, which is what a
relay actually needs.
