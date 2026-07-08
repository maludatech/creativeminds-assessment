import { useEffect, useRef, useState } from 'react';
import { useAppSelector } from '../../hooks';
import { useSymbolTicker } from '../../hooks/useSymbolTicker';
import { ConnectionBadge } from '../ConnectionBadge/ConnectionBadge';
import './TickerPanel.css';

export function TickerPanel() {
  const selectedSymbol = useAppSelector((state) => state.pairs.selectedSymbol);
  const { connectionStatus, latest, history } = useAppSelector((state) => state.ticker);

  useSymbolTicker(selectedSymbol);

  const [flash, setFlash] = useState<'up' | 'down' | null>(null);
  const prevPriceRef = useRef<string | null>(null);

  useEffect(() => {
    if (!latest) {
      prevPriceRef.current = null;
      return;
    }
    const prev = prevPriceRef.current;
    if (prev !== null && prev !== latest.price) {
      setFlash(Number(latest.price) >= Number(prev) ? 'up' : 'down');
      const timeout = setTimeout(() => setFlash(null), 500);
      prevPriceRef.current = latest.price;
      return () => clearTimeout(timeout);
    }
    prevPriceRef.current = latest.price;
  }, [latest]);

  if (!selectedSymbol) {
    return (
      <div className="ticker-panel ticker-panel--empty">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M4 19V9M10 19V4M16 19V12M22 19V7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <p>Select a trading pair to see live price updates.</p>
      </div>
    );
  }

  const change = latest ? Number(latest.priceChangePercent) : 0;

  return (
    <div className="ticker-panel">
      <div className="ticker-panel__header">
        <h2>{selectedSymbol}</h2>
        <ConnectionBadge status={connectionStatus} />
      </div>

      {!latest ? (
        <p className="ticker-panel__waiting">Waiting for live data…</p>
      ) : (
        <div className="ticker-panel__price-row">
          <span
            className={`ticker-panel__price ${flash ? `ticker-panel__price--flash-${flash}` : ''}`}
          >
            {latest.price}
          </span>
          <span className={`ticker-panel__change ${change >= 0 ? 'ticker-panel__change--up' : 'ticker-panel__change--down'}`}>
            {change >= 0 ? '+' : ''}
            {change.toFixed(2)}%
          </span>
        </div>
      )}

      <h3 className="ticker-panel__history-title">Recent updates</h3>
      {history.length === 0 ? (
        <p className="ticker-panel__waiting">No updates yet.</p>
      ) : (
        <ul className="ticker-panel__history">
          {history.map((entry, i) => {
            const prevEntry = history[i + 1];
            const dir = prevEntry ? Number(entry.price) - Number(prevEntry.price) : 0;
            return (
              <li key={entry.eventTime}>
                <span className="ticker-panel__history-time">
                  {new Date(entry.eventTime).toLocaleTimeString()}
                </span>
                <span
                  className={`ticker-panel__history-price ${
                    dir > 0 ? 'ticker-panel__history-price--up' : dir < 0 ? 'ticker-panel__history-price--down' : ''
                  }`}
                >
                  {entry.price}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
