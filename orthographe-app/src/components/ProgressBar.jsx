export default function ProgressBar({ current, total, showResult }) {
  const pct = ((current + (showResult ? 1 : 0)) / total) * 100;
  const valuenow = current + (showResult ? 1 : 0);

  return (
    <div
      role="progressbar"
      aria-valuenow={valuenow}
      aria-valuemin={0}
      aria-valuemax={total}
      aria-label="Progression de la session"
      style={{
        height: 4, borderRadius: 2,
        background: 'rgba(255,255,255,0.08)',
        marginBottom: '0.5rem', overflow: 'hidden',
      }}
    >
      <div style={{
        height: '100%',
        width: `${pct}%`,
        background: 'linear-gradient(90deg, var(--color-primary), var(--color-accent))',
        borderRadius: 2,
        transition: 'width 0.4s ease',
      }} />
    </div>
  );
}
