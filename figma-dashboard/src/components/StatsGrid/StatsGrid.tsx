import './StatsGrid.css';

interface Stat {
  label: string;
  value: string;
  detail: string;
}

const STATS: Stat[] = [
  { label: 'Sessions', value: '5', detail: '3 complete · 2 upcoming' },
  { label: 'Moments', value: '142', detail: '84 marks · 41 clips · 17 AI' },
  { label: 'Topics', value: '9', detail: '6 curated · 3 AI generated' },
  { label: 'Reels', value: '4', detail: '2 published · 2 draft' },
];

export function StatsGrid() {
  return (
    <div className="stats-grid">
      {STATS.map((stat) => (
        <div key={stat.label} className="stat-card">
          <span className="stat-card__label">{stat.label}</span>
          <span className="stat-card__value">{stat.value}</span>
          <span className="stat-card__detail">{stat.detail}</span>
        </div>
      ))}
    </div>
  );
}
