import posthog from 'posthog-js';

posthog.init(import.meta.env.VITE_POSTHOG_KEY, {
  api_host: import.meta.env.VITE_POSTHOG_HOST || 'https://eu.i.posthog.com',
  defaults: '2026-01-30',
  person_profiles: 'identified_only',
  capture_pageview: false, // géré via router.subscribe dans App.jsx (SPA)
  capture_pageleave: true,
});

export default posthog;
