import { configureStore } from '@reduxjs/toolkit';
import pairsReducer from '../features/pairs/pairsSlice';
import tickerReducer from '../features/ticker/tickerSlice';

export const store = configureStore({
  reducer: {
    pairs: pairsReducer,
    ticker: tickerReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
