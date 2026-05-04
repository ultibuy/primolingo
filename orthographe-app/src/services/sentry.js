let sentryPromise = null;
let initialized = false;

function sanitizeEvent(event) {
  if (event.message) {
    event.message = event.message
      .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[EMAIL]');
  }
  return event;
}

function loadSentry() {
  if (import.meta.env.DEV) return Promise.resolve(null);
  if (!sentryPromise) {
    sentryPromise = import('@sentry/react').then((Sentry) => {
      if (!initialized) {
        Sentry.init({
          dsn: 'https://6fcf4441be26507d94fa186dbee8c820@o173775.ingest.us.sentry.io/4511310158692352',
          integrations: [Sentry.browserTracingIntegration()],
          tracesSampleRate: 0.2,
          enabled: true,
          environment: 'production',
          beforeSend: sanitizeEvent,
        });
        initialized = true;
      }
      return Sentry;
    });
  }
  return sentryPromise;
}

export function initSentryWhenIdle() {
  if (import.meta.env.DEV || typeof window === 'undefined') return;
  window.setTimeout(() => {
    loadSentry().catch(() => {});
  }, 8000);
}

export function captureException(error, context) {
  console.error(error);
  loadSentry()
    .then((Sentry) => {
      if (Sentry) Sentry.captureException(error, context);
    })
    .catch(() => {});
}
