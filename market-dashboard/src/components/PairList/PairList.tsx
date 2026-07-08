import { useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { fetchTradingPairs, selectSymbol, setSearchTerm } from '../../features/pairs/pairsSlice';
import './PairList.css';

export function PairList() {
  const dispatch = useAppDispatch();
  const { items, status, error, searchTerm, selectedSymbol } = useAppSelector((state) => state.pairs);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchTradingPairs());
    }
  }, [status, dispatch]);

  const filteredItems = useMemo(() => {
    const term = searchTerm.trim().toUpperCase();
    if (!term) return items;
    return items.filter((pair) => pair.symbol.includes(term));
  }, [items, searchTerm]);

  return (
    <div className="pair-list">
      <div className="pair-list__toolbar">
        <div className="pair-list__search-wrap">
          <svg className="pair-list__search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
            <path d="M20 20L16.5 16.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <input
            className="pair-list__search"
            type="text"
            placeholder="Search pairs (e.g. BTCUSDT)"
            value={searchTerm}
            onChange={(e) => dispatch(setSearchTerm(e.target.value))}
          />
        </div>
        {status === 'succeeded' && (
          <span className="pair-list__count">{filteredItems.length.toLocaleString()} pairs</span>
        )}
      </div>

      {status === 'loading' && (
        <ul className="pair-list__items" aria-hidden="true">
          {Array.from({ length: 10 }).map((_, i) => (
            <li key={i} className="pair-list__skeleton-row">
              <span className="pair-list__skeleton pair-list__skeleton--symbol" />
              <span className="pair-list__skeleton pair-list__skeleton--price" />
              <span className="pair-list__skeleton pair-list__skeleton--change" />
            </li>
          ))}
        </ul>
      )}

      {status === 'failed' && (
        <div className="pair-list__message pair-list__message--error">
          <p>{error}</p>
          <button onClick={() => dispatch(fetchTradingPairs())}>Retry</button>
        </div>
      )}

      {status === 'succeeded' && filteredItems.length === 0 && (
        <p className="pair-list__message">No trading pairs match “{searchTerm}”.</p>
      )}

      {status === 'succeeded' && filteredItems.length > 0 && (
        <ul className="pair-list__items">
          {filteredItems.map((pair) => {
            const change = Number(pair.priceChangePercent);
            return (
              <li key={pair.symbol}>
                <button
                  className={`pair-list__item ${pair.symbol === selectedSymbol ? 'pair-list__item--active' : ''}`}
                  onClick={() => dispatch(selectSymbol(pair.symbol))}
                >
                  <span className="pair-list__symbol">
                    {pair.baseAsset}
                    <span className="pair-list__quote">/{pair.quoteAsset}</span>
                  </span>
                  <span className="pair-list__price">{pair.lastPrice}</span>
                  <span className={`pair-list__change ${change >= 0 ? 'pair-list__change--up' : 'pair-list__change--down'}`}>
                    {change >= 0 ? '+' : ''}
                    {change.toFixed(2)}%
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
