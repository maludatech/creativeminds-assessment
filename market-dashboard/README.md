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

> **Note on network access:** Binance's API/WebSocket endpoints are blocked at the DNS level on
> some ISPs (this includes some West African networks, due to regulatory restrictions on crypto
> exchanges). If `api.binance.com` / `stream.binance.com` fail to resolve in your browser but
> resolve fine via a public DNS server (e.g. `nslookup api.binance.com 8.8.8.8`), that's the
> cause — switch your network's DNS resolver or use a VPN. This isn't a bug in the app.

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
