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

- `src/index.js` exports a default `fetch` handler: a `/debug` endpoint that reports
  `request.cf.colo`/`country` (useful for confirming the Worker isn't executing in a region
  Binance blocks), and the actual relay for `/ws/<symbol>@ticker` requests.
- It opens an outbound WebSocket to Binance (`fetch()` with an `Upgrade` header, the
  Workers-specific pattern for a client-side WebSocket connection), then pipes messages both
  directions between that and the browser-facing socket.
- Only `<symbol>@ticker` paths are accepted (`STREAM_PATTERN` in `src/index.js`), not an
  arbitrary upstream path, so this can't be used as an open relay to other WebSocket endpoints.

**This is a plain Worker, not a Durable Object.** An earlier version used a Durable Object
(`BinanceRelay`, spun up fresh per connection via `newUniqueId()`), on the theory that a plain
Worker couldn't hold a connection open past the initial request. That theory came from a
dev-mode test that looked like a 1-2s connection drop-and-loop, but was actually React
StrictMode double-invoking effects client-side (mimics a rapid disconnect+reconnect), which
exposed a real race condition in `binanceSocket.ts`, not a limitation of plain Workers. Once
that client bug was fixed, a plain Worker held connections stably through both a 30-second
single-connection test and a rapid multi-pair-switch test, with zero drops. Durable Objects also
carry a separate free-tier duration quota (distinct from the Workers request quota) that a plain
Worker doesn't, so there's no upside left to paying that complexity/cost here.
