import { PairList } from './components/PairList/PairList';
import { TickerPanel } from './components/TickerPanel/TickerPanel';
import './App.css';

function App() {
  return (
    <div className="app">
      <header className="app__header">
        <div className="app__brand">
          <span className="app__brand-mark" aria-hidden="true" />
          <div>
            <h1>Market Dashboard</h1>
            <p>Live Binance trading pairs and ticker updates</p>
          </div>
        </div>
      </header>
      <main className="app__main">
        <section className="app__panel app__panel--pairs">
          <PairList />
        </section>
        <section className="app__panel app__panel--ticker">
          <TickerPanel />
        </section>
      </main>
    </div>
  );
}

export default App;
