/* global __APP_VERSION__ */
import { useState, useEffect } from 'react';

/**
 * Detects when a new Service Worker is waiting (= new version deployed)
 * and shows a banner prompting the user to reload.
 * Also checks on visibility change (user switches back to the tab/app).
 */
export default function UpdateBanner() {
  const [waiting, setWaiting] = useState(false);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return undefined;

    let cancelled = false;

    // Check if a SW is already waiting right now
    const checkWaiting = (reg) => {
      if (cancelled) return;
      if (reg.waiting && reg.active) setWaiting(true);
    };

    // Listen for new SW arriving
    const onUpdate = (reg) => {
      if (cancelled) return;
      if (reg.installing) {
        reg.installing.addEventListener('statechange', (e) => {
          if (e.target.state === 'installed' && reg.active) setWaiting(true);
        });
      }
    };

    navigator.serviceWorker.getRegistration().then((reg) => {
      if (!reg || cancelled) return;
      checkWaiting(reg);
      reg.addEventListener('updatefound', () => onUpdate(reg));

      // Re-check for updates when user comes back to the app
      const onVisibility = () => {
        if (document.visibilityState === 'visible') reg.update().catch(() => {});
      };
      document.addEventListener('visibilitychange', onVisibility);
      // Store cleanup ref
      reg.__cleanupVisibility = () => document.removeEventListener('visibilitychange', onVisibility);
    });

    return () => {
      cancelled = true;
      navigator.serviceWorker.getRegistration().then((reg) => {
        if (reg?.__cleanupVisibility) reg.__cleanupVisibility();
      });
    };
  }, []);

  const handleReload = () => {
    navigator.serviceWorker.getRegistration().then((reg) => {
      if (reg?.waiting) {
        reg.waiting.postMessage({ type: 'SKIP_WAITING' });
      }
      // Reload after a brief delay to let the SW activate
      setTimeout(() => window.location.reload(), 300);
    });
  };

  if (!waiting) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: 16,
      left: 12,
      right: 12,
      zIndex: 9999,
      padding: '14px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      fontFamily: 'Outfit, sans-serif',
      background: 'rgba(30, 30, 60, 0.95)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      border: '1px solid rgba(96,165,250,0.3)',
      borderRadius: 14,
      color: '#fff',
      boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      animation: 'updateBannerSlide 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
    }}>
      {/* Icon */}
      <div style={{
        width: 40, height: 40, borderRadius: 10, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(96,165,250,0.15)',
      }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 2v6h-6"/>
          <path d="M3 12a9 9 0 0 1 15-6.7L21 8"/>
          <path d="M3 22v-6h6"/>
          <path d="M21 12a9 9 0 0 1-15 6.7L3 16"/>
        </svg>
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '0.88rem', fontWeight: 800, marginBottom: 2 }}>
          Nouvelle version disponible
        </div>
        <div style={{ fontSize: '0.78rem', color: '#93c5fd', lineHeight: 1.4 }}>
          Recharge pour profiter des dernières améliorations · v{__APP_VERSION__}
        </div>
      </div>

      {/* Reload button */}
      <button
        onClick={handleReload}
        style={{
          padding: '8px 16px', borderRadius: 10, flexShrink: 0,
          background: 'rgba(96,165,250,0.2)',
          border: '1px solid rgba(96,165,250,0.4)',
          fontSize: '0.82rem', fontWeight: 700, color: '#60a5fa',
          cursor: 'pointer',
        }}
      >
        Recharger
      </button>

      <style>{`
        @keyframes updateBannerSlide {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
