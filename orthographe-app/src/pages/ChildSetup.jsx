import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { getChild, createChild, updateChild } from '../services/store.js';

const AVATARS = ['🦊', '🐱', '🦁', '🐸', '🐵', '🦄', '🐲', '🦅', '🐺', '🐼', '🦈', '🐙'];

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
        navigate('/parent');
      } else {
        const id = await createChild(user.uid, name.trim(), avatar);
        setNewChildId(id);
        setDone(true);
      }
    } catch (err) {
      console.error('Error saving child:', err);
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
          <p style={doneSub}>C'est parti pour l'aventure GramHero</p>
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
  background: 'linear-gradient(135deg, #1e1e2e 0%, #2d2b55 100%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '1rem',
  fontFamily: 'Plus Jakarta Sans, sans-serif',
};

const cardStyle = {
  width: 'min(480px, 100%)',
  background: 'rgba(255,255,255,0.05)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(167,139,250,0.2)',
  borderRadius: 24,
  padding: '2rem 1.75rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '1.25rem',
};

const backBtnStyle = {
  background: 'none',
  border: 'none',
  color: '#64748b',
  fontSize: '0.85rem',
  cursor: 'pointer',
  padding: 0,
  alignSelf: 'flex-start',
  fontFamily: 'Plus Jakarta Sans, sans-serif',
};

const titleStyle = {
  margin: 0,
  fontSize: '1.5rem',
  fontWeight: 900,
  color: '#fff',
  fontFamily: 'Outfit, sans-serif',
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
  color: '#94a3b8',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
};

const inputStyle = {
  padding: '0.85rem 1rem',
  borderRadius: 12,
  border: '1px solid rgba(167,139,250,0.3)',
  background: 'rgba(255,255,255,0.06)',
  color: '#fff',
  fontSize: '1rem',
  fontFamily: 'Plus Jakarta Sans, sans-serif',
  outline: 'none',
};

const avatarGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(6, 1fr)',
  gap: '0.5rem',
};

const avatarBtnStyle = {
  aspectRatio: '1',
  borderRadius: 12,
  border: '2px solid rgba(255,255,255,0.08)',
  background: 'rgba(255,255,255,0.04)',
  fontSize: 24,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const avatarBtnActiveStyle = {
  border: '2px solid #a78bfa',
  background: 'rgba(167,139,250,0.15)',
};

const primaryBtnStyle = {
  width: '100%',
  padding: '0.9rem',
  borderRadius: 14,
  border: 'none',
  background: 'linear-gradient(135deg, #7c3aed, #a78bfa)',
  color: '#fff',
  fontSize: '1rem',
  fontWeight: 800,
  cursor: 'pointer',
  fontFamily: 'Plus Jakarta Sans, sans-serif',
  boxShadow: '0 6px 20px rgba(124,58,237,0.3)',
};

const secondaryBtnStyle = {
  width: '100%',
  padding: '0.75rem',
  borderRadius: 14,
  border: '1px solid rgba(255,255,255,0.12)',
  background: 'rgba(255,255,255,0.05)',
  color: '#94a3b8',
  fontSize: '0.9rem',
  fontWeight: 700,
  cursor: 'pointer',
  fontFamily: 'Plus Jakarta Sans, sans-serif',
};

const doneTitle = {
  margin: 0,
  fontSize: '1.5rem',
  fontWeight: 900,
  color: '#fff',
  fontFamily: 'Outfit, sans-serif',
  textAlign: 'center',
};

const doneSub = {
  margin: 0,
  fontSize: '0.95rem',
  color: '#94a3b8',
  textAlign: 'center',
};
