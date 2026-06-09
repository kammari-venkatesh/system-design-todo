import { addDays, startOfDay, format, parseISO, isSunday } from 'date-fns';

/** Next Monday on or after `from`. If today is Monday, returns today. */
export function computePlanStartDate(from = new Date()) {
  const today = startOfDay(from);
  const dow = today.getDay(); // 0=Sun, 1=Mon, ...
  if (dow === 1) return today;
  if (dow === 0) return addDays(today, 1);
  return addDays(today, 8 - dow);
}

export function dayNumToDate(dayNum, planStart) {
  const start = startOfDay(typeof planStart === 'string' ? parseISO(planStart) : planStart);
  if (dayNum <= 1) return start;
  let date = start;
  let count = 1;
  while (count < dayNum) {
    date = addDays(date, 1);
    if (!isSunday(date)) count += 1;
  }
  return date;
}

export function dateToDayNum(date, planStart) {
  const start = startOfDay(typeof planStart === 'string' ? parseISO(planStart) : planStart);
  const target = startOfDay(date);
  if (target < start) return null;
  if (isSunday(target)) return null;

  let current = start;
  let num = 1;
  while (current < target) {
    current = addDays(current, 1);
    if (!isSunday(current)) num += 1;
    if (num > 120) return null;
  }
  return num;
}

/** Build dateKey → { dayNum, topic, progress, status } for calendar (Mon–Sat schedule). */
export function buildScheduleMap(allDays, planStart, checked = {}, dayDone = {}) {
  if (!planStart || !allDays?.length) return {};
  const map = {};
  allDays.forEach((day) => {
    const date = dayNumToDate(day._n, planStart);
    const key = format(date, 'yyyy-MM-dd');
    const done = dayDone[`d${day._n}`];
    let progress = 0;
    if (done) {
      progress = 100;
    } else if (day.tasks?.length) {
      const checkedTasks = day.tasks.filter((_, i) => checked[`${day._n}_${i}`]).length;
      progress = Math.round((checkedTasks / day.tasks.length) * 100);
    }
    let status = 'not_started';
    if (done || day.status === 'completed') status = 'completed';
    else if (progress > 0 || day.status === 'partial') status = 'partial';

    map[key] = {
      dayNum: day._n,
      topic: day.topic,
      progress,
      status,
      studyMinutes: day.studyMinutes ?? 0,
    };
  });
  return map;
}

export function getTodayStudyDayNum(planStart) {
  const today = startOfDay(new Date());
  return dateToDayNum(today, planStart);
}
