// Goes through our own proxy instead of api.binance.com directly —
// Binance is DNS-blocked on some networks.
const REST_BASE_URL = "/api/binance";

export interface BinanceSymbol {
  symbol: string;
  baseAsset: string;
  quoteAsset: string;
  status: string;
}

export interface Binance24hrTicker {
  symbol: string;
  lastPrice: string;
  priceChangePercent: string;
  quoteVolume: string;
}

interface ExchangeInfoResponse {
  symbols: BinanceSymbol[];
}

async function request<T>(path: string): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${REST_BASE_URL}${path}`);
  } catch {
    throw new Error(
      "Could not reach the market data service. Check your connection and try again " +
        "if this keeps happening, your network may be blocking Binance and a VPN may help.",
    );
  }
  if (!response.ok) {
    throw new Error(
      `Binance API request failed: ${response.status} ${response.statusText}`,
    );
  }
  return response.json() as Promise<T>;
}

export function fetchExchangeInfo(): Promise<ExchangeInfoResponse> {
  return request<ExchangeInfoResponse>("/exchange-info");
}

export function fetch24hrTickers(): Promise<Binance24hrTicker[]> {
  return request<Binance24hrTicker[]>("/ticker-24hr");
}
