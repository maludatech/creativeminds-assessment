import { Icon } from '../Icon/Icon';
import './ActiveTopicsCard.css';

const TOPICS = [
  { name: 'Pricing comprehension', moments: 31 },
  { name: 'Workspace invites', moments: 24 },
  { name: 'Onboarding checklist', moments: 19 },
];

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

      <ul className="active-topics-card__list">
        {TOPICS.map((topic) => (
          <li key={topic.name}>
            <span>{topic.name}</span>
            <span className="active-topics-card__count">{topic.moments} moments</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
