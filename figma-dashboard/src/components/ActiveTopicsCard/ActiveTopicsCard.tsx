import { Icon } from '../Icon/Icon';
import './ActiveTopicsCard.css';

export function ActiveTopicsCard() {
  return (
    <div className="active-topics-card">
      <div className="active-topics-card__header">
        <div>
          <h3>Active topics</h3>
          <span>Sorted by moments tagged</span>
        </div>
        <button className="link">
          View topics
          <Icon name="arrow-right" size={14} />
        </button>
      </div>
    </div>
  );
}
