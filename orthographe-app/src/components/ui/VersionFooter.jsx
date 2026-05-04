import { version as APP_VERSION } from '../../../package.json';

export default function VersionFooter({ style } = {}) {
  return (
    <div style={{ textAlign: 'center', padding: '0.5rem 0 1rem', fontSize: '0.65rem', color: 'rgba(255,255,255,0.12)', ...style }}>
      v{APP_VERSION}
    </div>
  );
}
