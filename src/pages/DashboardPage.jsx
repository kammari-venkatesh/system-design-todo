import ProgressAreaChart from '../components/dashboard/ProgressAreaChart';
import AppleCalendar from '../components/dashboard/AppleCalendar';
import TodayTasksPanel from '../components/dashboard/TodayTasksPanel';
import KnowledgeNotesWorkspace from '../components/notes/KnowledgeNotesWorkspace';
import { useSelectedDay } from '../hooks/useSelectedDay';
import { useProgress } from '../context/ProgressContext';

export default function DashboardPage() {
  const { analytics, loading, activeDay, selectedDateKey, isDaySwitching, handleSelectDayFromCalendar, handleSelectDayByNum } = useSelectedDay();
  const { progress } = useProgress();

  function openNotesForDay(dayNum) {
    handleSelectDayByNum(dayNum);
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
            Day {analytics.currentDayNum} of {analytics.totalPlanDays ?? analytics.allDays?.length ?? 126} · {analytics.overallProgress}% complete
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
            dayDone={progress.dayDone}
            totalPlanDays={analytics.totalPlanDays ?? analytics.allDays?.length}
            selectedDateKey={selectedDateKey}
            onSelectDay={handleSelectDayFromCalendar}
          />
          <TodayTasksPanel
            dayNum={activeDay}
            switching={isDaySwitching}
            onDayChange={handleSelectDayByNum}
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
