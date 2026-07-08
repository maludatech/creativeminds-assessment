import './ReportCard.css';

export function ReportCard() {
  const completed = 3;
  const total = 5;
  const percent = (completed / total) * 100;

  return (
    <div className="report-card">
      <div className="report-card__icon">
        <img src="/report.svg" alt="" />
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

      <button className="report-card__locked-btn" disabled>
        <img src="/locked.svg" alt="" />
        Locked
      </button>
    </div>
  );
}
