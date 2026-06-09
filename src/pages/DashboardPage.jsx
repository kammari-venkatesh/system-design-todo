import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useProgress } from '../context/ProgressContext';
import ProgressAreaChart from '../components/dashboard/ProgressAreaChart';
import AppleCalendar from '../components/dashboard/AppleCalendar';
import TodayTasksPanel from '../components/dashboard/TodayTasksPanel';
import RoadmapSection from '../components/dashboard/RoadmapSection';
import ProgressSection from '../components/dashboard/ProgressSection';
import KnowledgeNotesWorkspace from '../components/notes/KnowledgeNotesWorkspace';

function useHashScroll() {
  const location = useLocation();
  useEffect(() => {
    if (!location.hash) return;
    const id = location.hash.replace('#', '');
    const el = document.getElementById(id);
    if (el) {
      setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    }
  }, [location.hash, location.pathname]);
}

export default function DashboardPage() {
  const location = useLocation();
  const { analytics, loading, ensureDailyNote } = useProgress();
  const [selectedDayNum, setSelectedDayNum] = useState(null);
  useHashScroll();

  useEffect(() => {
    if (location.state?.openDay) {
      const dayNum = location.state.openDay;
      setSelectedDayNum(dayNum);
      ensureDailyNote(dayNum);
      if (location.state.scrollNotes) {
        setTimeout(() => {
          document.getElementById('notes')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 200);
      }
      window.history.replaceState({}, document.title);
    }
  }, [location.state, ensureDailyNote]);

  useEffect(() => {
    if (analytics && selectedDayNum === null) {
      setSelectedDayNum(analytics.scheduledToday ?? analytics.currentDayNum);
    }
  }, [analytics, selectedDayNum]);

  function handleSelectDay(dayNum) {
    setSelectedDayNum(dayNum);
    ensureDailyNote(dayNum);
  }

  function openNotesForDay(dayNum) {
    handleSelectDay(dayNum);
    const notesEl = document.getElementById('notes');
    if (notesEl) notesEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  if (loading || !analytics) {
    return (
      <div className="page unified-dashboard">
        <div className="skeleton skeleton-title" />
        <div className="skeleton skeleton-chart" />
        <div className="skeleton skeleton-card" />
      </div>
    );
  }

  const activeDay = selectedDayNum ?? analytics.scheduledToday ?? analytics.currentDayNum;

  return (
    <div className="page unified-dashboard">
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p className="subtitle">
            Day {analytics.currentDayNum} of 120 · {analytics.overallProgress}% complete
          </p>
        </div>
        <nav className="dashboard-jump-nav">
          <a href="#graph">Graph</a>
          <a href="#calendar">Calendar</a>
          <a href="#roadmap">Roadmap</a>
          <a href="#progress">Progress</a>
          <a href="#notes">Notes</a>
        </nav>
      </div>

      <section className="dashboard-section" id="graph">
        <ProgressAreaChart allDays={analytics.allDays} />
      </section>

      <section className="dashboard-section section-divider" id="calendar">
        <div className="section-header">
          <h2>Calendar & Tasks</h2>
          <p className="subtitle">Plan your study days and track today&apos;s tasks</p>
        </div>
        <div className="dashboard-grid">
          <AppleCalendar
            heatmap={analytics.heatmap}
            allDays={analytics.allDays}
            planStartDate={analytics.planStartDate}
            selectedDayNum={activeDay}
            onSelectDay={(dayNum) => {
              handleSelectDay(dayNum);
              setTimeout(() => {
                document.getElementById('notes')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }, 100);
            }}
          />
          <TodayTasksPanel
            dayNum={activeDay}
            onDayChange={handleSelectDay}
            onOpenNotes={() => openNotesForDay(activeDay)}
          />
        </div>
      </section>

      <div className="section-divider">
        <RoadmapSection />
      </div>

      <div className="section-divider">
        <ProgressSection />
      </div>

      <div className="section-divider">
        <KnowledgeNotesWorkspace selectedDayNum={activeDay} />
      </div>
    </div>
  );
}
