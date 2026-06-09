import { createContext, useContext, useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { api } from '../api/client';
import { assignDayNumbers } from '../utils/planHelpers';
import {
  buildDailySummaryNote,
  buildTaskNote,
  dailyNoteId,
  taskNoteId,
  migrateLegacyDailyNote,
  migrateDayNotesToKnowledge,
} from '../utils/notesHelpers';

const ProgressContext = createContext(null);

const EMPTY = {
  checked: {},
  dayDone: {},
  dayActivity: {},
  dayNotes: {},
  knowledgeNotes: {},
  bookmarks: [],
  achievements: [],
  revisionState: {},
  settings: { darkMode: false },
};

export function ProgressProvider({ children }) {
  const [phases, setPhases] = useState([]);
  const [plan, setPlan] = useState([]);
  const [progress, setProgress] = useState(EMPTY);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notesSaveStatus, setNotesSaveStatus] = useState('idle');
  const [notesLastSavedAt, setNotesLastSavedAt] = useState(null);
  const saveTimer = useRef(null);
  const noteSaveTimer = useRef(null);

  const refreshAnalytics = useCallback(async () => {
    try {
      const data = await api.getAnalytics();
      setAnalytics(data);
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    async function load() {
      try {
        const [planData, progressData] = await Promise.all([api.getPlan(), api.getProgress()]);
        setPhases(planData.phases);
        const numberedPlan = assignDayNumbers(planData.weeks);
        setPlan(numberedPlan);

        let mergedProgress = { ...EMPTY, ...progressData };
        if (!Object.keys(mergedProgress.knowledgeNotes || {}).length && Object.keys(mergedProgress.dayNotes || {}).length) {
          const allDays = numberedPlan.flatMap((w) => w.days);
          const migrated = migrateDayNotesToKnowledge(mergedProgress.dayNotes, allDays);
          if (Object.keys(migrated).length) {
            mergedProgress = { ...mergedProgress, knowledgeNotes: migrated };
            await api.patchProgress({ knowledgeNotes: migrated });
          }
        }
        setProgress(mergedProgress);

        const analyticsData = await api.getAnalytics();
        setAnalytics(analyticsData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const persist = useCallback(
    (patch) => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(async () => {
        try {
          const updated = await api.patchProgress(patch);
          setProgress((prev) => ({ ...prev, ...updated }));
          await refreshAnalytics();
        } catch (e) {
          console.error(e);
        }
      }, 300);
    },
    [refreshAnalytics]
  );

  const updateProgress = useCallback(
    (updater) => {
      setProgress((prev) => {
        const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
        const patch = typeof updater === 'function'
          ? Object.keys(next).reduce((acc, key) => {
              if (JSON.stringify(next[key]) !== JSON.stringify(prev[key])) acc[key] = next[key];
              return acc;
            }, {})
          : updater;
        if (Object.keys(patch).length) persist(patch);
        return next;
      });
    },
    [persist]
  );

  const persistNote = useCallback((noteId, note) => {
    if (noteSaveTimer.current) clearTimeout(noteSaveTimer.current);
    setNotesSaveStatus('saving');
    noteSaveTimer.current = setTimeout(async () => {
      try {
        const updated = await api.patchProgress({ knowledgeNotes: { [noteId]: note } });
        setProgress((prev) => ({ ...prev, knowledgeNotes: updated.knowledgeNotes || prev.knowledgeNotes }));
        setNotesSaveStatus('saved');
        setNotesLastSavedAt(new Date().toISOString());
      } catch (e) {
        console.error(e);
        setNotesSaveStatus('idle');
      }
    }, 400);
  }, []);

  const upsertNote = useCallback(
    (noteId, note) => {
      setProgress((prev) => ({
        ...prev,
        knowledgeNotes: { ...prev.knowledgeNotes, [noteId]: note },
      }));
      persistNote(noteId, note);
    },
    [persistNote]
  );

  const ensureDayNotes = useCallback(
    (dayNum) => {
      const day = analytics?.allDays?.find((d) => d._n === dayNum)
        || plan.flatMap((w) => w.days).find((d) => d._n === dayNum);
      if (!day) return;

      setProgress((prev) => {
        const existing = prev.knowledgeNotes || {};
        const patch = {};

        const summaryId = dailyNoteId(dayNum);
        if (existing[summaryId]) {
          const migrated = migrateLegacyDailyNote(existing[summaryId]);
          if (migrated.summary !== existing[summaryId].summary
            || JSON.stringify(migrated.body) !== JSON.stringify(existing[summaryId].body)) {
            patch[summaryId] = migrated;
          }
        } else {
          patch[summaryId] = buildDailySummaryNote(day);
        }

        (day.tasks || []).forEach((task, i) => {
          const id = taskNoteId(dayNum, i);
          if (!existing[id]) patch[id] = buildTaskNote(day, i, task);
        });

        if (!Object.keys(patch).length) return prev;

        if (noteSaveTimer.current) clearTimeout(noteSaveTimer.current);
        setNotesSaveStatus('saving');
        noteSaveTimer.current = setTimeout(async () => {
          try {
            const updated = await api.patchProgress({ knowledgeNotes: patch });
            setProgress((p) => ({ ...p, knowledgeNotes: updated.knowledgeNotes || p.knowledgeNotes }));
            setNotesSaveStatus('saved');
            setNotesLastSavedAt(new Date().toISOString());
          } catch (e) {
            console.error(e);
            setNotesSaveStatus('idle');
          }
        }, 300);

        return { ...prev, knowledgeNotes: { ...existing, ...patch } };
      });
    },
    [analytics, plan]
  );

  const ensureDailyNote = ensureDayNotes;

  const toggleNotePin = useCallback(
    (noteId) => {
      setProgress((prev) => {
        const note = prev.knowledgeNotes?.[noteId];
        if (!note) return prev;
        const updated = { ...note, pinned: !note.pinned, updatedAt: new Date().toISOString() };
        persistNote(noteId, updated);
        return { ...prev, knowledgeNotes: { ...prev.knowledgeNotes, [noteId]: updated } };
      });
    },
    [persistNote]
  );

  const toggleNoteFavorite = useCallback(
    (noteId) => {
      setProgress((prev) => {
        const note = prev.knowledgeNotes?.[noteId];
        if (!note) return prev;
        const updated = { ...note, favorite: !note.favorite, updatedAt: new Date().toISOString() };
        persistNote(noteId, updated);
        return { ...prev, knowledgeNotes: { ...prev.knowledgeNotes, [noteId]: updated } };
      });
    },
    [persistNote]
  );

  const uploadNoteFile = useCallback((file) => api.uploadNoteFile(file), []);

  const toggleCheck = useCallback(
    (key, val, dayNum) => {
      updateProgress((prev) => {
        const checked = { ...prev.checked, [key]: val };
        const dKey = `d${dayNum}`;
        const dayActivity = {
          ...prev.dayActivity,
          [dKey]: {
            ...(prev.dayActivity[dKey] || {}),
            lastStudiedAt: new Date().toISOString(),
            studyMinutes: prev.dayActivity[dKey]?.studyMinutes || 0,
            sessions: prev.dayActivity[dKey]?.sessions || [],
          },
        };
        return { ...prev, checked, dayActivity };
      });
    },
    [updateProgress]
  );

  const toggleDayDone = useCallback(
    async (dayNum) => {
      const key = `d${dayNum}`;
      let currentlyDone = false;
      setProgress((prev) => {
        currentlyDone = !!prev.dayDone[key];
        return prev;
      });

      if (!currentlyDone) {
        setProgress((prev) => ({ ...prev, dayDone: { ...prev.dayDone, [key]: true } }));
        try {
          const result = await api.completeDay(dayNum);
          const { newAchievements, ...progressData } = result;
          setProgress({ ...EMPTY, ...progressData });
          await refreshAnalytics();
          return newAchievements || [];
        } catch (e) {
          console.error(e);
          setProgress((prev) => ({ ...prev, dayDone: { ...prev.dayDone, [key]: false } }));
          return [];
        }
      }

      setProgress((prev) => ({ ...prev, dayDone: { ...prev.dayDone, [key]: false } }));
      try {
        const updated = await api.patchProgress({ dayDone: { [key]: false } });
        setProgress({ ...EMPTY, ...updated });
        await refreshAnalytics();
      } catch (e) {
        console.error(e);
        setProgress((prev) => ({ ...prev, dayDone: { ...prev.dayDone, [key]: true } }));
      }
      return [];
    },
    [refreshAnalytics]
  );

  const toggleBookmark = useCallback(
    (dayNum) => {
      updateProgress((prev) => {
        const bookmarks = prev.bookmarks || [];
        const exists = bookmarks.includes(dayNum);
        return {
          ...prev,
          bookmarks: exists ? bookmarks.filter((b) => b !== dayNum) : [...bookmarks, dayNum],
        };
      });
    },
    [updateProgress]
  );

  const value = useMemo(
    () => ({
      phases,
      plan,
      progress,
      analytics,
      loading,
      error,
      toggleCheck,
      toggleDayDone,
      toggleBookmark,
      refreshAnalytics,
      updateProgress,
      upsertNote,
      ensureDailyNote,
      ensureDayNotes,
      toggleNotePin,
      toggleNoteFavorite,
      uploadNoteFile,
      notesSaveStatus,
      notesLastSavedAt,
    }),
    [
      phases, plan, progress, analytics, loading, error,
      toggleCheck, toggleDayDone, toggleBookmark, refreshAnalytics, updateProgress,
      upsertNote, ensureDailyNote, ensureDayNotes, toggleNotePin, toggleNoteFavorite, uploadNoteFile,
      notesSaveStatus, notesLastSavedAt,
    ]
  );

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error('useProgress must be used within ProgressProvider');
  return ctx;
}
