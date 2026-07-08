import { useState } from 'react';
import { Icon } from '../Icon/Icon';
import './ChatPanel.css';

type Segment = string | { text: string; highlight?: boolean };

interface Message {
  role: 'user' | 'ai';
  segments: Segment[];
}

const INITIAL_MESSAGES: Message[] = [
  { role: 'user', segments: ['Where does the project stand right now?'] },
  {
    role: 'ai',
    segments: [
      '3 of 5 sessions are complete and tagged — ',
      { text: '142 moments', highlight: true },
      ' so far, sentiment running ',
      { text: '58% positive', highlight: true },
      ". Two sessions remain today. I'll compile the final report the moment they wrap.",
    ],
  },
  { role: 'user', segments: ['What are clients most frustrated about?'] },
  {
    role: 'ai',
    segments: [
      'Across the 3 completed sessions, the loudest frustration is ',
      { text: 'pricing comprehension', highlight: true },
      ' — ',
      { text: '31 moments', highlight: true },
      ', mostly annual-vs-monthly billing only surfacing at checkout. ',
      { text: 'Workspace invites', highlight: true },
      ' are a secondary friction (',
      { text: '24 moments', highlight: true },
      '). Want me to pull the clearest 3 clips?',
    ],
  },
];

const SUGGESTED = ['Summarize all sessions', 'Which moments belong in the final reel?'];

function renderSegments(segments: Segment[]) {
  return segments.map((segment, i) => {
    if (typeof segment === 'string') return <span key={i}>{segment}</span>;
    return (
      <span key={i} className={segment.highlight ? 'chat-bubble__highlight' : undefined}>
        {segment.text}
      </span>
    );
  });
}

export function ChatPanel({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [messages] = useState(INITIAL_MESSAGES);

  return (
    <aside className={`chat-panel ${isOpen ? 'chat-panel--open' : ''}`}>
      <div className="chat-panel__header">
        <div className="chat-panel__title">
          <img className="chat-panel__avatar" src="/chatbox-icon.svg" alt="" />
          <div className="chat-panel__title-text">
            <div className="chat-panel__name">
              Curator AI
              <span className="chat-panel__live">
                <span className="chat-panel__live-dot" />
                Live
              </span>
            </div>
            <span className="chat-panel__subtitle">Project assistant</span>
          </div>
        </div>
        <Icon name="expand" size={11.72} strokeWidth={1.06} className="chat-panel__expand" />
        <button className="chat-panel__close" onClick={onClose} aria-label="Close chat">
          <Icon name="close" size={18} />
        </button>
      </div>

      <div className="chat-panel__grounding">
        <img src="/chat-panel-sm-icon.svg" alt="" />
        Answers grounded in this project&apos;s sessions, moments &amp; transcripts.
      </div>

      <div className="chat-panel__body">
        <div className="chat-panel__messages">
          {messages.map((message, i) =>
            message.role === 'ai' ? (
              <div key={i} className="chat-panel__ai-row">
                <span className="chat-panel__ai-icon">
                  <img src="/ai-icon.svg" alt="" />
                </span>
                <div className="chat-bubble chat-bubble--ai">{renderSegments(message.segments)}</div>
              </div>
            ) : (
              <div key={i} className="chat-bubble chat-bubble--user">
                {renderSegments(message.segments)}
              </div>
            ),
          )}
          <span className="chat-panel__timestamp">now</span>
        </div>

        <div className="chat-panel__footer">
          <div className="chat-panel__suggested">
            <span className="chat-panel__suggested-label">SUGGESTED</span>
            {SUGGESTED.map((suggestion) => (
              <button key={suggestion} className="chat-panel__suggestion">
                <img src="/stars-sm.svg" alt="" />
                {suggestion}
              </button>
            ))}
          </div>

          <div className="chat-panel__input-section">
            <div className="chat-panel__input">
              <input type="text" placeholder="Ask about this project…" />
              <div className="chat-panel__input-actions">
                <Icon name="paperclip" size={13.28} strokeWidth={1.13} />
                <Icon name="mic" size={13.28} strokeWidth={1.13} />
                <button className="chat-panel__send" aria-label="Send">
                  <Icon name="send" size={11.72} strokeWidth={1.06} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
