import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import * as Sentry from '@sentry/react'
import App from './App.jsx'

Sentry.init({
  dsn: 'https://6fcf4441be26507d94fa186dbee8c820@o173775.ingest.us.sentry.io/4511310158692352',
  integrations: [Sentry.browserTracingIntegration()],
  tracesSampleRate: 0.2,
  enabled: !import.meta.env.DEV,
})

// When a new service worker takes control (autoUpdate + skipWaiting), the
// currently loaded index.html still references old chunk hashes that are no
// longer in the new precache. Reload so the page gets the fresh bundle.
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    window.location.reload()
  })
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
