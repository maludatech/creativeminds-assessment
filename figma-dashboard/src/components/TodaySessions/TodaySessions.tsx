import { Icon } from '../Icon/Icon';
import type { IconName } from '../Icon/Icon';
import './TodaySessions.css';

interface Session {
  time: string;
  title: string;
  mode: string;
  duration: string;
  person: string;
  modeIcon: IconName;
  state: 'live' | 'upcoming' | 'scheduled';
  actionLabel: string;
}

const SESSIONS: Session[] = [
  {
    time: '11:00 AM',
    title: 'Checkout Flow — Respondent 4',
    mode: 'Zoom',
    duration: '60 min',
    person: 'Maya Schrantz',
    modeIcon: 'video',
    state: 'live',
    actionLabel: 'Join',
  },
  {
    time: '2:30 PM',
    title: 'Pricing Comprehension — Respondent 5',
    mode: 'Zoom',
    duration: '45 min',
    person: 'Jordan Kim',
    modeIcon: 'video',
    state: 'upcoming',
    actionLabel: 'Start',
  },
  {
    time: '4:00 PM',
    title: 'Integrations Walkthrough — Resp. 6',
    mode: 'In-person',
    duration: '30 min',
    person: 'Tobi Adebayo',
    modeIcon: 'pin',
    state: 'scheduled',
    actionLabel: 'View',
  },
];

export function TodaySessions() {
  return (
    <div className="today-sessions">
      <div className="today-sessions__header">
        <div>
          <h3>Today&apos;s sessions</h3>
          <span>Thursday, June 4 &middot; 3 scheduled</span>
        </div>
        <button className="link">
          View all
          <Icon name="arrow-right" size={14} />
        </button>
      </div>

      <ul className="today-sessions__list">
        {SESSIONS.map((session) => (
          <li key={session.time} className={`session-row session-row--${session.state}`}>
            <span className="session-row__time">{session.time}</span>
            <div className="session-row__body">
              <span className="session-row__title">{session.title}</span>
              <span className="session-row__meta">
                <Icon name={session.modeIcon} size={13} />
                {session.mode} &middot; {session.duration} &middot; {session.person}
              </span>
            </div>
            {session.state === 'live' && <span className="session-row__live">Live now</span>}
            {session.state === 'upcoming' && <span className="session-row__eta">In 3 hrs</span>}
            {session.state === 'scheduled' && (
              <span className="session-row__scheduled">Scheduled</span>
            )}
            <button
              className={
                session.state === 'scheduled' ? 'link' : 'btn btn--solid btn--sm'
              }
            >
              {session.actionLabel}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
