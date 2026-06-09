import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useProgress } from '../context/ProgressContext';

export function useSelectedDay() {
  const location = useLocation();
  const { analytics, loading, ensureDailyNote } = useProgress();
  const [selectedDayNum, setSelectedDayNum] = useState(null);

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

  const activeDay = selectedDayNum ?? analytics?.scheduledToday ?? analytics?.currentDayNum ?? null;

  return { analytics, loading, activeDay, handleSelectDay, ensureDailyNote };
}
