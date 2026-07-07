import { useState } from 'react';
import { Sidebar } from '../../components/Sidebar/Sidebar';
import { TopBar } from '../../components/TopBar/TopBar';
import { PageHeader } from '../../components/PageHeader/PageHeader';
import { StatsGrid } from '../../components/StatsGrid/StatsGrid';
import { ProjectTimeCard } from '../../components/ProjectTimeCard/ProjectTimeCard';
import { ReportCard } from '../../components/ReportCard/ReportCard';
import { TodaySessions } from '../../components/TodaySessions/TodaySessions';
import { CalendarCard } from '../../components/CalendarCard/CalendarCard';
import { SentimentCard } from '../../components/SentimentCard/SentimentCard';
import { ActiveTopicsCard } from '../../components/ActiveTopicsCard/ActiveTopicsCard';
import { ChatPanel } from '../../components/ChatPanel/ChatPanel';
import { Footer } from '../../components/Footer/Footer';
import './Dashboard.css';

export function Dashboard() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isChatOpen, setChatOpen] = useState(false);

  const closeOverlays = () => {
    setSidebarOpen(false);
    setChatOpen(false);
  };

  return (
    <div className="dashboard">
      <Sidebar isOpen={isSidebarOpen} onClose={closeOverlays} />

      <div className="dashboard__main">
        <TopBar onMenuClick={() => setSidebarOpen(true)} onChatClick={() => setChatOpen(true)} />

        <div className="dashboard__content">
          <div className="dashboard__card dashboard__card--flush">
            <PageHeader />
            <StatsGrid />
            <ProjectTimeCard />
            <ReportCard />

            <div className="dashboard__row">
              <TodaySessions />
              <CalendarCard />
            </div>

            <div className="dashboard__row">
              <SentimentCard />
              <ActiveTopicsCard />
            </div>
          </div>
        </div>

        <Footer />
      </div>

      <ChatPanel isOpen={isChatOpen} onClose={closeOverlays} />

      {(isSidebarOpen || isChatOpen) && (
        <div className="dashboard__backdrop" onClick={closeOverlays} />
      )}
    </div>
  );
}
