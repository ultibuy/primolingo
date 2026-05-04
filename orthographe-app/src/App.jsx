import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import OfflineBanner from './components/OfflineBanner.jsx';
import UpdateBanner from './components/UpdateBanner.jsx';
import { router } from './router.jsx';
import posthog from './services/analytics.js';
import './index.css';

// Track pageviews on every React Router navigation (SPA)
router.subscribe((state) => {
  if (state.navigation.state === 'idle') {
    posthog.capture('$pageview', { $current_url: window.location.href });
  }
});

export default function App() {
  return (
    <ErrorBoundary>
      <OfflineBanner />
      <UpdateBanner />
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ErrorBoundary>
  );
}
