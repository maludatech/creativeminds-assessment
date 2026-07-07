import { PairList } from './components/PairList/PairList';
import { TickerPanel } from './components/TickerPanel/TickerPanel';
import './App.css';

function App() {
  return (
    <div className="app">
      <header className="app__header">
        <h1>Market Dashboard</h1>
        <p>Live Binance trading pairs and ticker updates</p>
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
