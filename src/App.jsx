import { Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProgressProvider } from './context/ProgressContext';
import { ThemeProvider } from './context/ThemeContext';
import AppLayout from './layouts/AppLayout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import BookmarksPage from './pages/BookmarksPage';
import SettingsPage from './pages/SettingsPage';
import { Routes, Route } from 'react-router-dom';

function HashRedirect({ hash }) {
  return <Navigate to={{ pathname: '/', hash }} replace />;
}

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="loading-text">Loading…</div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="loading-text">Loading…</div>;
  if (isAuthenticated) return <Navigate to="/" replace />;
  return children;
}

function AppShell() {
  return (
    <ProgressProvider>
      <ThemeProvider>
        <AppLayout />
      </ThemeProvider>
    </ProgressProvider>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
      <Route element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
        <Route index element={<DashboardPage />} />
        <Route path="roadmap" element={<HashRedirect hash="roadmap" />} />
        <Route path="progress" element={<HashRedirect hash="progress" />} />
        <Route path="bookmarks" element={<BookmarksPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="today" element={<Navigate to="/" replace />} />
        <Route path="calendar" element={<Navigate to="/" replace />} />
        <Route path="stats" element={<HashRedirect hash="progress" />} />
        <Route path="plan" element={<HashRedirect hash="roadmap" />} />
        <Route path="lists" element={<HashRedirect hash="roadmap" />} />
        <Route path="search" element={<HashRedirect hash="roadmap" />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
