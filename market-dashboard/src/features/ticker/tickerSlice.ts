import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { ConnectionStatus, TickerMessage } from '../../services/binanceSocket';

export interface TickerHistoryEntry {
  price: string;
  priceChangePercent: string;
  eventTime: number;
}

interface TickerState {
  connectionStatus: ConnectionStatus;
  latest: TickerHistoryEntry | null;
  history: TickerHistoryEntry[];
}

const MAX_HISTORY_LENGTH = 30;

const initialState: TickerState = {
  connectionStatus: 'idle',
  latest: null,
  history: [],
};

const tickerSlice = createSlice({
  name: 'ticker',
  initialState,
  reducers: {
    connectionStatusChanged(state, action: PayloadAction<ConnectionStatus>) {
      state.connectionStatus = action.payload;
    },
    tickerReceived(state, action: PayloadAction<TickerMessage>) {
      const entry: TickerHistoryEntry = {
        price: action.payload.price,
        priceChangePercent: action.payload.priceChangePercent,
        eventTime: action.payload.eventTime,
      };
      state.latest = entry;
      state.history.unshift(entry);
      if (state.history.length > MAX_HISTORY_LENGTH) {
        state.history.length = MAX_HISTORY_LENGTH;
      }
    },
    tickerReset(state) {
      state.latest = null;
      state.history = [];
    },
  },
});

export const { connectionStatusChanged, tickerReceived, tickerReset } = tickerSlice.actions;
export default tickerSlice.reducer;
