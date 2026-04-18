import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase.js';
import { useAuth } from '../contexts/AuthContext.jsx';

export default function ParentDashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;
    const ref = collection(db, 'users', user.uid, 'children');
    const unsub = onSnapshot(ref, (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setChildren(list);
      setLoading(false);
    });
    return unsub;
  }, [user?.uid]);

  async function handleSignOut() {
    await signOut();
    navigate('/');
  }

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <div>
          <div style={logoRowStyle}>
            <div style={logoIconStyle}>OQ</div>
            <span style={logoTitleStyle}>OrthoQuest</span>
          </div>
          <p style={welcomeStyle}>Bonjour, {user?.displayName?.split(' ')[0] || 'parent'} 👋</p>
        </div>
        <button type="button" onClick={handleSignOut} style={logoutBtnStyle}>
          Déconnexion
        </button>
      </div>

      {/* Content */}
      <div style={contentStyle}>
        <div style={sectionHeaderStyle}>
          <h2 style={sectionTitleStyle}>Mes enfants</h2>
          <button type="button" onClick={() => navigate('/parent/child/new')} style={addBtnStyle}>
            + Ajouter un enfant
          </button>
        </div>

        {loading ? (
          <div style={loadingStyle}>Chargement…</div>
        ) : children.length === 0 ? (
          <div style={emptyStyle}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>👶</div>
            <p style={{ color: '#94a3b8', fontSize: '1rem', margin: 0 }}>
              Aucun enfant pour l'instant.<br />
              Commencez par créer un profil !
            </p>
            <button type="button" onClick={() => navigate('/parent/child/new')} style={createFirstBtnStyle}>
              Créer le premier profil
            </button>
          </div>
        ) : (
          <div style={childrenGridStyle}>
            {children.map(child => (
              <ChildCard key={child.id} child={child} uid={user.uid} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ChildCard({ child, uid }) {
  const navigate = useNavigate();
  const progress = child.progress || {};
  const streak = progress.streak?.current || 0;
  const coins = progress.coins || 0;
  const rulesDone = Object.values(progress.rules || {}).filter(r => r.level >= 3).length;
  const rulesTotal = 10;
  const lastActive = progress.streak?.lastActiveDate || null;

  return (
    <div style={cardStyle}>
      <div style={cardTopStyle}>
        <div style={avatarStyle}>{child.avatar || '🦊'}</div>
        <div style={{ flex: 1 }}>
          <div style={childNameStyle}>{child.name}</div>
          {lastActive && (
            <div style={lastActiveStyle}>Dernière activité : {lastActive}</div>
          )}
        </div>
        <button type="button" onClick={() => navigate(`/parent/child/${child.id}/edit`)} style={editBtnStyle}>
          ✏️
        </button>
      </div>

      <div style={statsRowStyle}>
        <div style={statItemStyle}>
          <span style={statValueStyle}>🔥 {streak}</span>
          <span style={statLabelStyle}>Série</span>
        </div>
        <div style={statItemStyle}>
          <span style={statValueStyle}>👑 {rulesDone}/{rulesTotal}</span>
          <span style={statLabelStyle}>Règles</span>
        </div>
        <div style={statItemStyle}>
          <span style={statValueStyle}>🪙 {coins}</span>
          <span style={statLabelStyle}>Pièces</span>
        </div>
      </div>

      <button type="button" onClick={() => navigate(`/play/${child.id}`)} style={playBtnStyle}>
        ▶ Jouer
      </button>
    </div>
  );
}

const containerStyle = {
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #1e1e2e 0%, #2d2b55 100%)',
  fontFamily: 'Plus Jakarta Sans, sans-serif',
  color: '#fff',
};

const headerStyle = {
  padding: '1.25rem 1.5rem',
  borderBottom: '1px solid rgba(255,255,255,0.08)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  flexWrap: 'wrap',
  gap: '0.75rem',
};

const logoRowStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.6rem',
  marginBottom: '0.25rem',
};

const logoIconStyle = {
  width: 36,
  height: 36,
  borderRadius: 10,
  background: 'linear-gradient(135deg, #7c3aed, #a78bfa)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 14,
  fontWeight: 900,
  color: '#fff',
  fontFamily: 'Outfit, sans-serif',
};

const logoTitleStyle = {
  fontSize: '1.2rem',
  fontWeight: 900,
  color: '#fff',
  fontFamily: 'Outfit, sans-serif',
};

const welcomeStyle = {
  margin: 0,
  fontSize: '0.85rem',
  color: '#94a3b8',
};

const logoutBtnStyle = {
  padding: '0.5rem 1rem',
  borderRadius: 10,
  border: '1px solid rgba(255,255,255,0.12)',
  background: 'rgba(255,255,255,0.05)',
  color: '#94a3b8',
  fontSize: '0.85rem',
  cursor: 'pointer',
  fontFamily: 'Plus Jakarta Sans, sans-serif',
};

const contentStyle = {
  maxWidth: 900,
  margin: '0 auto',
  padding: '2rem 1.5rem',
};

const sectionHeaderStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginBottom: '1.5rem',
  flexWrap: 'wrap',
  gap: '0.75rem',
};

const sectionTitleStyle = {
  margin: 0,
  fontSize: '1.4rem',
  fontWeight: 800,
  fontFamily: 'Outfit, sans-serif',
};

const addBtnStyle = {
  padding: '0.6rem 1.2rem',
  borderRadius: 12,
  border: 'none',
  background: 'linear-gradient(135deg, #7c3aed, #a78bfa)',
  color: '#fff',
  fontSize: '0.9rem',
  fontWeight: 700,
  cursor: 'pointer',
  fontFamily: 'Plus Jakarta Sans, sans-serif',
};

const loadingStyle = {
  textAlign: 'center',
  color: '#a78bfa',
  padding: '3rem 0',
};

const emptyStyle = {
  textAlign: 'center',
  padding: '3rem 1rem',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '1rem',
};

const createFirstBtnStyle = {
  padding: '0.8rem 1.5rem',
  borderRadius: 14,
  border: 'none',
  background: 'linear-gradient(135deg, #7c3aed, #a78bfa)',
  color: '#fff',
  fontSize: '0.95rem',
  fontWeight: 800,
  cursor: 'pointer',
  fontFamily: 'Plus Jakarta Sans, sans-serif',
  marginTop: '0.5rem',
};

const childrenGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
  gap: '1rem',
};

const cardStyle = {
  background: 'rgba(255,255,255,0.06)',
  backdropFilter: 'blur(12px)',
  WebkitBackdropFilter: 'blur(12px)',
  border: '1px solid rgba(167,139,250,0.15)',
  borderRadius: 20,
  padding: '1.25rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
};

const cardTopStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
};

const avatarStyle = {
  fontSize: 36,
  lineHeight: 1,
};

const childNameStyle = {
  fontSize: '1.1rem',
  fontWeight: 800,
  color: '#fff',
  fontFamily: 'Outfit, sans-serif',
};

const lastActiveStyle = {
  fontSize: '0.75rem',
  color: '#64748b',
  marginTop: 2,
};

const editBtnStyle = {
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  fontSize: 16,
  padding: 4,
};

const statsRowStyle = {
  display: 'flex',
  justifyContent: 'space-around',
  background: 'rgba(255,255,255,0.04)',
  borderRadius: 12,
  padding: '0.75rem',
};

const statItemStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 2,
};

const statValueStyle = {
  fontSize: '0.95rem',
  fontWeight: 700,
  color: '#fff',
};

const statLabelStyle = {
  fontSize: '0.7rem',
  color: '#64748b',
};

const playBtnStyle = {
  width: '100%',
  padding: '0.75rem',
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
