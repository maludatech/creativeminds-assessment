# Market Dashboard

A real-time crypto market dashboard built with React, TypeScript, and Redux Toolkit. Fetches
the list of Binance trading pairs over REST, then streams live ticker updates over WebSocket
for whichever pair is selected.

## Running it

```bash
npm install
npm run dev
```

Open the printed local URL (defaults to `http://localhost:5173`).

> **Note on network access:** Binance's endpoints are blocked at the DNS level on some ISPs (this
> includes some West African networks, due to regulatory restrictions on crypto exchanges). This
> isn't a bug in the app, but it does affect two different code paths differently — see the
> trade-off below.

## Trade-off: REST goes through a same-origin proxy, WebSocket doesn't

REST calls (`fetchExchangeInfo`, `fetch24hrTickers`) are routed through a same-origin proxy
instead of calling `api.binance.com` directly from the browser:

- **Local dev** — `vite.config.ts` proxies `/api/binance/exchange-info` and `/api/binance/ticker-24hr`
  to the corresponding `api.binance.com/api/v3/*` endpoints.
- **Production (Vercel)** — `api/binance/exchange-info.ts` and `api/binance/ticker-24hr.ts` are two
  small Node.js Serverless Functions, each hardcoded to proxy exactly one upstream endpoint (via
  the shared `api/_lib/binanceProxy.ts` helper) rather than accepting an arbitrary path, so
  there's no way to abuse the deployment as an open proxy to the rest of Binance's API.
  (Two earlier attempts: a catch-all `api/binance/[...path].ts` route 404'd on Vercel's router for
  the two-segment `ticker/24hr` path before it ever reached the function; and pinning `regions` on
  the Edge runtime crashed with `FUNCTION_INVOCATION_FAILED`, since Vercel only honors per-function
  region pinning on the classic Node.js runtime, not Edge. Both are now Node functions.) They're
  pinned to `regions: ['fra1']` — Binance returns `451 Unavailable For Legal Reasons` to requests
  that appear to originate from the US, and Vercel otherwise routes to whichever region is nearest
  the visitor, which can land on a US region.

This means the **deployed version works for everyone**, including reviewers on a network that
blocks Binance, because the edge function runs on Vercel's infrastructure, not the reviewer's ISP.
**Local dev on a Binance-blocked network still needs a VPN or a different DNS resolver** — the
Vite proxy runs as a local Node process on your own machine, so it's subject to the same network
block as a direct browser request would be. Once deployed, the DNS-block problem only exists for
your own `npm run dev` session, not for anyone visiting the live URL.

The **WebSocket connection is not proxied** and stays a direct `wss://stream.binance.com` connection
from the browser, per the assessment brief ("connect to the Binance WebSocket API"). Proxying a
persistent WebSocket through Vercel's serverless/edge functions is unreliable within their
execution model, so on a Binance-blocked network, live ticker updates still require a VPN even
on the deployed version — only the initial trading-pair list is guaranteed to load everywhere.

## Architecture

```
src/
  app/store.ts              Redux store setup
  services/
    binanceApi.ts            Thin REST client (exchangeInfo, 24hr ticker)
    binanceSocket.ts          Single-connection WebSocket service class
  features/
    pairs/pairsSlice.ts       Trading pairs list: fetch, search, selection
    ticker/tickerSlice.ts     Live ticker state: connection status, latest price, history
  hooks/
    useSymbolTicker.ts        Bridges the WebSocket service into Redux for a given symbol
  components/
    PairList/                 Searchable trading pair list (loading/error/empty states)
    TickerPanel/               Live price, connection badge, recent update history
    ConnectionBadge/           Small status pill (Connecting/Connected/Disconnected/Reconnecting)
```

**Service layer separation.** `binanceApi.ts` and `binanceSocket.ts` know nothing about Redux —
they're plain functions/classes that could be swapped or unit-tested independently. Redux slices
own state; the `useSymbolTicker` hook is the only place that wires the socket service's
callbacks into `dispatch`.

**Single persistent socket, not one-per-symbol.** `BinanceSocketService` keeps exactly one
WebSocket open and reconnects to a new stream URL when the selected symbol changes, rather than
opening a new socket per pair. This avoids leaking connections if a user clicks through many
pairs quickly.

**Reconnection.** On an unexpected close, the service retries with exponential backoff (1s → 2s
→ 4s ... capped at 30s) and resubscribes to whatever symbol was last active. A manual
`disconnect()` (e.g. component unmount) is tracked separately so it doesn't trigger a
reconnect loop.

## State management

Redux Toolkit, as suggested by the brief. Two slices:

- **`pairs`** — REST-derived data: the trading pair list, search term, `status`
  (`idle/loading/succeeded/failed`) for loading/error UI, and the selected symbol (persisted to
  `localStorage` so a refresh keeps your selection).
- **`ticker`** — WebSocket-derived data: connection status and a capped rolling history (last 30
  updates) of the selected symbol's ticker stream. Kept separate from `pairs` because it has a
  different lifecycle — it resets every time the selected symbol changes, whereas the pair list
  is fetched once.

This two-slice split means a REST failure and a WebSocket disconnect are independent UI states —
you can have a healthy pair list with a dropped live connection, or vice versa, and the UI
reflects both accurately.

## Assumptions & trade-offs

- Trading pairs are limited to `TRADING`-status symbols that also have a 24hr ticker entry
  (some symbols in `exchangeInfo` have no matching ticker and are filtered out).
- The 24hr ticker stream (`@ticker`) was used over the raw trade stream (`@trade`) since it
  gives both price and percent change in one payload, matching what the pair list already shows.
- History is capped at 30 entries client-side rather than paginated/virtualized — sufficient for
  "recent updates" but wouldn't scale to an infinite scroll-back feature.
- No automated tests were added given the timeline; the WebSocket service and Redux slices are
  written as small, pure units specifically so they'd be straightforward to unit test if time
  allowed.
