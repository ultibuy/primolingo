import { createBrowserRouter, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext.jsx';
import LandingPage from './pages/LandingPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import ParentDashboard from './pages/ParentDashboard.jsx';
import ChildSetup from './pages/ChildSetup.jsx';
import ChildApp from './pages/ChildApp.jsx';
import LegalPage from './pages/LegalPage.jsx';

// ProtectedRoute: redirects to /login if not authenticated
function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

// PublicOnlyRoute: redirects to /parent if already authenticated
function PublicOnlyRoute({ children }) {
  const { user } = useAuth();
  if (user) return <Navigate to="/parent" replace />;
  return children;
}

export { ProtectedRoute, PublicOnlyRoute };

// eslint-disable-next-line react-refresh/only-export-components
export const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/login',
    element: (
      <PublicOnlyRoute>
        <LoginPage />
      </PublicOnlyRoute>
    ),
  },
  {
    path: '/parent',
    element: (
      <ProtectedRoute>
        <ParentDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: '/parent/child/new',
    element: (
      <ProtectedRoute>
        <ChildSetup />
      </ProtectedRoute>
    ),
  },
  {
    path: '/parent/child/:childId/edit',
    element: (
      <ProtectedRoute>
        <ChildSetup />
      </ProtectedRoute>
    ),
  },
  {
    path: '/play/:childId',
    element: (
      <ProtectedRoute>
        <ChildApp />
      </ProtectedRoute>
    ),
  },
  {
    path: '/legal',
    element: <LegalPage />,
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
