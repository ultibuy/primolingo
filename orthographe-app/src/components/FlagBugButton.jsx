import { useState } from 'react';
import PopupModal from './PopupModal.jsx';

const BugIcon = ({ size = 14, color = '#9ca3af' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 2l1.88 1.88M14.12 3.88L16 2M9 7.13v-1a3 3 0 0 1 6 0v1" />
    <path d="M12 20c-3.3 0-6-2.7-6-6v-3a6 6 0 0 1 12 0v3c0 3.3-2.7 6-6 6z" />
    <path d="M12 20v2M6 13H2M22 13h-4M6 17H3.5M20.5 17H18M6 9H4M20 9h-2" />
  </svg>
);

function FlagModal({ message, onConfirm, onCancel }) {
  return (
    <PopupModal
      onClose={onCancel}
      zIndex={9999}
      overlayStyle={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'none', WebkitBackdropFilter: 'none' }}
      panelStyle={{
        width: 'min(300px, calc(100vw - 2rem))',
        background: '#1e1b2e',
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: 16,
        padding: '1.4rem 1.6rem',
        textAlign: 'center',
      }}
      closeButtonProps={{ size: 38 }}
    >
        <div style={{ marginBottom: '1rem' }}><BugIcon size={28} color="#fbbf24" /></div>
        <p style={{ fontSize: '0.92rem', color: '#e2e2e2', lineHeight: 1.5, margin: '0 0 1.2rem' }}>{message}</p>
        <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'center' }}>
          <button type="button" onClick={onCancel} style={{
            padding: '0.55rem 1.1rem', borderRadius: 10,
            border: '1px solid rgba(255,255,255,0.1)', background: 'transparent',
            color: '#9ca3af', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
          }}>Non</button>
          <button type="button" onClick={onConfirm} style={{
            padding: '0.55rem 1.1rem', borderRadius: 10, border: 'none',
            background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
            color: '#fff', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer',
          }}>Oui</button>
        </div>
    </PopupModal>
  );
}

export function FlagBugButton({ onFlag }) {
  const [flagged, setFlagged] = useState(false);
  const [showModal, setShowModal] = useState(null); // 'flag' | 'unflag' | null

  return (
    <>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setShowModal(flagged ? 'unflag' : 'flag'); }}
        title="Signaler un problème"
        style={{
          position: 'absolute', top: 6, right: 6,
          background: flagged ? 'rgba(251,191,36,0.18)' : 'rgba(255,255,255,0.06)',
          border: flagged ? '1px solid rgba(251,191,36,0.3)' : '1px solid rgba(255,255,255,0.08)',
          borderRadius: 8, padding: '0.2rem 0.3rem',
          cursor: 'pointer', lineHeight: 1,
          opacity: flagged ? 1 : 0.45,
          transition: 'opacity 0.2s, background 0.2s',
        }}
      >
        <BugIcon size={14} color={flagged ? '#fbbf24' : '#9ca3af'} />
      </button>
      {showModal === 'flag' && (
        <FlagModal
          message="Signaler un problème sur cette question ?"
          onConfirm={() => { setFlagged(true); onFlag(false); setShowModal(null); }}
          onCancel={() => setShowModal(null)}
        />
      )}
      {showModal === 'unflag' && (
        <FlagModal
          message="Retirer le signalement ?"
          onConfirm={() => { setFlagged(false); onFlag(true); setShowModal(null); }}
          onCancel={() => setShowModal(null)}
        />
      )}
    </>
  );
}
