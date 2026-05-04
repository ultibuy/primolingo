/* Shared layout styles used by all quiz components */

export const quizPageStyle = {
  minHeight: '100vh',
  backgroundColor: 'var(--color-bg1)',
  backgroundImage: 'var(--app-star-field)',
  backgroundSize: '620px 620px, 680px 680px, 560px 560px, 720px 720px, 640px 640px, 760px 760px, 600px 600px, cover',
  backgroundPosition: 'center center',
  backgroundAttachment: 'fixed',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontFamily: 'var(--font-body)',
  padding: '1.5rem', color: 'var(--text-light)',
};

export const quizCardStyle = {
  maxWidth: 620, width: '100%',
  background: 'var(--glass-bg)',
  borderRadius: 'var(--radius-md)', padding: '2rem 2.2rem',
  position: 'relative',
  backdropFilter: 'blur(var(--blur-md))',
  WebkitBackdropFilter: 'blur(var(--blur-md))',
  border: '1px solid var(--glass-border)',
  boxShadow: 'var(--shadow-lg)',
};

export const quizNextBtnStyle = {
  width: '100%', padding: '12px 24px', borderRadius: 'var(--radius-pill)',
  border: 'none', background: 'var(--gradient-brand)',
  color: 'var(--text-white)', cursor: 'pointer', fontSize: 14, fontWeight: 700,
  boxShadow: 'var(--shadow-glow)',
};
