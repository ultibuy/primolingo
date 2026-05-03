import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLogo from '../components/AppLogo.jsx';
import { signInWithGoogle } from '../services/auth.js';
import { captureException } from '../services/sentry.js';
import posthog from '../services/analytics.js';

export default function LoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleGoogleSignIn() {
    posthog.capture('login_attempted');
    setLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
      navigate('/parent');
    } catch (err) {
      posthog.capture('login_failed', { error_code: err?.code });
      captureException(err);
      setError('La connexion a échoué. Réessaie.');
      setLoading(false);
    }
  }

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        {/* Brand */}
        <div style={brandStyle}>
          <div style={logoFrameStyle}>
            <AppLogo size={58} style={{ boxShadow: '0 10px 28px rgba(124,58,237,0.32)' }} />
          </div>
          <div style={brandTextStyle}>
            <h1 style={logoTitleStyle}>PrimoLingo</h1>
            <p style={logoSubStyle}>L'aventure de l'orthographe</p>
          </div>
        </div>

        {/* Message */}
        <p style={messageStyle}>
          Créez votre espace parent pour suivre les progrès de votre enfant.
        </p>

        {/* Error */}
        {error && (
          <div style={errorStyle}>{error}</div>
        )}

        {/* Google Sign-In Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          style={{ ...googleBtnStyle, opacity: loading ? 0.7 : 1 }}
        >
          {loading ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={spinnerStyle} />
              Connexion en cours…
            </span>
          ) : (
            <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <GoogleIcon />
              Se connecter avec Google
            </span>
          )}
        </button>

        {/* Privacy note */}
        <div style={privacyNoteStyle}>
          <ShieldCheckIcon />
          <p style={privacyTextStyle}>
            Utilisez le compte Google du <strong>parent</strong>. Google ne donne pas accès à vos e-mails.
          </p>
        </div>

        {/* Back link */}
        <a href="/" style={backLinkStyle}>← Retour à l'accueil</a>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 33.1 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.5 6.5 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.5-.4-3.5z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 16 19 13 24 13c3.1 0 5.8 1.1 7.9 3l5.7-5.7C34.5 6.5 29.6 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
      <path fill="#4CAF50" d="M24 44c5.4 0 10.3-2.1 14-5.4l-6.5-5.5C29.7 34.9 27 36 24 36c-5.3 0-9.7-3-11.3-8H6.1C9.4 39.8 16.2 44 24 44z"/>
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.1 4.2-3.9 5.6L38 39.1C41.6 35.6 44 30.1 44 24c0-1.2-.1-2.5-.4-3.5z"/>
    </svg>
  );
}

function ShieldCheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
      <path
        d="M12 3.5 19 6v5.2c0 4.6-2.6 8-7 9.8-4.4-1.8-7-5.2-7-9.8V6l7-2.5Z"
        stroke="#a78bfa"
        strokeWidth="1.8"
        strokeLinejoin="round"
        fill="rgba(167,139,250,0.12)"
      />
      <path
        d="m8.6 12.1 2.1 2.1 4.7-5"
        stroke="#fbbf24"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const containerStyle = {
  minHeight: '100vh',
  backgroundColor: 'var(--color-bg1)',
  backgroundImage: 'var(--app-star-field)',
  backgroundSize: '620px 620px, 680px 680px, 560px 560px, 720px 720px, 640px 640px, 760px 760px, 600px 600px, cover',
  backgroundPosition: 'center center',
  backgroundAttachment: 'fixed',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '1.25rem',
  fontFamily: 'var(--font-body)',
};

const cardStyle = {
  width: 'min(390px, 100%)',
  background: 'linear-gradient(180deg, rgba(255,255,255,0.088), rgba(255,255,255,0.045))',
  backdropFilter: 'blur(22px)',
  WebkitBackdropFilter: 'blur(22px)',
  border: '1px solid rgba(255,255,255,0.13)',
  borderRadius: 28,
  padding: '2rem 1.75rem 1.55rem',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '1rem',
  boxShadow: '0 28px 80px rgba(0,0,0,0.34), inset 0 1px 0 rgba(255,255,255,0.08)',
};

const brandStyle = {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.9rem',
  width: '100%',
};

const logoFrameStyle = {
  width: 78,
  height: 78,
  borderRadius: 24,
  background: 'linear-gradient(135deg, rgba(167,139,250,0.22), rgba(251,191,36,0.08))',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: '1px solid rgba(167,139,250,0.24)',
  boxShadow: '0 0 42px rgba(167,139,250,0.16)',
  flexShrink: 0,
};

const brandTextStyle = {
  minWidth: 0,
};

const logoTitleStyle = {
  margin: 0,
  fontSize: '2rem',
  lineHeight: 1,
  fontWeight: 900,
  color: 'var(--text-white)',
  fontFamily: 'var(--font-display)',
  letterSpacing: '-0.02em',
};

const logoSubStyle = {
  margin: '0.45rem 0 0',
  fontSize: '0.86rem',
  color: 'var(--color-primary)',
  fontWeight: 700,
};

const messageStyle = {
  margin: '0.55rem 0 0.2rem',
  maxWidth: 310,
  fontSize: '1rem',
  color: 'var(--text-light)',
  textAlign: 'center',
  lineHeight: 1.55,
};

const errorStyle = {
  width: '100%',
  padding: '0.75rem 1rem',
  borderRadius: 'var(--radius-sm)',
  background: 'rgba(127,29,29,0.8)',
  border: '1px solid rgba(248,113,113,0.4)',
  color: '#fee2e2',
  fontSize: '0.85rem',
  textAlign: 'center',
};

const googleBtnStyle = {
  width: '100%',
  padding: '13px 22px',
  borderRadius: 'var(--radius-pill)',
  border: '1px solid rgba(255,255,255,0.88)',
  background: '#fff',
  color: '#1f2937',
  fontSize: '0.98rem',
  fontWeight: 800,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all var(--motion-base)',
  fontFamily: 'var(--font-body)',
  boxShadow: '0 12px 26px rgba(0,0,0,0.18)',
};

const privacyNoteStyle = {
  width: '100%',
  display: 'flex',
  alignItems: 'flex-start',
  gap: '0.65rem',
  marginTop: '0.2rem',
  padding: '0.95rem 0.1rem 0',
  borderTop: '1px solid var(--glass-border)',
};

const privacyTextStyle = {
  margin: 0,
  fontSize: '0.78rem',
  color: 'var(--text-muted)',
  lineHeight: 1.45,
};

const backLinkStyle = {
  marginTop: '0.25rem',
  color: 'rgba(255,255,255,0.62)',
  fontSize: '0.85rem',
  textDecoration: 'none',
  fontWeight: 700,
};

const spinnerStyle = {
  display: 'inline-block',
  width: 18,
  height: 18,
  border: '2px solid rgba(31,41,55,0.18)',
  borderTopColor: '#1f2937',
  borderRadius: '50%',
  animation: 'spin 0.8s linear infinite',
};
