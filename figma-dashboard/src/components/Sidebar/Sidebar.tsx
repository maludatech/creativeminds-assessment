import { useState } from 'react';
import { Icon } from '../Icon/Icon';
import type { IconName } from '../Icon/Icon';
import './Sidebar.css';

interface NavItem {
  label: string;
  icon: IconName;
  expandable?: boolean;
  children?: { label: string; active?: boolean }[];
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Home', icon: 'home' },
  { label: 'Administration', icon: 'admin', expandable: true },
  { label: 'Sessions', icon: 'sessions' },
  { label: 'Live Sessions', icon: 'live', expandable: true },
  {
    label: 'Project Management',
    icon: 'project',
    expandable: true,
    children: [
      { label: 'Project Dashboard', active: true },
      { label: 'Project Set Up' },
      { label: 'Sessions' },
      { label: 'User Management' },
    ],
  },
  { label: 'Analysis and Editing', icon: 'analysis', expandable: true },
  { label: 'Account', icon: 'account', expandable: true },
];

export function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [openSection, setOpenSection] = useState('Project Management');

  return (
    <aside className={`sidebar ${isOpen ? 'sidebar--open' : ''}`}>
      <div className="sidebar__brand">
        <span className="sidebar__logo">C</span>
        <div className="sidebar__brand-text">
          <span className="sidebar__brand-name">CURATOR</span>
          <span className="sidebar__brand-sub">VIDEO RESEARCH</span>
        </div>
        <button className="sidebar__close" onClick={onClose} aria-label="Close menu">
          <Icon name="close" size={18} />
        </button>
      </div>

      <nav className="sidebar__nav">
        {NAV_ITEMS.map((item) => {
          const isOpen = openSection === item.label;
          return (
            <div key={item.label} className="sidebar__section">
              <button
                className={`sidebar__item ${isOpen && item.children ? 'sidebar__item--open' : ''}`}
                onClick={() => item.expandable && setOpenSection(isOpen ? '' : item.label)}
              >
                <Icon name={item.icon} className="sidebar__item-icon" />
                <span className="sidebar__item-label">{item.label}</span>
                {item.expandable && (
                  <Icon
                    name="chevron-down"
                    size={16}
                    className={`sidebar__chevron ${isOpen ? 'sidebar__chevron--open' : ''}`}
                  />
                )}
              </button>
              {item.children && isOpen && (
                <div className="sidebar__submenu">
                  {item.children.map((child) => (
                    <button
                      key={child.label}
                      className={`sidebar__subitem ${child.active ? 'sidebar__subitem--active' : ''}`}
                    >
                      {child.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
