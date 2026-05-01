import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as Sentry from '@sentry/react';
import { signInWithGoogle } from '../services/auth.js';

export default function LoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleGoogleSignIn() {
    setLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
      navigate('/parent');
    } catch (err) {
      Sentry.captureException(err);
      setError('La connexion a échoué. Réessaie.');
      setLoading(false);
    }
  }

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        {/* Logo */}
        <div style={logoStyle}>
          <div style={logoIconStyle}>GH</div>
          <h1 style={logoTitleStyle}>GramHero</h1>
          <p style={logoSubStyle}>L'aventure de l'orthographe</p>
        </div>

        {/* Message */}
        <p style={messageStyle}>
          Créez votre espace parent pour suivre les progrès de votre enfant
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

const containerStyle = {
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #1e1e2e 0%, #2d2b55 100%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '1rem',
  fontFamily: 'Plus Jakarta Sans, sans-serif',
};

const cardStyle = {
  width: 'min(420px, 100%)',
  background: 'rgba(255,255,255,0.05)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(167,139,250,0.2)',
  borderRadius: 24,
  padding: '2.5rem 2rem',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '1.25rem',
  boxShadow: '0 24px 60px rgba(0,0,0,0.4)',
};

const logoStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '0.5rem',
};

const logoIconStyle = {
  width: 72,
  height: 72,
  borderRadius: 20,
  background: 'linear-gradient(135deg, #7c3aed, #a78bfa)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 28,
  fontWeight: 900,
  color: '#fff',
  fontFamily: 'Outfit, sans-serif',
  boxShadow: '0 8px 24px rgba(124,58,237,0.4)',
};

const logoTitleStyle = {
  margin: 0,
  fontSize: '1.8rem',
  fontWeight: 900,
  color: '#fff',
  fontFamily: 'Outfit, sans-serif',
};

const logoSubStyle = {
  margin: 0,
  fontSize: '0.85rem',
  color: '#a78bfa',
  fontWeight: 500,
};

const messageStyle = {
  margin: 0,
  fontSize: '0.95rem',
  color: '#cbd5e1',
  textAlign: 'center',
  lineHeight: 1.6,
};

const errorStyle = {
  width: '100%',
  padding: '0.75rem 1rem',
  borderRadius: 12,
  background: 'rgba(127,29,29,0.8)',
  border: '1px solid rgba(248,113,113,0.4)',
  color: '#fee2e2',
  fontSize: '0.85rem',
  textAlign: 'center',
};

const googleBtnStyle = {
  width: '100%',
  padding: '0.9rem 1.5rem',
  borderRadius: 14,
  border: '1px solid rgba(255,255,255,0.15)',
  background: 'rgba(255,255,255,0.1)',
  color: '#fff',
  fontSize: '1rem',
  fontWeight: 700,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'background 0.2s',
  fontFamily: 'Plus Jakarta Sans, sans-serif',
};

const backLinkStyle = {
  color: '#64748b',
  fontSize: '0.85rem',
  textDecoration: 'none',
};

const spinnerStyle = {
  display: 'inline-block',
  width: 18,
  height: 18,
  border: '2px solid rgba(255,255,255,0.3)',
  borderTopColor: '#fff',
  borderRadius: '50%',
  animation: 'spin 0.8s linear infinite',
};
