export default function AppLoadingScreen({ label = 'Chargement…', minHeight = '100vh' }) {
  return (
    <div style={{ ...screenStyle, minHeight }}>
      <div style={contentStyle}>
        <div style={spinnerStyle} aria-hidden="true" />
        <p style={labelStyle}>{label}</p>
      </div>
      <style>{`@keyframes app-loading-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

const screenStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'var(--color-bg1, #1e1e2e)',
  backgroundImage: 'var(--app-page-overlay, linear-gradient(135deg, #1e1e2e 0%, #2d2b55 100%))',
  backgroundSize: 'cover',
  backgroundPosition: 'center center',
  fontFamily: 'var(--font-body, Plus Jakarta Sans, system-ui, sans-serif)',
};

const contentStyle = {
  display: 'grid',
  justifyItems: 'center',
  gap: 14,
};

const spinnerStyle = {
  width: 42,
  height: 42,
  border: '3px solid rgba(167, 139, 250, 0.24)',
  borderTopColor: '#a78bfa',
  borderRadius: '50%',
  animation: 'app-loading-spin 0.8s linear infinite',
};

const labelStyle = {
  margin: 0,
  color: '#c4b5fd',
  fontFamily: 'var(--font-display, Outfit, system-ui, sans-serif)',
  fontSize: 16,
  fontWeight: 800,
};
