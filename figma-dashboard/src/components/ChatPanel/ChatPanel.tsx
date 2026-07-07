import { useState } from 'react';
import { Icon } from '../Icon/Icon';
import './ChatPanel.css';

interface Message {
  role: 'user' | 'ai';
  text: string;
}

const INITIAL_MESSAGES: Message[] = [
  { role: 'user', text: 'Where does the project stand right now?' },
  {
    role: 'ai',
    text: "3 of 5 sessions are complete and tagged — 142 moments so far, sentiment running 58% positive. Two sessions remain today. I'll compile the final report the moment they wrap.",
  },
  { role: 'user', text: 'What are clients most frustrated about?' },
  {
    role: 'ai',
    text: "Across the 3 completed sessions, the loudest frustration is pricing comprehension — 31 moments, mostly annual-vs-monthly billing only surfacing at checkout. Workspace invites are a secondary friction (24 moments). Want me to pull the clearest 3 clips?",
  },
];

const SUGGESTED = ['Summarize all sessions', 'Which moments belong in the final reel?'];

export function ChatPanel({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [messages] = useState(INITIAL_MESSAGES);

  return (
    <aside className={`chat-panel ${isOpen ? 'chat-panel--open' : ''}`}>
      <div className="chat-panel__header">
        <div className="chat-panel__title">
          <span className="chat-panel__avatar">
            <Icon name="sparkles" size={16} />
          </span>
          <div>
            <div className="chat-panel__name">
              Curator AI <span className="chat-panel__live">Live</span>
            </div>
            <span className="chat-panel__subtitle">Project assistant</span>
          </div>
        </div>
        <Icon name="expand" size={16} className="chat-panel__expand" />
        <button className="chat-panel__close" onClick={onClose} aria-label="Close chat">
          <Icon name="close" size={18} />
        </button>
      </div>

      <div className="chat-panel__grounding">
        <Icon name="clipboard" size={14} />
        Answers grounded in this project&apos;s sessions, moments &amp; transcripts.
      </div>

      <div className="chat-panel__messages">
        {messages.map((message, i) => (
          <div key={i} className={`chat-bubble chat-bubble--${message.role}`}>
            {message.text}
          </div>
        ))}
        <span className="chat-panel__timestamp">now</span>
      </div>

      <div className="chat-panel__suggested">
        <span className="chat-panel__suggested-label">SUGGESTED</span>
        {SUGGESTED.map((suggestion) => (
          <button key={suggestion} className="chat-panel__suggestion">
            <Icon name="sparkles" size={13} />
            {suggestion}
          </button>
        ))}
      </div>

      <div className="chat-panel__input">
        <input type="text" placeholder="Ask about this project…" />
        <div className="chat-panel__input-actions">
          <Icon name="paperclip" size={16} />
          <Icon name="mic" size={16} />
          <button className="chat-panel__send" aria-label="Send">
            <Icon name="send" size={15} />
          </button>
        </div>
      </div>
    </aside>
  );
}
