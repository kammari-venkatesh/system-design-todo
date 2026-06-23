import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useProgress } from '../../context/ProgressContext';
import WeekCard from '../WeekCard';
import { phaseWeeks, weekDone, getTotalPlanDays } from '../../utils/planHelpers';

export default function RoadmapSection() {
  const { phases, plan, progress, analytics, loading, toggleCheck, toggleDayDone, toggleBookmark } = useProgress();
  const [openPhases, setOpenPhases] = useState(new Set());
  const [openWeeks, setOpenWeeks] = useState(new Set());
  const [search, setSearch] = useState('');

  const filteredPlan = useMemo(() => {
    if (!search.trim()) return plan;
    const q = search.toLowerCase();
    return plan
      .map((week) => ({
        ...week,
        days: week.days.filter(
          (d) =>
            d.topic.toLowerCase().includes(q) ||
            d.tasks.some((t) => t.toLowerCase().includes(q)) ||
            week.title.toLowerCase().includes(q)
        ),
      }))
      .filter((w) => w.days.length > 0);
  }, [plan, search]);

  const phasesWithWeeks = useMemo(() => {
    return phases.map((phase) => ({
      ...phase,
      weeks: filteredPlan.filter((w) => w.phase === phase.id),
    })).filter((p) => p.weeks.length > 0);
  }, [phases, filteredPlan]);

  function togglePhase(phaseId) {
    setOpenPhases((prev) => {
      const next = new Set(prev);
      if (next.has(phaseId)) next.delete(phaseId);
      else next.add(phaseId);
      return next;
    });
  }

  function toggleWeek(weekNum) {
    setOpenWeeks((prev) => {
      const next = new Set(prev);
      if (next.has(weekNum)) next.delete(weekNum);
      else next.add(weekNum);
      return next;
    });
  }

  function weekDaysDone(week) {
    const done = week.days.filter((d) => progress.dayDone[`d${d._n}`]).length;
    return `${done}/${week.days.length} days`;
  }

  const totalDays = analytics?.totalPlanDays ?? getTotalPlanDays(plan);
  const totalWeeks = plan.length;
  const planStartDate = analytics?.planStartDate;

  if (loading) return <div className="loading-text">Loading roadmap…</div>;

  return (
    <div className="dashboard-section" id="roadmap">
      <div className="section-header">
        <h2>Study Roadmap</h2>
        <p className="subtitle">4–5 months · {totalDays} study days · {totalWeeks} weeks · 6 phases</p>
      </div>

      <div className="search-bar">
        <input
          type="search"
          placeholder="Search topics, tasks, weeks…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {!phasesWithWeeks.length ? (
        <div className="empty-state">No results for &quot;{search}&quot;</div>
      ) : (
        phasesWithWeeks.map((phase) => {
          const phaseOpen = openPhases.has(phase.id);
          const phaseWeeksList = phaseWeeks(filteredPlan, phase.id);
          const phaseDone = phaseWeeksList.every((w) => weekDone(w, progress.dayDone));
          const phaseProgressPct = phaseWeeksList.length
            ? Math.round(
                (phaseWeeksList.filter((w) => weekDone(w, progress.dayDone)).length / phaseWeeksList.length) * 100
              )
            : 0;

          return (
            <div key={phase.id} className={`phase-accordion ${phaseOpen ? 'open' : ''}`}>
              <div className="phase-accordion-header" onClick={() => togglePhase(phase.id)}>
                <div>
                  <div className="phase-accordion-title">
                    {phase.label} · {phase.sub}
                    {phaseDone && ' ✓'}
                  </div>
                  <div className="phase-accordion-meta">{phaseWeeksList.length} weeks · {phaseProgressPct}% complete</div>
                </div>
                <span className="phase-accordion-chevron">⌄</span>
              </div>

              <AnimatePresence initial={false}>
                {phaseOpen && (
                  <motion.div
                    className="phase-accordion-body"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    style={{ overflow: 'hidden' }}
                  >
                    {phaseWeeksList.map((week) => (
                      <WeekCard
                        key={week.w}
                        week={week}
                        isOpen={openWeeks.has(week.w)}
                        checked={progress.checked}
                        dayDone={progress.dayDone}
                        bookmarks={progress.bookmarks}
                        daysDoneLabel={weekDaysDone(week)}
                        planStartDate={planStartDate}
                        totalPlanDays={totalDays}
                        onToggleWeek={toggleWeek}
                        onToggleCheck={toggleCheck}
                        onToggleDayDone={toggleDayDone}
                        onToggleBookmark={toggleBookmark}
                      />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })
      )}
    </div>
  );
}
