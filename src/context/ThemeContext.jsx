import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useProgress } from './ProgressContext';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const { progress, updateProgress } = useProgress();
  const [darkMode, setDarkMode] = useState(() => {
    const stored = localStorage.getItem('sd_dark_mode');
    if (stored !== null) return stored === 'true';
    return progress.settings?.darkMode || false;
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    localStorage.setItem('sd_dark_mode', String(darkMode));
  }, [darkMode]);

  useEffect(() => {
    if (progress.settings?.darkMode !== undefined && progress.settings.darkMode !== darkMode) {
      setDarkMode(progress.settings.darkMode);
    }
  }, [progress.settings?.darkMode]);

  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const next = !prev;
      updateProgress({ settings: { darkMode: next } });
      return next;
    });
  };

  const value = useMemo(() => ({ darkMode, toggleDarkMode }), [darkMode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
