import { useAppSelector } from '../../hooks';
import { useSymbolTicker } from '../../hooks/useSymbolTicker';
import { ConnectionBadge } from '../ConnectionBadge/ConnectionBadge';
import './TickerPanel.css';

export function TickerPanel() {
  const selectedSymbol = useAppSelector((state) => state.pairs.selectedSymbol);
  const { connectionStatus, latest, history } = useAppSelector((state) => state.ticker);

  useSymbolTicker(selectedSymbol);

  if (!selectedSymbol) {
    return (
      <div className="ticker-panel ticker-panel--empty">
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
          <span className="ticker-panel__price">{latest.price}</span>
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
          {history.map((entry) => (
            <li key={entry.eventTime}>
              <span>{new Date(entry.eventTime).toLocaleTimeString()}</span>
              <span>{entry.price}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
