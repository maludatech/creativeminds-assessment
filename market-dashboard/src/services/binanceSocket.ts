export type ConnectionStatus = 'idle' | 'connecting' | 'connected' | 'disconnected' | 'reconnecting';

export interface TickerMessage {
  symbol: string;
  price: string;
  priceChangePercent: string;
  eventTime: number;
}

type StatusListener = (status: ConnectionStatus) => void;
type TickerListener = (ticker: TickerMessage) => void;

// Same DNS block as the REST calls, so this goes through the Cloudflare
// relay instead of stream.binance.com directly. Vercel can't hold a
// WebSocket open past the initial request; Cloudflare Workers can.
const WS_BASE_URL = 'wss://creativeminds-binance-ws-relay.creativeminds-assessment.workers.dev/ws';
const MAX_RECONNECT_DELAY_MS = 30_000;
const BASE_RECONNECT_DELAY_MS = 1_000;
// Backoff only resets once a connection's stayed open this long. Resetting
// on the raw open event let a connect-then-drop loop retry every ~1s
// forever and hammered the relay.
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

    // Closing a socket doesn't fire its close event synchronously — it can
    // arrive after we've already moved on to a new one (e.g. switching
    // pairs). Every handler checks `this.socket === socket` so a stale
    // event from an old socket can't mess with the current connection.
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
