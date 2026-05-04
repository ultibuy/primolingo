import { lazy, Suspense, useEffect } from 'react';
import { createBrowserRouter, Navigate, useRouteError } from 'react-router-dom';
import { WarningIcon } from './components/icons/ProductIcons.jsx';
import { useAuth } from './contexts/AuthContext.jsx';
import AppLoadingScreen from './components/AppLoadingScreen.jsx';
import { captureException } from './services/sentry.js';

// ---------------------------------------------------------------------------
// lazyWithRetry — reloads the page once on chunk load failure (stale cache
// after a new deploy). Uses sessionStorage to avoid infinite reload loops.
// ---------------------------------------------------------------------------
function lazyWithRetry(importFn) {
  const key = 'chunk_reload_attempted';
  return lazy(() =>
    importFn().then((module) => {
      sessionStorage.removeItem(key);
      return module;
    }).catch((err) => {
      if (!sessionStorage.getItem(key)) {
        sessionStorage.setItem(key, '1');
        window.location.reload();
        return new Promise(() => {}); // suspend while reloading
      }
      throw err; // second failure → propagate to error boundary
    })
  );
}

const LandingPage = lazyWithRetry(() => import('./pages/LandingPageV5.jsx'));
const LoginPage = lazyWithRetry(() => import('./pages/LoginPage.jsx'));
const ParentDashboard = lazyWithRetry(() => import('./pages/ParentDashboard.jsx'));
const ChildSetup = lazyWithRetry(() => import('./pages/ChildSetup.jsx'));
const ChildApp = lazyWithRetry(() => import('./pages/ChildApp.jsx'));
const ChildBySlug = lazyWithRetry(() => import('./pages/ChildBySlug.jsx'));
const LegalPage = lazyWithRetry(() => import('./pages/LegalPage.jsx'));
const RulesIndexPage = lazyWithRetry(() => import('./pages/RulesIndexPage.jsx'));
const RulePage = lazyWithRetry(() => import('./pages/RulePage.jsx'));
const DebugEndScreenPage = import.meta.env.DEV ? lazyWithRetry(() => import('./pages/DebugEndScreenPage.jsx')) : null;
const DebugShopPage = import.meta.env.DEV ? lazyWithRetry(() => import('./pages/DebugShopPage.jsx')) : null;
const DebugRewardPage = import.meta.env.DEV ? lazyWithRetry(() => import('./pages/DebugRewardPage.jsx')) : null;
const DebugAllMoodsPage = import.meta.env.DEV ? lazyWithRetry(() => import('./pages/DebugAllMoodsPage.jsx')) : null;

function LazyPage({ children }) {
  return (
    <Suspense fallback={<AppLoadingScreen />}>
      {children}
    </Suspense>
  );
}

// ---------------------------------------------------------------------------
// RouteErrorBoundary — reports route errors to Sentry then shows a friendly
// message instead of React Router's raw "Unexpected Application Error!".
// ---------------------------------------------------------------------------
function RouteErrorBoundary() {
  const error = useRouteError();

  useEffect(() => {
    if (error) captureException(error);
  }, [error]);

  return (
    <div style={errorPageStyle}>
      <div style={{ marginBottom: '1rem' }}><WarningIcon size={48} color="var(--color-orange)" /></div>
      <h1 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
        Une erreur est survenue
      </h1>
      <p style={{ color: '#9ca3af', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
        La page n'a pas pu se charger. Vérifie ta connexion et réessaie.
      </p>
      <button
        onClick={() => window.location.href = '/'}
        style={retryButtonStyle}
      >
        Retour à l'accueil
      </button>
    </div>
  );
}

// ProtectedRoute: redirects to /login if not authenticated
function ProtectedRoute({ children }) {
  const { user, loading, authReady, ensureAuth } = useAuth();

  useEffect(() => {
    ensureAuth();
  }, [ensureAuth]);

  if (loading || !authReady) return <AppLoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

// PublicOnlyRoute: redirects to /parent if already authenticated
function PublicOnlyRoute({ children }) {
  const { user, authReady, ensureAuth } = useAuth();

  useEffect(() => {
    ensureAuth();
  }, [ensureAuth]);

  if (authReady && user) return <Navigate to="/parent" replace />;
  return children;
}

export { ProtectedRoute, PublicOnlyRoute };

// eslint-disable-next-line react-refresh/only-export-components
export const router = createBrowserRouter([
  {
    path: '/',
    element: <LazyPage><LandingPage /></LazyPage>,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: '/login',
    element: (
      <PublicOnlyRoute>
        <LazyPage><LoginPage /></LazyPage>
      </PublicOnlyRoute>
    ),
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: '/parent',
    element: (
      <ProtectedRoute>
        <LazyPage><ParentDashboard /></LazyPage>
      </ProtectedRoute>
    ),
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: '/parent/child/new',
    element: (
      <ProtectedRoute>
        <LazyPage><ChildSetup /></LazyPage>
      </ProtectedRoute>
    ),
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: '/parent/child/:childId/edit',
    element: (
      <ProtectedRoute>
        <LazyPage><ChildSetup /></LazyPage>
      </ProtectedRoute>
    ),
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: '/enfant/:childSlug',
    element: (
      <ProtectedRoute>
        <LazyPage><ChildBySlug /></LazyPage>
      </ProtectedRoute>
    ),
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: '/play/:childId',
    element: (
      <ProtectedRoute>
        <LazyPage><ChildApp /></LazyPage>
      </ProtectedRoute>
    ),
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: '/legal',
    element: <LazyPage><LegalPage /></LazyPage>,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: '/regles',
    element: <LazyPage><RulesIndexPage /></LazyPage>,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: '/regles/:ruleId',
    element: <LazyPage><RulePage /></LazyPage>,
    errorElement: <RouteErrorBoundary />,
  },
  // Debug routes — dev only, tree-shaken in prod
  ...(DebugEndScreenPage ? [
    { path: '/debug/end-screen', element: <LazyPage><DebugEndScreenPage /></LazyPage>, errorElement: <RouteErrorBoundary /> },
    { path: '/debug/shop', element: <LazyPage><DebugShopPage /></LazyPage>, errorElement: <RouteErrorBoundary /> },
    { path: '/debug/reward', element: <LazyPage><DebugRewardPage /></LazyPage>, errorElement: <RouteErrorBoundary /> },
    { path: '/debug/all-moods', element: <LazyPage><DebugAllMoodsPage /></LazyPage>, errorElement: <RouteErrorBoundary /> },
  ] : []),
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);

const errorPageStyle = {
  minHeight: '100vh',
  display: 'grid',
  placeItems: 'center',
  background: '#101827',
  color: '#e5e7eb',
  fontFamily: 'Plus Jakarta Sans, sans-serif',
  textAlign: 'center',
  padding: '2rem',
};

const retryButtonStyle = {
  background: 'var(--gradient-brand)',
  color: 'var(--text-white)',
  border: 'none',
  borderRadius: 'var(--radius-pill)',
  padding: '0.75rem 1.5rem',
  fontFamily: 'var(--font-display)',
  fontWeight: 800,
  fontSize: '0.95rem',
  cursor: 'pointer',
  boxShadow: 'var(--shadow-glow)',
};
