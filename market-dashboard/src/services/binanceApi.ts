const REST_BASE_URL = 'https://api.binance.com/api/v3';

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
  const response = await fetch(`${REST_BASE_URL}${path}`);
  if (!response.ok) {
    throw new Error(`Binance API request failed: ${response.status} ${response.statusText}`);
  }
  return response.json() as Promise<T>;
}

export function fetchExchangeInfo(): Promise<ExchangeInfoResponse> {
  return request<ExchangeInfoResponse>('/exchangeInfo');
}

export function fetch24hrTickers(): Promise<Binance24hrTicker[]> {
  return request<Binance24hrTicker[]>('/ticker/24hr');
}
