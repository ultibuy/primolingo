import { useState, useEffect } from 'react';

export default function OfflineBanner() {
  const [offline, setOffline] = useState(!navigator.onLine);
  const [showRecovery, setShowRecovery] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const goOffline = () => { setOffline(true); setDismissed(false); };
    const goOnline = () => {
      setOffline(false);
      setDismissed(false);
      setShowRecovery(true);
      setTimeout(() => setShowRecovery(false), 4000);
    };
    window.addEventListener('offline', goOffline);
    window.addEventListener('online', goOnline);
    return () => {
      window.removeEventListener('offline', goOffline);
      window.removeEventListener('online', goOnline);
    };
  }, []);

  if ((!offline && !showRecovery) || (offline && dismissed)) return null;

  const isOffline = offline && !showRecovery;

  return (
    <div style={{
      position: 'fixed',
      top: 12,
      left: 12,
      right: 12,
      zIndex: 9999,
      padding: '14px 16px',
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      fontFamily: 'Outfit, sans-serif',
      background: isOffline
        ? 'rgba(30, 30, 46, 0.92)'
        : 'rgba(20, 60, 30, 0.92)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      border: `1px solid ${isOffline ? 'rgba(255,255,255,0.1)' : 'rgba(74,222,128,0.3)'}`,
      borderRadius: 14,
      color: '#fff',
      boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      animation: 'offlineToastSlide 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
    }}>
      {/* Icon */}
      <div style={{
        width: 40, height: 40, borderRadius: 10, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: isOffline ? 'rgba(255,255,255,0.08)' : 'rgba(74,222,128,0.15)',
      }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={isOffline ? '#9ca3af' : '#4ade80'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {isOffline ? (<>
            <path d="M1 1l22 22"/>
            <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"/>
            <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"/>
            <path d="M10.71 5.05A16 16 0 0 1 22.56 9"/>
            <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"/>
            <path d="M8.53 16.11a6 6 0 0 1 6.95 0"/>
            <circle cx="12" cy="20" r="1"/>
          </>) : (<>
            <path d="M5 12.55a11 11 0 0 1 14.08 0"/>
            <path d="M1.42 9a16 16 0 0 1 21.16 0"/>
            <path d="M8.53 16.11a6 6 0 0 1 6.95 0"/>
            <circle cx="12" cy="20" r="1"/>
          </>)}
        </svg>
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '0.88rem', fontWeight: 800, marginBottom: 2 }}>
          {isOffline ? 'Hors connexion' : 'De retour en ligne !'}
        </div>
        <div style={{ fontSize: '0.78rem', color: isOffline ? '#9ca3af' : '#86efac', lineHeight: 1.4 }}>
          {isOffline
            ? 'Ta progression sera synchronisée à la reconnexion'
            : 'Ta progression est synchronisée'}
        </div>
      </div>

      {/* Status indicator / dots */}
      {isOffline ? (
        <div style={{ display: 'flex', gap: 4, flexShrink: 0, alignItems: 'center' }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              width: 6, height: 6, borderRadius: '50%',
              background: 'rgba(255,255,255,0.4)',
              animation: `offlineDot 1.4s ease-in-out ${i * 0.2}s infinite`,
            }} />
          ))}
        </div>
      ) : (
        <div style={{
          padding: '4px 10px', borderRadius: 8, flexShrink: 0,
          background: 'rgba(74,222,128,0.2)',
          border: '1px solid rgba(74,222,128,0.3)',
          fontSize: '0.75rem', fontWeight: 700, color: '#4ade80',
        }}>
          ✓ Synced
        </div>
      )}

      {/* Close */}
      <button
        onClick={() => setDismissed(true)}
        style={{
          background: 'none', border: 'none',
          color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem',
          cursor: 'pointer', padding: 0, lineHeight: 1, flexShrink: 0,
        }}
      >
        ✕
      </button>

      <style>{`
        @keyframes offlineToastSlide {
          from { transform: translateY(-20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes offlineDot {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
