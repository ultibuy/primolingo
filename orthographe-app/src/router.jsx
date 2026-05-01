import { lazy, Suspense, useEffect } from 'react';
import { createBrowserRouter, Navigate, useRouteError } from 'react-router-dom';
import * as Sentry from '@sentry/react';
import { useAuth } from './contexts/AuthContext.jsx';

// ---------------------------------------------------------------------------
// lazyWithRetry — reloads the page once on chunk load failure (stale cache
// after a new deploy). Uses sessionStorage to avoid infinite reload loops.
// ---------------------------------------------------------------------------
function lazyWithRetry(importFn) {
  return lazy(() =>
    importFn().catch((err) => {
      const key = 'chunk_reload_attempted';
      if (!sessionStorage.getItem(key)) {
        sessionStorage.setItem(key, '1');
        window.location.reload();
        return new Promise(() => {}); // suspend while reloading
      }
      throw err; // second failure → propagate to error boundary
    })
  );
}

const LandingPage = lazyWithRetry(() => import('./pages/LandingPage.jsx'));
const LandingPageV1 = lazyWithRetry(() => import('./pages/LandingPageV1.jsx'));
const LandingPageV2 = lazyWithRetry(() => import('./pages/LandingPageV2.jsx'));
const LandingPageV3 = lazyWithRetry(() => import('./pages/LandingPageV3.jsx'));
const LoginPage = lazyWithRetry(() => import('./pages/LoginPage.jsx'));
const ParentDashboard = lazyWithRetry(() => import('./pages/ParentDashboard.jsx'));
const ChildSetup = lazyWithRetry(() => import('./pages/ChildSetup.jsx'));
const ChildApp = lazyWithRetry(() => import('./pages/ChildApp.jsx'));
const LegalPage = lazyWithRetry(() => import('./pages/LegalPage.jsx'));

function LazyPage({ children }) {
  return (
    <Suspense fallback={<div style={routeLoadingStyle}>Chargement...</div>}>
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
    if (error) Sentry.captureException(error);
  }, [error]);

  return (
    <div style={errorPageStyle}>
      <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>😕</div>
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
    element: <LazyPage><LandingPage /></LazyPage>,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: '/v1',
    element: <LazyPage><LandingPageV1 /></LazyPage>,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: '/v2',
    element: <LazyPage><LandingPageV2 /></LazyPage>,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: '/v3',
    element: <LazyPage><LandingPageV3 /></LazyPage>,
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
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);

const routeLoadingStyle = {
  minHeight: '100vh',
  display: 'grid',
  placeItems: 'center',
  background: '#101827',
  color: '#e5e7eb',
  fontFamily: 'Plus Jakarta Sans, sans-serif',
  fontWeight: 800,
};

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
  background: 'linear-gradient(135deg, #7c3aed, #a78bfa)',
  color: '#fff',
  border: 'none',
  borderRadius: 12,
  padding: '0.75rem 1.5rem',
  fontWeight: 800,
  fontSize: '0.95rem',
  cursor: 'pointer',
};
