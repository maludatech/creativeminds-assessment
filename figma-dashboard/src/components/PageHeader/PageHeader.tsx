import { Icon } from "../Icon/Icon";
import "./PageHeader.css";

export function PageHeader() {
  return (
    <div className="page-header">
      <div className="page-header__text">
        <div className="page-header__title-wrap">
          <h1>Mid-Market Onboarding Study</h1>
        </div>
        <div className="page-header__subtitle-wrap">
          <span>Drop-off in the first 5 minutes of signup</span>
          <span>
            <span aria-hidden="true">&middot;</span> May 19, 2026 – Jun 11, 2026
          </span>
        </div>
      </div>
      <div className="page-header__actions">
        <button className="btn btn--outline page-header__team-btn">
          <Icon name="users" size={16} className="page-header__team-icon" />
          <span>Team</span>
        </button>
        <button className="btn btn--solid page-header__new-session-btn">
          <img
            className="page-header__new-session-icon"
            src="/new-session.svg"
            alt=""
          />
          <span>New session</span>
        </button>
      </div>
    </div>
  );
}
