import { Icon } from '../Icon/Icon';
import './TopBar.css';

export function TopBar({ onMenuClick, onChatClick }: { onMenuClick: () => void; onChatClick: () => void }) {
  return (
    <header className="topbar">
      <div className="topbar__left">
        <button className="topbar__menu" onClick={onMenuClick} aria-label="Open menu">
          <Icon name="menu" size={20} />
        </button>
        <div className="topbar__breadcrumb">
          <span className="topbar__crumb-muted">Dashboard</span>
          <Icon name="chevron-right" size={14} />
          <span className="topbar__crumb-active">Moments</span>
        </div>
      </div>

      <div className="topbar__actions">
        <button className="topbar__chat-btn" onClick={onChatClick}>
          <Icon name="sparkles" size={16} />
          <span>Chat with AI</span>
        </button>

        <button className="topbar__bell" aria-label="Notifications">
          <Icon name="bell" size={20} />
          <span className="topbar__bell-badge">4</span>
        </button>

        <div className="topbar__user">
          <img
            className="topbar__avatar"
            alt="John Doe"
            src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Crect width='40' height='40' fill='%23d8dbe3'/%3E%3C/svg%3E"
          />
          <div className="topbar__user-text">
            <span className="topbar__user-name">John Doe</span>
            <span className="topbar__user-role">Admin</span>
          </div>
        </div>
      </div>
    </header>
  );
}
