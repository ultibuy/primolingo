<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into PrimoLingo. Here is a summary of every change made:

- **`src/services/analytics.js`** — Added `defaults: '2026-01-30'` to the PostHog init options (recommended baseline config).
- **`src/main.jsx`** — Imported `posthog` from the analytics service and `PostHogProvider` from `@posthog/react`. Wrapped `<App />` in `<PostHogProvider client={posthog}>` so the PostHog context is available throughout the app.
- **`src/pages/LandingPageV5.jsx`** — Added `posthog.capture('landing_cta_clicked', { location })` to all three CTA buttons (nav, hero, final section), tracking which part of the page drives sign-ups.
- **`src/pages/LoginPage.jsx`** — Added `posthog.capture('login_attempted')` before the Google sign-in call and `posthog.capture('login_failed', { error_code })` in the error handler.
- **`src/pages/ChildSetup.jsx`** — Added `posthog.capture('child_profile_created', { child_id, avatar })` on successful child creation, and `posthog.capture('child_profile_updated', { child_id, avatar })` on successful profile edit. Child names are intentionally excluded (RGPD / protection des mineurs).
- **`src/pages/ChildApp.jsx`** — Added five event captures covering the core game loop:
  - `quiz_session_started` (rule_id, rule_title, mode) in `handlePlay`
  - `quiz_session_completed` (rule_id, score, total, accuracy, mode) in `handleQuizFinish`
  - `dictee_session_started` (dictee_id, level) in `handleDicteePlay`
  - `dictee_session_completed` (dictee_id, level, score, total) in `handleDicteeFinish`
  - `shop_item_purchased` (item_id, cost) in `handlePurchase`
- **`src/pages/ParentDashboard.jsx`** — Added `posthog.capture('child_play_launched', { child_id })` on the "Jouer" button in `ChildCard`, and `posthog.capture('parent_signed_out')` in `handleSignOut`.
- **`orthographe-app/.env`** — Confirmed `VITE_POSTHOG_KEY` and `VITE_POSTHOG_HOST` are set with the correct EU project values.
- **`package.json`** — `@posthog/react` installed as a production dependency.

User identification and session reset were already in place in `AuthContext.jsx` (`posthog.identify()` on login, `posthog.reset()` on sign-out) — no changes needed there.

## Tracked events

| Event | Description | File |
|---|---|---|
| `landing_cta_clicked` | User clicks a CTA button on the landing page (nav / hero / final section) | `src/pages/LandingPageV5.jsx` |
| `login_attempted` | User clicks the Google sign-in button | `src/pages/LoginPage.jsx` |
| `login_failed` | Google sign-in failed with an error | `src/pages/LoginPage.jsx` |
| `child_profile_created` | Parent successfully creates a new child profile | `src/pages/ChildSetup.jsx` |
| `child_profile_updated` | Parent successfully updates an existing child profile | `src/pages/ChildSetup.jsx` |
| `quiz_session_started` | Child starts a grammar quiz session | `src/pages/ChildApp.jsx` |
| `quiz_session_completed` | Child finishes a grammar quiz session with score & accuracy | `src/pages/ChildApp.jsx` |
| `dictee_session_started` | Child starts a dictée session | `src/pages/ChildApp.jsx` |
| `dictee_session_completed` | Child finishes a dictée session with score | `src/pages/ChildApp.jsx` |
| `shop_item_purchased` | Child spends coins to purchase a shop item | `src/pages/ChildApp.jsx` |
| `child_play_launched` | Parent clicks "Jouer" to start a child's game session | `src/pages/ParentDashboard.jsx` |
| `parent_signed_out` | Parent signs out of the application | `src/pages/ParentDashboard.jsx` |

## Next steps

We've built a dashboard and five insights to track key user behaviors:

- **Dashboard — Analytics basics**: https://eu.posthog.com/project/170930/dashboard/656556
- **Acquisition funnel** (Landing → Login → Child created → Quiz): https://eu.posthog.com/project/170930/insights/xDkg4nTI
- **Daily quiz & dictée sessions completed**: https://eu.posthog.com/project/170930/insights/4O5YfuS2
- **Quiz accuracy over time** (avg % per day): https://eu.posthog.com/project/170930/insights/sbIZ2ivQ
- **Shop purchases by item**: https://eu.posthog.com/project/170930/insights/5HeF22Ol
- **Login success vs failure rate**: https://eu.posthog.com/project/170930/insights/fB3Ob8tw

### Agent skill

We've left an agent skill folder in your project. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
