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
          <img className="topbar__crumb-arrow" src="/arrow-right-icon.svg" alt="" />
          <span className="topbar__crumb-active">Moments</span>
        </div>
      </div>

      <div className="topbar__actions">
        <button className="topbar__chat-btn" onClick={onChatClick}>
          <img className="topbar__chat-btn-icon" src="/stars.svg" alt="" />
          <span>Chat with AI</span>
        </button>

        <button className="topbar__bell" aria-label="Notifications">
          <Icon name="bell" size={28} />
          <span className="topbar__bell-badge">4</span>
        </button>

        <div className="topbar__user">
          <div className="topbar__user-text">
            <span className="topbar__user-name">John Doe</span>
            <span className="topbar__user-role">Admin</span>
          </div>
          <div className="topbar__avatar-wrap">
            <img className="topbar__avatar" alt="John Doe" src="/profile.png" />
            <span className="topbar__avatar-status" />
          </div>
          <img className="topbar__user-caret" src="/caret-down.svg" alt="" />
        </div>
      </div>
    </header>
  );
}
