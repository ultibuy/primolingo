import { Component } from 'react';
import { captureException } from '../services/sentry.js';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info?.componentStack);
    captureException(error, { extra: { componentStack: info?.componentStack } });
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1e1e2e 0%, #2d2b55 100%)',
        padding: '2rem',
      }}>
        <div style={{
          textAlign: 'center',
          maxWidth: 400,
          background: 'rgba(255,255,255,0.05)',
          borderRadius: 22,
          padding: '2.5rem 2rem',
          border: '1px solid rgba(255,255,255,0.1)',
        }}>
          <div style={{ marginBottom: '1rem' }}><svg width="52" height="52" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 2L1.5 20.5h21L12 2z" fill="var(--color-orange,#fb923c)" opacity="0.15" stroke="var(--color-orange,#fb923c)" strokeWidth="1.5" strokeLinejoin="round"/><line x1="12" y1="9" x2="12" y2="14" stroke="var(--color-orange,#fb923c)" strokeWidth="2" strokeLinecap="round"/><circle cx="12" cy="17" r="1" fill="var(--color-orange,#fb923c)"/></svg></div>
          <h1 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#e2e2e2', marginBottom: '0.5rem' }}>
            Oups, quelque chose a planté
          </h1>
          <p style={{ fontSize: '0.9rem', color: '#9ca3af', lineHeight: 1.6, marginBottom: '1.5rem' }}>
            Pas de panique — ta progression est sauvegardée. Recharge la page pour continuer.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '0.75rem 2rem',
              borderRadius: 12,
              border: 'none',
              background: 'linear-gradient(135deg, #7c3aed, #a78bfa)',
              color: '#fff',
              fontSize: '1rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(124,58,237,0.3)',
            }}
          >
            Recharger la page
          </button>
          {import.meta.env.DEV && this.state.error && (
            <pre style={{
              marginTop: '1.5rem',
              textAlign: 'left',
              fontSize: '0.7rem',
              color: '#f87171',
              background: 'rgba(248,113,113,0.08)',
              padding: '0.8rem',
              borderRadius: 8,
              overflow: 'auto',
              maxHeight: 200,
            }}>
              {this.state.error.message}
              {'\n'}
              {this.state.error.stack}
            </pre>
          )}
        </div>
      </div>
    );
  }
}
