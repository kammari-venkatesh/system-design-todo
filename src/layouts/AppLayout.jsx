import { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: '◻', end: true },
  { to: '/roadmap', label: 'Roadmap', icon: '☰', end: false },
  { to: '/progress', label: 'Progress', icon: '◉', end: false },
  { to: '/bookmarks', label: 'Bookmarks', icon: '★', end: false },
  { to: '/settings', label: 'Settings', icon: '⚙', end: false },
];

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    function onKey(e) {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === 'd') navigate('/');
      if (e.key === 'r') navigate('/roadmap');
      if (e.key === 'p') navigate('/progress');
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [navigate]);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const initials = user?.name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || '?';

  return (
    <div className="app-shell">
      <div className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`} onClick={() => setSidebarOpen(false)} />

      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <h2>Study Plan</h2>
          <span>System Design</span>
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to + item.label}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <span className="sidebar-link-icon">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">{initials} · {user?.name}</div>
          <button className="sidebar-logout" onClick={handleLogout}>Log out</button>
        </div>
      </aside>

      <div className="app-body">
        <header className="mobile-header">
          <button className="menu-btn" onClick={() => setSidebarOpen(true)} aria-label="Menu">☰</button>
          <strong style={{ color: 'var(--primary)' }}>Study Plan</strong>
          <span style={{ width: 36 }} />
        </header>

        <main className="app-main">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              className="page-transition"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
