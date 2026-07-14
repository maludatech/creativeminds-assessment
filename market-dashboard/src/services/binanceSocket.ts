export type ConnectionStatus = 'idle' | 'connecting' | 'connected' | 'disconnected' | 'reconnecting';

export interface TickerMessage {
  symbol: string;
  price: string;
  priceChangePercent: string;
  eventTime: number;
}

type StatusListener = (status: ConnectionStatus) => void;
type TickerListener = (ticker: TickerMessage) => void;

// Routed through a Cloudflare Worker relay rather than connecting to
// stream.binance.com directly from the browser: Binance's WebSocket endpoint
// is DNS/network-blocked on some ISPs, the same restriction that affected
// the REST calls (see binanceApi.ts and the market-dashboard README's
// trade-off section). Vercel's serverless/edge functions can't hold a
// persistent upstream WebSocket connection reliably, but Cloudflare Workers
// support it natively, so the relay lives there instead of alongside the
// REST proxy. Only forwards <symbol>@ticker (see cloudflare-ws-relay/), not
// an arbitrary path.
const WS_BASE_URL = 'wss://creativeminds-binance-ws-relay.creativeminds-assessment.workers.dev/ws';
const MAX_RECONNECT_DELAY_MS = 30_000;
const BASE_RECONNECT_DELAY_MS = 1_000;
// A connection only counts as "recovered" (resetting the backoff) once it's
// stayed open this long. Resetting on the raw open event let a
// connect-then-immediately-drop loop retry at the ~1s base delay forever
// instead of actually backing off, which was enough to overwhelm the relay
// (observed: a sustained few-hundred-requests-per-minute reconnect storm).
const STABLE_CONNECTION_MS = 3_000;

/**
 * Maintains a single Binance websocket connection and lets callers subscribe
 * to one symbol's 24hr ticker stream at a time. Reconnects automatically
 * with exponential backoff and resubscribes to the active symbol on reconnect.
 */
class BinanceSocketService {
  private socket: WebSocket | null = null;
  private status: ConnectionStatus = 'idle';
  private activeSymbol: string | null = null;
  private reconnectAttempts = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private stabilityTimer: ReturnType<typeof setTimeout> | null = null;
  private manuallyClosed = false;
  private statusListeners = new Set<StatusListener>();
  private tickerListeners = new Set<TickerListener>();

  subscribeToStatus(listener: StatusListener): () => void {
    this.statusListeners.add(listener);
    listener(this.status);
    return () => this.statusListeners.delete(listener);
  }

  subscribeToTicker(listener: TickerListener): () => void {
    this.tickerListeners.add(listener);
    return () => this.tickerListeners.delete(listener);
  }

  setSymbol(symbol: string): void {
    const normalized = symbol.toLowerCase();
    if (this.activeSymbol === normalized && this.socket?.readyState === WebSocket.OPEN) {
      return;
    }
    this.activeSymbol = normalized;
    this.manuallyClosed = false;
    this.connect();
  }

  disconnect(): void {
    this.manuallyClosed = true;
    this.activeSymbol = null;
    this.clearReconnectTimer();
    this.clearStabilityTimer();
    this.socket?.close();
    this.socket = null;
    this.setStatus('idle');
  }

  private connect(): void {
    this.clearReconnectTimer();
    this.clearStabilityTimer();
    this.socket?.close();

    const symbol = this.activeSymbol;
    if (!symbol) return;

    this.setStatus(this.reconnectAttempts > 0 ? 'reconnecting' : 'connecting');
    const socket = new WebSocket(`${WS_BASE_URL}/${symbol}@ticker`);
    this.socket = socket;

    // Every handler below checks `this.socket === socket` before acting.
    // Closing a socket (e.g. this.socket?.close() above, or disconnect())
    // doesn't fire its close event synchronously, it fires later on the
    // event loop. If setSymbol()/connect() runs again in the meantime (e.g.
    // switching pairs, which calls disconnect() immediately followed by
    // setSymbol() for the new pair), the old socket's close event arrives
    // *after* a new socket already exists. Without this guard, that stale
    // event would act on the wrong connection, e.g. scheduling a "reconnect"
    // that tears down the brand new socket for the new symbol, producing an
    // endless self-inflicted connect/disconnect loop on every pair switch
    // (confirmed via relay + browser console logs during debugging).
    socket.onopen = () => {
      if (this.socket !== socket) return;
      this.setStatus('connected');
      this.stabilityTimer = setTimeout(() => {
        this.reconnectAttempts = 0;
      }, STABLE_CONNECTION_MS);
    };

    socket.onmessage = (event) => {
      if (this.socket !== socket) return;
      const data = JSON.parse(event.data as string);
      if (data.e !== '24hrTicker') return;
      this.tickerListeners.forEach((listener) =>
        listener({
          symbol: data.s,
          price: data.c,
          priceChangePercent: data.P,
          eventTime: data.E,
        }),
      );
    };

    socket.onclose = () => {
      if (this.socket !== socket) return;
      this.clearStabilityTimer();
      if (this.manuallyClosed) return;
      this.setStatus('disconnected');
      this.scheduleReconnect();
    };

    socket.onerror = () => {
      if (this.socket !== socket) return;
      socket.close();
    };
  }

  private scheduleReconnect(): void {
    if (!this.activeSymbol) return;
    const delay = Math.min(
      BASE_RECONNECT_DELAY_MS * 2 ** this.reconnectAttempts,
      MAX_RECONNECT_DELAY_MS,
    );
    this.reconnectAttempts += 1;
    this.reconnectTimer = setTimeout(() => this.connect(), delay);
  }

  private clearReconnectTimer(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  private clearStabilityTimer(): void {
    if (this.stabilityTimer) {
      clearTimeout(this.stabilityTimer);
      this.stabilityTimer = null;
    }
  }

  private setStatus(status: ConnectionStatus): void {
    this.status = status;
    this.statusListeners.forEach((listener) => listener(status));
  }
}

export const binanceSocket = new BinanceSocketService();
