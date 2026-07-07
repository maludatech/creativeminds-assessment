import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { fetch24hrTickers, fetchExchangeInfo } from '../../services/binanceApi';

export interface TradingPair {
  symbol: string;
  baseAsset: string;
  quoteAsset: string;
  lastPrice: string;
  priceChangePercent: string;
}

interface PairsState {
  items: TradingPair[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
  searchTerm: string;
  selectedSymbol: string | null;
}

const SELECTED_SYMBOL_STORAGE_KEY = 'market-dashboard:selected-symbol';

const initialState: PairsState = {
  items: [],
  status: 'idle',
  error: null,
  searchTerm: '',
  selectedSymbol: localStorage.getItem(SELECTED_SYMBOL_STORAGE_KEY),
};

export const fetchTradingPairs = createAsyncThunk('pairs/fetchTradingPairs', async () => {
  const [exchangeInfo, tickers] = await Promise.all([fetchExchangeInfo(), fetch24hrTickers()]);
  const tickerBySymbol = new Map(tickers.map((ticker) => [ticker.symbol, ticker]));

  return exchangeInfo.symbols
    .filter((s) => s.status === 'TRADING' && tickerBySymbol.has(s.symbol))
    .map((s): TradingPair => {
      const ticker = tickerBySymbol.get(s.symbol)!;
      return {
        symbol: s.symbol,
        baseAsset: s.baseAsset,
        quoteAsset: s.quoteAsset,
        lastPrice: ticker.lastPrice,
        priceChangePercent: ticker.priceChangePercent,
      };
    });
});

const pairsSlice = createSlice({
  name: 'pairs',
  initialState,
  reducers: {
    setSearchTerm(state, action: PayloadAction<string>) {
      state.searchTerm = action.payload;
    },
    selectSymbol(state, action: PayloadAction<string>) {
      state.selectedSymbol = action.payload;
      localStorage.setItem(SELECTED_SYMBOL_STORAGE_KEY, action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTradingPairs.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchTradingPairs.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchTradingPairs.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Failed to load trading pairs';
      });
  },
});

export const { setSearchTerm, selectSymbol } = pairsSlice.actions;
export default pairsSlice.reducer;
