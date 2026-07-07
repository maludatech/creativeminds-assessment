import type { ConnectionStatus } from '../../services/binanceSocket';
import './ConnectionBadge.css';

const LABELS: Record<ConnectionStatus, string> = {
  idle: 'Idle',
  connecting: 'Connecting…',
  connected: 'Connected',
  disconnected: 'Disconnected',
  reconnecting: 'Reconnecting…',
};

export function ConnectionBadge({ status }: { status: ConnectionStatus }) {
  return (
    <span className={`connection-badge connection-badge--${status}`}>
      <span className="connection-badge__dot" />
      {LABELS[status]}
    </span>
  );
}
