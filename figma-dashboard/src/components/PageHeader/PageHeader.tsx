import { Icon } from '../Icon/Icon';
import './PageHeader.css';

export function PageHeader() {
  return (
    <div className="page-header">
      <div className="page-header__text">
        <h1>Mid-Market Onboarding Study</h1>
        <p>Drop-off in the first 5 minutes of signup &middot; May 19, 2026 – Jun 11, 2026</p>
      </div>
      <div className="page-header__actions">
        <button className="btn btn--outline">
          <Icon name="users" size={16} />
          Team
        </button>
        <button className="btn btn--solid">
          <Icon name="plus-circle" size={16} />
          New session
        </button>
      </div>
    </div>
  );
}
