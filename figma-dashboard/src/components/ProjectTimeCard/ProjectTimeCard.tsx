import { Icon } from '../Icon/Icon';
import './ProjectTimeCard.css';

export function ProjectTimeCard() {
  const spent = 12;
  const allocated = 20;
  const percent = (spent / allocated) * 100;

  return (
    <div className="project-time-card">
      <div className="project-time-card__icon">
        <Icon name="clock" size={20} />
      </div>

      <div className="project-time-card__info">
        <span className="project-time-card__title">Project Time</span>
        <span className="project-time-card__allocated">
          Allocated Time: <strong>{allocated} Hours</strong>
        </span>
      </div>

      <div className="project-time-card__progress">
        <div className="project-time-card__bar">
          <div className="project-time-card__bar-fill" style={{ width: `${percent}%` }} />
        </div>
        <span className="project-time-card__progress-label">
          {spent} out of {allocated} hours spent
        </span>
      </div>

      <div className="project-time-card__actions">
        <button className="btn btn--outline btn--sm">Request More Time</button>
        <button className="btn btn--solid btn--sm">Subscribe for more</button>
      </div>
    </div>
  );
}
