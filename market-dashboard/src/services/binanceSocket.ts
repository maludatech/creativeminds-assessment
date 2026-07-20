export type ConnectionStatus =
  | "idle"
  | "connecting"
  | "connected"
  | "disconnected"
  | "reconnecting";

export interface TickerMessage {
  symbol: string;
  price: string;
  priceChangePercent: string;
  eventTime: number;
}

type StatusListener = (status: ConnectionStatus) => void;
type TickerListener = (ticker: TickerMessage) => void;

// Binance's stream endpoint is DNS-blocked on some ISPs, so this goes through a Cloudflare Worker relay instead of connecting directly.
const WS_BASE_URL =
  "wss://creativeminds-binance-ws-relay.creativeminds-assessment.workers.dev/ws";
const MAX_RECONNECT_DELAY_MS = 30_000;
const BASE_RECONNECT_DELAY_MS = 1_000;
// Only reset backoff after the connection has been stable for a bit resetting on open alone caused rapid retry loops on flaky connections.
const STABLE_CONNECTION_MS = 3_000;

/**
 * Manages a single Binance WebSocket connection for one symbol at a time.
 * Reconnects automatically with exponential backoff.
 */
class BinanceSocketService {
  private socket: WebSocket | null = null;
  private status: ConnectionStatus = "idle";
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
    if (
      this.activeSymbol === normalized &&
      this.socket?.readyState === WebSocket.OPEN
    ) {
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
    this.setStatus("idle");
  }

  private connect(): void {
    this.clearReconnectTimer();
    this.clearStabilityTimer();
    this.socket?.close();

    const symbol = this.activeSymbol;
    if (!symbol) return;

    this.setStatus(this.reconnectAttempts > 0 ? "reconnecting" : "connecting");
    const socket = new WebSocket(`${WS_BASE_URL}/${symbol}@ticker`);
    this.socket = socket;

    // Each handler checks this.socket === socket so events from a previous connection don't interfere when switching symbols.
    socket.onopen = () => {
      if (this.socket !== socket) return;
      this.setStatus("connected");
      this.stabilityTimer = setTimeout(() => {
        this.reconnectAttempts = 0;
      }, STABLE_CONNECTION_MS);
    };

    socket.onmessage = (event) => {
      if (this.socket !== socket) return;
      const data = JSON.parse(event.data as string);
      if (data.e !== "24hrTicker") return;
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
      this.setStatus("disconnected");
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
