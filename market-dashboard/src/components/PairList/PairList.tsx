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
      <input
        className="pair-list__search"
        type="text"
        placeholder="Search trading pairs (e.g. BTCUSDT)"
        value={searchTerm}
        onChange={(e) => dispatch(setSearchTerm(e.target.value))}
      />

      {status === 'loading' && <p className="pair-list__message">Loading trading pairs…</p>}

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
