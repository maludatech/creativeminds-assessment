import { useState } from 'react';
import { Icon } from '../Icon/Icon';
import './Sidebar.css';

interface SubNavItem {
  label: string;
  icon: string;
  active?: boolean;
}

interface NavItem {
  label: string;
  icon: string;
  expandable?: boolean;
  children?: SubNavItem[];
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Home', icon: '/home.svg' },
  { label: 'Administration', icon: '/administration.svg', expandable: true },
  { label: 'Sessions', icon: '/sessions.svg' },
  { label: 'Live Sessions', icon: '/live-sessions.svg', expandable: true },
  {
    label: 'Project Management',
    icon: '/project-management.svg',
    expandable: true,
    children: [
      { label: 'Project Dashboard', icon: '/info.svg', active: true },
      { label: 'Project Set Up', icon: '/info.svg' },
      { label: 'Sessions', icon: '/internal-sessions.svg' },
      { label: 'User Management', icon: '/user-management.svg' },
    ],
  },
  { label: 'Analysis and Editing', icon: '/analysis-and-editing.svg', expandable: true },
  { label: 'Account', icon: '/account.svg', expandable: true },
];

export function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [openSection, setOpenSection] = useState('Project Management');

  return (
    <aside className={`sidebar ${isOpen ? 'sidebar--open' : ''}`}>
      <div className="sidebar__brand">
        <img className="sidebar__logo" src="/icon.svg" alt="Curator" />
        <img className="sidebar__brand-text" src="/curator-logo.png" alt="Curator Video Research" />
        <img className="sidebar__brand-toggle" src="/right-side-icon.svg" alt="" />
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
                className={`sidebar__item ${isOpen ? 'sidebar__item--open' : ''}`}
                onClick={() => item.expandable && setOpenSection(isOpen ? '' : item.label)}
              >
                <img className="sidebar__item-icon" src={item.icon} alt="" />
                <span className="sidebar__item-label">{item.label}</span>
                {item.expandable && (
                  <img
                    className="sidebar__chevron"
                    src={isOpen ? '/arrow-down-selected.svg' : '/arrow-down-unselected.svg'}
                    alt=""
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
                      <img className="sidebar__subitem-icon" src={child.icon} alt="" />
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
