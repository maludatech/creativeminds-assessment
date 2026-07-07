import { Icon } from '../Icon/Icon';
import './SentimentCard.css';

const SEGMENTS = [
  { key: 'positive', percent: 58, color: 'var(--color-success)' },
  { key: 'neutral', percent: 24, color: 'var(--color-neutral-status)' },
  { key: 'negative', percent: 18, color: 'var(--color-danger)' },
];

export function SentimentCard() {
  return (
    <div className="sentiment-card">
      <div className="sentiment-card__header">
        <div>
          <h3>Sentiment</h3>
          <span>Across all completed moments</span>
        </div>
        <button className="link">
          View all moments
          <Icon name="arrow-right" size={14} />
        </button>
      </div>

      <div className="sentiment-card__bar">
        {SEGMENTS.map((segment) => (
          <div
            key={segment.key}
            className="sentiment-card__segment"
            style={{ width: `${segment.percent}%`, background: segment.color }}
          />
        ))}
      </div>
    </div>
  );
}
