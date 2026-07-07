import { useEffect } from 'react';
import { binanceSocket } from '../services/binanceSocket';
import { connectionStatusChanged, tickerReceived, tickerReset } from '../features/ticker/tickerSlice';
import { useAppDispatch } from '.';

/** Connects the Binance socket service to Redux for the given symbol. */
export function useSymbolTicker(symbol: string | null): void {
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!symbol) return undefined;

    dispatch(tickerReset());
    binanceSocket.setSymbol(symbol);

    const unsubscribeStatus = binanceSocket.subscribeToStatus((status) => {
      dispatch(connectionStatusChanged(status));
    });
    const unsubscribeTicker = binanceSocket.subscribeToTicker((ticker) => {
      dispatch(tickerReceived(ticker));
    });

    return () => {
      unsubscribeStatus();
      unsubscribeTicker();
      binanceSocket.disconnect();
    };
  }, [symbol, dispatch]);
}
