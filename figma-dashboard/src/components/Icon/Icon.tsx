export type IconName =
  | 'home'
  | 'admin'
  | 'sessions'
  | 'live'
  | 'project'
  | 'analysis'
  | 'account'
  | 'chevron-down'
  | 'chevron-right'
  | 'arrow-right'
  | 'search'
  | 'bell'
  | 'sparkles'
  | 'calendar'
  | 'lock'
  | 'clock'
  | 'clipboard'
  | 'users'
  | 'plus-circle'
  | 'mic'
  | 'paperclip'
  | 'send'
  | 'expand'
  | 'video'
  | 'pin'
  | 'refresh'
  | 'menu'
  | 'close';

const PATHS: Record<IconName, string> = {
  home: 'M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z',
  admin:
    'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c0-4.4 3.6-7 8-7s8 2.6 8 7',
  sessions: 'M4 5h16M4 12h16M4 19h10',
  live: 'M12 12m-3 0a3 3 0 1 0 6 0 3 3 0 1 0-6 0M12 5v0M12 19v0M5 12h0M19 12h0',
  project:
    'M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
  analysis: 'M4 4h16v16H4zM4 15l4-4 3 3 5-6 4 4',
  account: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c0-4.4 3.6-7 8-7s8 2.6 8 7',
  'chevron-down': 'm6 9 6 6 6-6',
  'chevron-right': 'm9 6 6 6-6 6',
  'arrow-right': 'M4 12h16m-6-6 6 6-6 6',
  search: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM21 21l-4.35-4.35',
  bell: 'M6 9a6 6 0 1 1 12 0c0 3.5 1 5 2 6H4c1-1 2-2.5 2-6zM10 20a2 2 0 0 0 4 0',
  sparkles:
    'm12 3 1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5zM19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z',
  calendar: 'M7 3v3M17 3v3M4 8h16M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z',
  lock: 'M6 11V8a6 6 0 1 1 12 0v3M5 11h14v9H5z',
  clock: 'M12 12m-9 0a9 9 0 1 0 18 0 9 9 0 1 0-18 0M12 7v5l3 3',
  clipboard:
    'M9 3h6a1 1 0 0 1 1 1v1h1a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h1V4a1 1 0 0 1 1-1z',
  users: 'M8 12a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM2 20c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5M16 12a3 3 0 1 0 0-6M22 20c0-2.8-2-4.8-4.5-5.3',
  'plus-circle': 'M12 12m-9 0a9 9 0 1 0 18 0 9 9 0 1 0-18 0M12 8v8M8 12h8',
  mic: 'M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3zM6 11a6 6 0 0 0 12 0M12 17v4',
  paperclip:
    'M8 12.5 15 5a3 3 0 0 1 4.2 4.2l-8.6 8.6a5 5 0 0 1-7-7l8-8',
  send: 'M4 12 20 4l-6 16-3-7-7-1z',
  expand: 'M9 3H3v6M15 21h6v-6M3 3l7 7M21 21l-7-7',
  video: 'M4 6h11a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1zM16 10l5-3v10l-5-3z',
  pin: 'M12 2 9 9l-6 1 4.5 4.5L6 21l6-4 6 4-1.5-6.5L21 10l-6-1z',
  refresh: 'M4 4v5h5M20 20v-5h-5M4.5 15a8 8 0 0 0 14.5 3M19.5 9A8 8 0 0 0 5 6',
  menu: 'M4 6h16M4 12h16M4 18h16',
  close: 'M6 6l12 12M18 6 6 18',
};

export function Icon({
  name,
  size = 18,
  className = '',
  strokeWidth = 1.8,
}: {
  name: IconName;
  size?: number;
  className?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`icon ${className}`}
      aria-hidden="true"
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
