import { Icon } from '../Icon/Icon';
import './ReportCard.css';

export function ReportCard() {
  const completed = 3;
  const total = 5;
  const percent = (completed / total) * 100;

  return (
    <div className="report-card">
      <div className="report-card__icon">
        <Icon name="clipboard" size={22} />
      </div>

      <div className="report-card__body">
        <div className="report-card__heading">
          <h3>Final research report</h3>
          <span className="report-card__badge">
            <span className="report-card__badge-dot" />
            Compiling
          </span>
        </div>
        <p className="report-card__description">
          Curator AI is analyzing sessions as they complete. The report unlocks once all {total}{' '}
          sessions have ended.
        </p>
        <div className="report-card__progress">
          <div className="report-card__bar">
            <div className="report-card__bar-fill" style={{ width: `${percent}%` }} />
          </div>
          <span className="report-card__progress-label">
            {completed} of {total} sessions analyzed
          </span>
        </div>
      </div>

      <button className="btn btn--disabled" disabled>
        <Icon name="lock" size={16} />
        Locked
      </button>
    </div>
  );
}
