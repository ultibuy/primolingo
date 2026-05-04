/* global __APP_VERSION__ */
export default function VersionFooter({ style } = {}) {
  return (
    <div style={{ textAlign: 'center', padding: '0.5rem 0 1rem', fontSize: '0.65rem', color: 'rgba(255,255,255,0.12)', ...style }}>
      v{__APP_VERSION__}
    </div>
  );
}
