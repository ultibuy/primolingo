/* global __APP_VERSION__ */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { captureException, initSentryWhenIdle } from './services/sentry.js'
import posthog from './services/analytics.js'
import { PostHogProvider } from '@posthog/react'

initSentryWhenIdle()

// Log build version
console.log(`PrimoLingo v${__APP_VERSION__}`)

// Catch unhandled promise rejections (async errors outside try/catch)
window.addEventListener('unhandledrejection', (event) => {
  captureException(event.reason);
})

// Chunk-level retry in router.jsx handles stale deploy assets. Avoid reloading
// on every service-worker controller change; that created duplicate loading
// screens after deploys.

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <PostHogProvider client={posthog}>
      <App />
    </PostHogProvider>
  </StrictMode>,
)
