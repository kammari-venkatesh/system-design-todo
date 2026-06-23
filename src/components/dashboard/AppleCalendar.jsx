import { useState } from 'react';
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  isSameMonth, addMonths, subMonths, startOfWeek, endOfWeek, isToday,
} from 'date-fns';
import { planDayForDate } from '../../utils/schedule';

export default function AppleCalendar({
  heatmap = {},
  allDays = [],
  planStartDate,
  dayDone = {},
  totalPlanDays,
  selectedDateKey,
  onSelectDay,
}) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const totalDays = totalPlanDays ?? allDays.length;
  const today = new Date();

  const dayByNum = Object.fromEntries(allDays.map((d) => [d._n, d]));

  function getStatusForDate(date) {
    const key = format(date, 'yyyy-MM-dd');
    const entry = heatmap[key];
    if (!entry) return 'none';
    if (dayDone[`d${entry.dayNum}`] || entry.progress >= 100) return 'completed';
    if (entry.progress > 0) return 'partial';
    const day = dayByNum[entry.dayNum];
    if (day?.status === 'completed') return 'completed';
    if (day?.status === 'partial') return 'partial';
    return 'none';
  }

  function studyDayForDate(date) {
    const key = format(date, 'yyyy-MM-dd');
    if (heatmap[key]) return heatmap[key].dayNum;
    return planDayForDate(date, planStartDate, dayDone, totalDays, today);
  }

  function handleDayClick(date) {
    if (!planStartDate) return;
    const dayNum = studyDayForDate(date);
    if (dayNum) onSelectDay(dayNum, date);
  }

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calStart = startOfWeek(monthStart);
  const calEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  return (
    <div className="card apple-cal">
      <div className="apple-cal-header">
        <h2>{format(currentMonth, 'MMMM yyyy')}</h2>
        <div className="apple-cal-nav">
          <button type="button" className="btn-secondary" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>←</button>
          <button type="button" className="btn-secondary" onClick={() => setCurrentMonth(new Date())}>Today</button>
          <button type="button" className="btn-secondary" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>→</button>
        </div>
      </div>

      {planStartDate && (
        <p className="subtitle" style={{ marginBottom: 16 }}>
          Day 1 starts {format(new Date(planStartDate), 'EEE, MMM d, yyyy')}
          {' · '}
          Incomplete days repeat on the next study day until marked complete
        </p>
      )}

      <div className="apple-cal-grid">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
          <div key={d} className="apple-cal-dow">{d}</div>
        ))}
        {days.map((date) => {
          const key = format(date, 'yyyy-MM-dd');
          const status = getStatusForDate(date);
          const entry = heatmap[key];
          const assignedDay = studyDayForDate(date);
          const isStudyDay = !!assignedDay;
          const isTodayDate = isToday(date);
          const isSelected = selectedDateKey === key;
          const classes = [
            'apple-cal-day',
            status,
            !isSameMonth(date, currentMonth) ? 'other-month' : '',
            isTodayDate ? 'today' : '',
            isSelected ? 'selected' : '',
            !isStudyDay ? 'no-study' : '',
          ].filter(Boolean).join(' ');

          return (
            <button
              key={key}
              type="button"
              className={classes}
              onClick={() => handleDayClick(date)}
              disabled={!isStudyDay}
              title={
                entry
                  ? `Day ${entry.dayNum}: ${entry.topic}`
                  : isStudyDay
                    ? `Day ${assignedDay}`
                    : 'No study (Sunday or outside plan)'
              }
            >
              <span className="apple-cal-day-num">{format(date, 'd')}</span>
              {isStudyDay && (
                <span className="apple-cal-study-day">D{entry?.dayNum ?? assignedDay}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
