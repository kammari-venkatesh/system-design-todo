import ProgressAreaChart from '../components/dashboard/ProgressAreaChart';
import AppleCalendar from '../components/dashboard/AppleCalendar';
import TodayTasksPanel from '../components/dashboard/TodayTasksPanel';
import KnowledgeNotesWorkspace from '../components/notes/KnowledgeNotesWorkspace';
import { useSelectedDay } from '../hooks/useSelectedDay';

export default function DashboardPage() {
  const { analytics, loading, activeDay, handleSelectDay } = useSelectedDay();

  function openNotesForDay(dayNum) {
    handleSelectDay(dayNum);
    setTimeout(() => {
      document.getElementById('notes')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
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

  return (
    <div className="page unified-dashboard">
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p className="subtitle">
            Day {analytics.currentDayNum} of 120 · {analytics.overallProgress}% complete
          </p>
        </div>
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
              }, 80);
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
        <KnowledgeNotesWorkspace selectedDayNum={activeDay} />
      </div>
    </div>
  );
}
