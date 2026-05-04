import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { getChild, createChild, updateChild } from '../services/store.js';
import { captureException } from '../services/sentry.js';
import posthog from '../services/analytics.js';

const AVATARS = ['🦊', '🐱', '🦁', '🐸', '🐵', '🦄', '🐲', '🦅', '🐺', '🐼', '🦈', '🐙', '🐴'];

export default function ChildSetup() {
  const { childId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isEdit = Boolean(childId);

  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState(AVATARS[0]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [newChildId, setNewChildId] = useState(null);

  useEffect(() => {
    if (!isEdit || !user?.uid || !childId) return;
    setLoading(true);
    getChild(user.uid, childId).then(child => {
      if (child) {
        setName(child.name || '');
        setAvatar(child.avatar || AVATARS[0]);
      }
      setLoading(false);
    });
  }, [isEdit, user?.uid, childId]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);

    try {
      if (isEdit) {
        await updateChild(user.uid, childId, { name: name.trim(), avatar });
        posthog.capture('child_profile_updated', { child_id: childId, avatar });
        navigate('/parent');
      } else {
        const id = await createChild(user.uid, name.trim(), avatar);
        posthog.capture('child_profile_created', { child_id: id, avatar });
        setNewChildId(id);
        setDone(true);
      }
    } catch (err) {
      captureException(err);
    } finally {
      setSaving(false);
    }
  }

  if (done && newChildId) {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <div style={{ fontSize: 64, textAlign: 'center' }}>🚀</div>
          <h2 style={doneTitle}>Le profil de {name} est prêt !</h2>
          <p style={doneSub}>C'est parti pour l'aventure PrimoLingo</p>
          <button type="button" onClick={() => navigate(`/play/${newChildId}`)} style={primaryBtnStyle}>
            Commencer à jouer
          </button>
          <button type="button" onClick={() => navigate('/parent')} style={secondaryBtnStyle}>
            Retour au tableau de bord
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <button type="button" onClick={() => navigate('/parent')} style={backBtnStyle}>← Retour</button>

        <h2 style={titleStyle}>
          {isEdit ? 'Modifier le profil' : 'Nouveau profil enfant'}
        </h2>

        {loading ? (
          <div style={{ textAlign: 'center', color: '#a78bfa', padding: '2rem 0' }}>Chargement…</div>
        ) : (
          <form onSubmit={handleSubmit} style={formStyle}>
            {/* Name */}
            <div style={fieldStyle}>
              <label style={labelStyle}>Prénom de l'enfant</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ex: Théo"
                required
                style={inputStyle}
                maxLength={30}
              />
            </div>

            {/* Avatar picker */}
            <div style={fieldStyle}>
              <label style={labelStyle}>Choisir un avatar</label>
              <div style={avatarGridStyle}>
                {AVATARS.map(a => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => setAvatar(a)}
                    style={{
                      ...avatarBtnStyle,
                      ...(avatar === a ? avatarBtnActiveStyle : {}),
                    }}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>

            <button type="submit" disabled={saving || !name.trim()} style={primaryBtnStyle}>
              {saving ? 'Enregistrement…' : isEdit ? 'Enregistrer' : 'Créer le profil'}
            </button>
          </form>
        )}
      </div>
    </div>
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
  padding: '1rem',
  fontFamily: 'var(--font-body)',
};

const cardStyle = {
  width: 'min(480px, 100%)',
  background: 'var(--glass-bg)',
  backdropFilter: 'blur(var(--blur-md))',
  WebkitBackdropFilter: 'blur(var(--blur-md))',
  border: '1px solid var(--glass-border)',
  borderRadius: 'var(--radius-lg)',
  padding: '2rem 1.75rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '1.25rem',
};

const backBtnStyle = {
  background: 'none',
  border: 'none',
  color: 'var(--text-muted)',
  fontSize: '0.85rem',
  cursor: 'pointer',
  padding: 0,
  alignSelf: 'flex-start',
  fontFamily: 'var(--font-body)',
};

const titleStyle = {
  margin: 0,
  fontSize: '1.5rem',
  fontWeight: 900,
  color: 'var(--text-white)',
  fontFamily: 'var(--font-display)',
};

const formStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1.25rem',
};

const fieldStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
};

const labelStyle = {
  fontSize: '0.85rem',
  fontWeight: 700,
  color: 'var(--text-light)',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
};

const inputStyle = {
  padding: '0.85rem 1rem',
  borderRadius: 'var(--radius-sm)',
  border: '1px solid var(--glass-border)',
  background: 'var(--glass-bg)',
  color: 'var(--text-white)',
  fontSize: '1rem',
  fontFamily: 'var(--font-body)',
  outline: 'none',
};

const avatarGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(6, 1fr)',
  gap: '0.5rem',
};

const avatarBtnStyle = {
  aspectRatio: '1',
  borderRadius: 'var(--radius-sm)',
  border: '2px solid var(--glass-border)',
  background: 'var(--glass-bg)',
  fontSize: 24,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const avatarBtnActiveStyle = {
  border: '2px solid var(--color-primary)',
  background: 'rgba(167,139,250,0.15)',
};

const primaryBtnStyle = {
  width: '100%',
  padding: '12px 24px',
  borderRadius: 'var(--radius-pill)',
  border: 'none',
  background: 'var(--gradient-brand)',
  color: 'var(--text-white)',
  fontSize: '1rem',
  fontWeight: 800,
  cursor: 'pointer',
  fontFamily: 'var(--font-body)',
  boxShadow: 'var(--shadow-glow)',
};

const secondaryBtnStyle = {
  width: '100%',
  padding: '0.75rem',
  borderRadius: 'var(--radius-pill)',
  border: '1px solid var(--glass-border)',
  background: 'var(--glass-bg)',
  color: 'var(--text-light)',
  fontSize: '0.9rem',
  fontWeight: 700,
  cursor: 'pointer',
  fontFamily: 'var(--font-body)',
};

const doneTitle = {
  margin: 0,
  fontSize: '1.5rem',
  fontWeight: 900,
  color: 'var(--text-white)',
  fontFamily: 'var(--font-display)',
  textAlign: 'center',
};

const doneSub = {
  margin: 0,
  fontSize: '0.95rem',
  color: 'var(--text-muted)',
  textAlign: 'center',
};
