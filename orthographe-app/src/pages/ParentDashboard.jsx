import { useEffect, useState, useCallback, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleAuthProvider, reauthenticateWithPopup } from 'firebase/auth';
import { useAuth } from '../contexts/AuthContext.jsx';
import { auth } from '../firebase.js';
import CoinIcon from '../components/CoinIcon.jsx';
import PinInput from '../components/PinInput.jsx';
import PopupModal from '../components/PopupModal.jsx';
import { allRules } from '../content/loader.js';
import { allDictees, LEVELS } from '../content/dicteesLoader.js';
import { hashPin } from '../services/pin-crypto.js';
import { listChildren, loadParentalPin, saveParentalPin } from '../services/store.js';
import {
  loadParentImages,
  saveParentImages,
  loadChildSettings,
  saveChildQuestionCount,
  saveChildImageSettings,
  loadProgress,
  saveProgress,
  getDailyBackups,
  restoreDailyBackup,
} from '../store/persistence.js';

const TOTAL_GRAMMAR_RULES = allRules.length;
const TOTAL_DICTEE_RULES  = allDictees.length * LEVELS.length;
const ProgressCharts = lazy(() => import('../components/ProgressCharts.jsx'));

// ─── Helpers ───────────────────────────────────────────────────────────────────

function createCustomMysteryImageId() {
  return `custom-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function createEmptyDraft() {
  return { imageDataUrl: '', finalTileIndex: null, title: '', fileName: '' };
}

const TILE_COUNT = 6;

// ─── MysteryTileSelector ──────────────────────────────────────────────────────

function MysteryTileSelector({ imageDataUrl, selectedTileIndex, onSelect }) {
  return (
    <div style={{ position: 'relative', width: '100%', aspectRatio: '1408/768', overflow: 'hidden', borderRadius: 14, border: '1px solid rgba(255,255,255,0.08)', background: '#0b1020' }}>
      <img src={imageDataUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      {Array.from({ length: TILE_COUNT }).map((_, i) => {
        const col = i % 3;
        const row = Math.floor(i / 3);
        const sel = selectedTileIndex === i;
        return (
          <button
            key={i}
            type="button"
            onClick={() => onSelect(i)}
            style={{
              position: 'absolute',
              left: `${col * 33.3333}%`, top: `${row * 50}%`,
              width: '33.3333%', height: '50%',
              border: `1.5px solid ${sel ? '#fbbf24' : 'rgba(255,255,255,0.14)'}`,
              background: sel ? 'rgba(251,191,36,0.18)' : 'rgba(10,14,24,0.15)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <span style={{
              width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: sel ? '#fbbf24' : 'rgba(15,23,42,0.7)',
              color: sel ? '#111827' : '#fff',
              fontSize: '0.8rem', fontWeight: 900,
            }}>{i + 1}</span>
          </button>
        );
      })}
    </div>
  );
}

// ─── ChildSettings ────────────────────────────────────────────────────────────

function ChildSettings({ uid, childId, parentImages }) {
  const [settings, setSettings] = useState(null);
  const [qCount, setQCount] = useState('20');
  const [savingQ, setSavingQ] = useState(false);
  const [savingImg, setSavingImg] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    loadChildSettings(uid, childId).then(s => {
      setSettings(s);
      setQCount(String(s.prodQuestionCount ?? 20));
    });
  }, [uid, childId]);

  async function handleSaveQCount() {
    setSavingQ(true);
    const result = await saveChildQuestionCount(uid, childId, qCount);
    setSavingQ(false);
    if (result.success) { setMsg('Sauvegardé.'); setTimeout(() => setMsg(''), 2000); }
    else setMsg(result.error || 'Erreur.');
  }

  async function handleToggleImage(imageId, enabled) {
    const current = settings?.enabledMysteryImageIds || [];
    const next = enabled ? [...current, imageId] : current.filter(id => id !== imageId);
    setSavingImg(true);
    const result = await saveChildImageSettings(uid, childId, next);
    setSavingImg(false);
    if (result.success) {
      setSettings(s => ({ ...s, enabledMysteryImageIds: next }));
    } else {
      setMsg(result.error || 'Erreur.');
    }
  }

  if (!settings) return <div style={{ fontSize: '0.82rem', color: '#a78bfa', padding: '0.5rem 0' }}>Chargement…</div>;

  return (
    <div style={{ display: 'grid', gap: '0.9rem', paddingTop: '0.25rem' }}>
      {/* Question count */}
      <div style={settingRowStyle}>
        <div>
          <div style={settingLabelStyle}>Questions par session</div>
          <div style={{ fontSize: '0.76rem', color: '#64748b' }}>Entre 1 et 50</div>
        </div>
        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
          <input
            type="number" min="1" max="50"
            value={qCount}
            onChange={e => setQCount(e.target.value)}
            style={{ ...inputStyle, width: 60, padding: '0.45rem 0.6rem', textAlign: 'center' }}
          />
          <button type="button" onClick={handleSaveQCount} disabled={savingQ} style={primaryBtnStyle(savingQ)}>
            {savingQ ? '…' : 'OK'}
          </button>
        </div>
      </div>

      {/* Mystery images */}
      <div>
        <div style={settingLabelStyle}>Images mystère activées</div>
        {parentImages.length === 0 ? (
          <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.4rem' }}>
            Aucune image dans la bibliothèque. Ajoutez-en ci-dessus.
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '0.45rem', marginTop: '0.5rem' }}>
            {parentImages.map(img => {
              const enabled = (settings.enabledMysteryImageIds || []).includes(img.id);
              return (
                <label key={img.id} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={enabled}
                    disabled={savingImg}
                    onChange={e => handleToggleImage(img.id, e.target.checked)}
                    style={{ width: 16, height: 16, accentColor: '#a78bfa', cursor: 'pointer' }}
                  />
                  <div style={{ width: 48, aspectRatio: '1408/768', overflow: 'hidden', borderRadius: 5, background: '#0b1020', flexShrink: 0 }}>
                    <img src={img.imageDataUrl} alt={img.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: enabled ? '#fff' : '#64748b' }}>{img.title}</span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {msg && <div style={{ fontSize: '0.78rem', color: '#a7f3d0', fontWeight: 600 }}>{msg}</div>}
    </div>
  );
}

// ─── BackupRestorePanel ───────────────────────────────────────────────────────

function BackupRestorePanel({ uid, childId }) {
  const [backups, setBackups] = useState(null); // null = not loaded yet
  const [restoring, setRestoring] = useState(null);
  const [msg, setMsg] = useState('');
  async function handleLoad() {
    setMsg('');
    const list = await getDailyBackups(uid, childId);
    setBackups(list);
  }


  async function handleRestore(backup) {
    if (!confirm(`Restaurer la sauvegarde du ${backup.date} ?\nLa progression actuelle sera remplacée.`)) return;
    setRestoring(backup.date);
    setMsg('');
    const result = await restoreDailyBackup(backup, uid, childId);
    setRestoring(null);
    if (result.success) {
      setMsg(`Restauré depuis ${backup.date}. Rechargez la page de jeu.`);
    } else {
      setMsg(result.error || 'Erreur lors de la restauration.');
    }
  }

  return (
    <div style={{ marginTop: '0.8rem' }}>
      <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#f87171', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>
        Sauvegardes quotidiennes
      </div>

{backups === null ? (
        <button type="button" onClick={handleLoad} style={{
          padding: '0.35rem 0.9rem', borderRadius: 8,
          border: '1px solid rgba(248,113,113,0.25)', background: 'rgba(248,113,113,0.08)',
          color: '#f87171', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer',
        }}>
          Afficher les sauvegardes
        </button>
      ) : backups.length === 0 ? (
        <div style={{ fontSize: '0.78rem', color: '#9ca3af' }}>Aucune sauvegarde disponible.</div>
      ) : (
        <div style={{ display: 'grid', gap: '0.4rem' }}>
          {backups.slice(0, 10).map(backup => (
            <div key={backup.date} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              gap: '0.5rem', padding: '0.45rem 0.6rem',
              borderRadius: 8, background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: '#fff', fontWeight: 700 }}>{backup.date}</span>
                {backup.snapshot && (
                  <span style={{ fontSize: '0.72rem', color: '#9ca3af', marginLeft: '0.5rem' }}>
                    {backup.snapshot.coins ?? '?'} pièces · {backup.snapshot.streak?.current ?? '?'} jours
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => handleRestore(backup)}
                disabled={restoring === backup.date}
                style={{
                  padding: '0.3rem 0.7rem', borderRadius: 6,
                  border: '1px solid rgba(167,139,250,0.3)', background: 'rgba(167,139,250,0.1)',
                  color: '#a78bfa', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer',
                  opacity: restoring === backup.date ? 0.5 : 1,
                }}
              >
                {restoring === backup.date ? '…' : 'Restaurer'}
              </button>
            </div>
          ))}
        </div>
      )}

      {msg && (
        <div style={{ marginTop: '0.5rem', fontSize: '0.78rem', fontWeight: 600, color: msg.startsWith('Restauré') ? '#a7f3d0' : '#f87171' }}>
          {msg}
        </div>
      )}
    </div>
  );
}

// ─── ChildCard ────────────────────────────────────────────────────────────────

function FlaggedQuestionsPanel({ uid, childId, flaggedQuestions }) {
  const [clearing, setClearing] = useState(false);
  const [cleared, setCleared] = useState(false);

  const count = flaggedQuestions.length;

  function handleDownload() {
    const lines = flaggedQuestions.map(f =>
      `[${f.ruleTitle}] ${f.sentence} (réponse: ${f.answer}) — ${new Date(f.flaggedAt).toLocaleDateString('fr-FR')}\n  -> fichier: src/content/rules/${f.ruleId}.json | questionId: ${f.questionId}`
    );
    const text = `Questions signalées (${count})\n${'='.repeat(40)}\n\n${lines.join('\n\n')}`;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `questions-signalees-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleReset() {
    if (!confirm(`Vider la liste des ${count} question${count > 1 ? 's' : ''} signalée${count > 1 ? 's' : ''} ?`)) return;
    setClearing(true);
    try {
      const progress = await loadProgress(uid, childId);
      if (!progress) { setClearing(false); return; }
      const next = { ...progress, flaggedQuestions: [] };
      await saveProgress(next, uid, childId);
      setCleared(true);
    } catch (e) {
      console.error('Failed to clear flagged questions:', e);
    }
    setClearing(false);
  }

  if (cleared) return null;

  return (
    <div style={{
      background: 'rgba(251,191,36,0.06)',
      border: '1px solid rgba(251,191,36,0.18)',
      borderRadius: 12, padding: '0.75rem 0.9rem',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      gap: '0.6rem', flexWrap: 'wrap',
    }}>
      <div style={{ fontSize: '0.82rem', color: '#fbbf24', fontWeight: 700 }}>
        {count} question{count > 1 ? 's' : ''} signalée{count > 1 ? 's' : ''}
      </div>
      <div style={{ display: 'flex', gap: '0.4rem' }}>
        <button type="button" onClick={handleDownload} style={{
          padding: '0.35rem 0.7rem', borderRadius: 8,
          border: '1px solid rgba(251,191,36,0.25)', background: 'rgba(251,191,36,0.1)',
          color: '#fbbf24', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer',
        }}>
          Télécharger
        </button>
        <button type="button" onClick={handleReset} disabled={clearing} style={{
          padding: '0.35rem 0.7rem', borderRadius: 8,
          border: '1px solid rgba(248,113,113,0.25)', background: 'rgba(248,113,113,0.08)',
          color: '#fca5a5', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer',
          opacity: clearing ? 0.5 : 1,
        }}>
          {clearing ? '…' : 'Vider'}
        </button>
      </div>
    </div>
  );
}

function ChildCard({ child, uid, parentImages }) {
  const navigate = useNavigate();
  const progress = child.progress || {};
  const streak = progress.streak?.current || 0;
  const coins = progress.coins || 0;
  const rulesDone = Object.values(progress.rules || {}).filter(r => r.level >= 3).length;
  const lastActive = progress.streak?.lastActiveDate || null;
  const flaggedQuestions = progress.flaggedQuestions || [];
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <div style={cardStyle}>
      {/* Top row */}
      <div style={cardTopStyle}>
        <div style={avatarStyle}>{child.avatar || '🦊'}</div>
        <div style={{ flex: 1 }}>
          <div style={childNameStyle}>{child.name}</div>
          {lastActive && <div style={lastActiveStyle}>Dernière activité : {lastActive}</div>}
        </div>
        <button type="button" onClick={() => navigate(`/parent/child/${child.id}/edit`)} style={iconBtnStyle} title="Modifier le profil">✏️</button>
        <button
          type="button"
          onClick={() => setSettingsOpen(o => !o)}
          style={{ ...iconBtnStyle, color: settingsOpen ? '#a78bfa' : 'rgba(255,255,255,0.5)' }}
          title="Paramètres"
        >
          ⚙️
        </button>
      </div>

      {/* Stats */}
      <div style={statsRowStyle}>
        <div style={statItemStyle}>
          <span style={statValueStyle}>🔥 {streak}</span>
          <span style={statLabelStyle}>Série</span>
        </div>
        <div style={statItemStyle}>
          <span style={statValueStyle}>👑 {rulesDone}/{TOTAL_GRAMMAR_RULES}</span>
          <span style={statLabelStyle}>Règles</span>
        </div>
        <div style={statItemStyle}>
          <span style={{ ...statValueStyle, display: 'inline-flex', alignItems: 'center', gap: 4 }}><CoinIcon size={16} /> {coins}</span>
          <span style={statLabelStyle}>Pièces</span>
        </div>
      </div>

      {/* Flagged questions */}
      {flaggedQuestions.length > 0 && (
        <FlaggedQuestionsPanel uid={uid} childId={child.id} flaggedQuestions={flaggedQuestions} />
      )}

      {/* Settings panel */}
      {settingsOpen && (
        <div style={settingsPanelStyle}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#a78bfa', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.6rem' }}>
            Paramètres de {child.name}
          </div>
          <ChildSettings uid={uid} childId={child.id} parentImages={parentImages} />
          <BackupRestorePanel uid={uid} childId={child.id} />
        </div>
      )}

      {/* Progress charts */}
      <Suspense fallback={<div style={chartsLoadingStyle}>Chargement des graphiques...</div>}>
        <ProgressCharts statsHistory={progress.statsHistory || []} totalGrammarRules={TOTAL_GRAMMAR_RULES} totalDicteeRules={TOTAL_DICTEE_RULES} />
      </Suspense>

      {/* Play button */}
      <button type="button" onClick={() => navigate(`/play/${child.id}`)} style={playBtnStyle}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff" style={{ marginRight: 6, verticalAlign: '-2px' }}><path d="M6 4l15 8-15 8V4z"/></svg>
        Jouer
      </button>
    </div>
  );
}

// ─── ParentDashboard ──────────────────────────────────────────────────────────

export default function ParentDashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [parentImages, setParentImages] = useState([]);
  const [libOpen, setLibOpen] = useState(false);
  const [pin, setPin] = useState(undefined); // undefined = loading, null = not set, string = set
  const [showPinSetup, setShowPinSetup] = useState(false);
  const [showPinManage, setShowPinManage] = useState(false);
  const [pinSetupStep, setPinSetupStep] = useState(1); // 1 = enter, 2 = confirm
  const [pinDraft, setPinDraft] = useState('');
  const [pinError, setPinError] = useState('');
  const [reauthError, setReauthError] = useState('');

  useEffect(() => {
    if (!user?.uid) return;
    const unsub = listChildren(user.uid, (list) => {
      setChildren(list);
      setLoading(false);
    });
    return unsub;
  }, [user?.uid]);

  // Load parent image library (needed by all child cards)
  useEffect(() => {
    if (!user?.uid) return;
    loadParentImages(user.uid).then(setParentImages);
  }, [user?.uid]);

  // Load parental PIN
  useEffect(() => {
    if (!user?.uid) return;
    loadParentalPin(user.uid).then(p => {
      setPin(p);
      if (!p) setShowPinSetup(true);
    });
  }, [user?.uid]);

  // Refresh parent images after upload (passed as callback to ImageLibrary)
  const refreshParentImages = useCallback(() => {
    loadParentImages(user?.uid).then(setParentImages);
  }, [user?.uid]);

  // eslint-disable-next-line react-hooks/preserve-manual-memoization
  const handlePinSave = useCallback(async (newPin) => {
    if (!user?.uid) return;
    const pinData = await hashPin(newPin);
    await saveParentalPin(user.uid, pinData);
    setPin(pinData);
    setShowPinSetup(false);
    setShowPinManage(false);
    setPinSetupStep(1);
    setPinDraft('');
    setPinError('');
  }, [user?.uid]);

  const handlePinManageClick = useCallback(async () => {
    setReauthError('');
    // On localhost dev, skip reauthentication
    if (user?.uid === 'localhost-dev') {
      setShowPinManage(true);
      setPinSetupStep(1);
      setPinDraft('');
      setPinError('');
      return;
    }
    try {
      await reauthenticateWithPopup(auth.currentUser, new GoogleAuthProvider());
      setShowPinManage(true);
      setPinSetupStep(1);
      setPinDraft('');
      setPinError('');
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setReauthError('Reconnexion échouée. Réessayez.');
      }
    }
  }, [user?.uid]);

  async function handleSignOut() {
    await signOut();
    navigate('/');
  }

  // PIN setup/manage modal renderer
  const renderPinModal = (isSetup) => {
    const title = isSetup ? 'Définissez votre code parental' : 'Code parental';
    const subtitle = isSetup
      ? 'Ce code à 4 chiffres sera demandé à votre enfant pour récupérer sa flamme après une absence.'
      : null;
    const closePinModal = isSetup
      ? undefined
      : () => { setShowPinManage(false); setPinSetupStep(1); setPinDraft(''); setPinError(''); };
    return (
      <PopupModal
        onClose={closePinModal}
        closeOnBackdrop={!isSetup}
        showClose={!isSetup}
        panelStyle={{
          background: 'linear-gradient(180deg, #1e1e2e, #2d2b55)',
          borderRadius: 22,
          padding: '2rem 1.8rem',
          maxWidth: 360,
          width: '90%',
          border: '1px solid rgba(255,255,255,0.1)',
          textAlign: 'center',
        }}
      >
          <div style={{ fontSize: '2.2rem', marginBottom: '0.6rem' }}>🔒</div>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#e2e2e2', marginBottom: '0.3rem' }}>{title}</h2>
          {subtitle && <p style={{ fontSize: '0.85rem', color: '#9ca3af', marginBottom: '1.2rem', lineHeight: 1.5 }}>{subtitle}</p>}

          {!isSetup && pinSetupStep === 1 && (
            <div style={{ marginBottom: '1rem' }}>
              <p style={{ fontSize: '0.85rem', color: '#9ca3af', marginBottom: '0.5rem' }}>Votre code est défini.</p>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#a78bfa', letterSpacing: '0.3em', marginBottom: '1rem' }}>• • • •</div>
              <button
                type="button"
                onClick={() => { setPinSetupStep(2); setPinDraft(''); setPinError(''); }}
                style={{ padding: '0.5rem 1.2rem', borderRadius: 10, border: '1px solid rgba(167,139,250,0.4)', background: 'rgba(167,139,250,0.12)', color: '#a78bfa', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer' }}
              >
                Modifier
              </button>
            </div>
          )}

          {(isSetup || pinSetupStep >= 2) && (
            <>
              <p style={{ fontSize: '0.88rem', color: '#cbd5e1', marginBottom: '0.8rem', fontWeight: 600 }}>
                {pinSetupStep === 1 ? 'Choisissez un code à 4 chiffres' : pinSetupStep === 2 ? 'Choisissez un nouveau code' : 'Confirmez le code'}
              </p>
              <PinInput
                key={pinSetupStep}
                masked={false}
                onComplete={(val) => {
                  if (pinSetupStep <= 2) {
                    setPinDraft(val);
                    setPinSetupStep(3);
                    setPinError('');
                  } else {
                    if (val === pinDraft) {
                      handlePinSave(val);
                    } else {
                      setPinError('Les codes ne correspondent pas.');
                      setPinSetupStep(isSetup ? 1 : 2);
                      setPinDraft('');
                    }
                  }
                }}
                error={pinError}
              />
            </>
          )}

          {!isSetup && (
            <button
              type="button"
              onClick={() => { setShowPinManage(false); setPinSetupStep(1); setPinDraft(''); setPinError(''); }}
              style={{ marginTop: '1rem', padding: '0.5rem 1.2rem', borderRadius: 10, border: '1px solid rgba(255,255,255,0.12)', background: 'transparent', color: '#9ca3af', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}
            >
              Fermer
            </button>
          )}
      </PopupModal>
    );
  };

  return (
    <div style={containerStyle}>
      {/* PIN setup modal (blocking) */}
      {showPinSetup && renderPinModal(true)}

      {/* PIN manage modal (after re-auth) */}
      {showPinManage && renderPinModal(false)}

      {/* Header */}
      <div style={headerStyle}>
        <div>
          <div style={logoRowStyle}>
            <div style={logoIconStyle}>GH</div>
            <span style={logoTitleStyle}>GramHero</span>
          </div>
          <p style={welcomeStyle}>Bonjour, {user?.displayName?.split(' ')[0] || 'parent'} 👋</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {pin && (
            <button type="button" onClick={handlePinManageClick} style={{ ...logoutBtnStyle, color: '#a78bfa', borderColor: 'rgba(167,139,250,0.3)' }}>
              🔒 Code
            </button>
          )}
          {reauthError && <span style={{ fontSize: '0.75rem', color: '#f87171' }}>{reauthError}</span>}
          <button type="button" onClick={handleSignOut} style={logoutBtnStyle}>Déconnexion</button>
        </div>
      </div>

      {/* Content */}
      <div style={contentStyle}>

        {/* Image library (collapsible) */}
        <div style={{ marginBottom: '2rem' }}>
          <button
            type="button"
            onClick={() => setLibOpen(o => !o)}
            style={libToggleStyle}
          >
            <span>🖼️ Bibliothèque d'images mystère</span>
            <span style={{ fontSize: '0.85rem', opacity: 0.6 }}>{libOpen ? '▲' : '▼'}</span>
          </button>
          {libOpen && <ImageLibraryWithRefresh uid={user?.uid} onSaved={refreshParentImages} />}
        </div>

        {/* Children section */}
        <div style={sectionHeaderStyle}>
          <h2 style={sectionTitleStyle}>Mes enfants</h2>
          <button type="button" onClick={() => pin ? navigate('/parent/child/new') : setShowPinSetup(true)} style={{ ...addBtnStyle, opacity: pin ? 1 : 0.5 }}>
            + Ajouter un enfant
          </button>
        </div>

        {loading ? (
          <div style={loadingStyle}>Chargement…</div>
        ) : children.length === 0 ? (
          <div style={emptyStyle}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>👶</div>
            <p style={{ color: '#94a3b8', fontSize: '1rem', margin: 0 }}>
              Aucun enfant pour l'instant.<br />Commencez par créer un profil !
            </p>
            <button type="button" onClick={() => navigate('/parent/child/new')} style={createFirstBtnStyle}>
              Créer le premier profil
            </button>
          </div>
        ) : (
          <div style={childrenGridStyle}>
            {children.map(child => (
              <ChildCard key={child.id} child={child} uid={user.uid} parentImages={parentImages} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Wrapper that refreshes parent images list after a save
function ImageLibraryWithRefresh({ uid, onSaved }) {
  const [images, setImages] = useState([]);
  const [draft, setDraft] = useState(createEmptyDraft());
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    loadParentImages(uid).then(setImages);
  }, [uid]);

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setDraft({ imageDataUrl: String(reader.result || ''), finalTileIndex: null, title: '', fileName: file.name });
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  async function handleAdd() {
    if (!draft.imageDataUrl || draft.finalTileIndex === null || !draft.title.trim()) return;
    const next = [...images, { id: createCustomMysteryImageId(), title: draft.title.trim(), imageDataUrl: draft.imageDataUrl, finalTileIndex: draft.finalTileIndex }];
    setSaving(true);
    const result = await saveParentImages(uid, next);
    setSaving(false);
    if (result.success) { setImages(next); setDraft(createEmptyDraft()); setMsg('Image ajoutée.'); setTimeout(() => setMsg(''), 2000); onSaved?.(); }
    else setMsg(result.error || 'Erreur.');
  }

  async function handleRemove(id) {
    const next = images.filter(img => img.id !== id);
    setSaving(true);
    const result = await saveParentImages(uid, next);
    setSaving(false);
    if (result.success) { setImages(next); setMsg('Image supprimée.'); setTimeout(() => setMsg(''), 2000); onSaved?.(); }
    else setMsg(result.error || 'Erreur.');
  }

  return (
    <div style={libShellStyle}>
      <p style={{ margin: '0 0 1rem', fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.5 }}>
        Uploadez des images ici, puis activez-les par compte enfant dans le ⚙️ de chaque enfant.
      </p>

      <div style={stepBoxStyle}>
        <div style={stepLabelStyle}>1. Upload</div>
        <label style={{ display: 'grid', gap: '0.4rem', cursor: 'pointer' }}>
          <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
          <span style={uploadBtnStyle}>Choisir une image</span>
          <span style={{ fontSize: '0.76rem', color: '#9ca3af' }}>{draft.fileName || 'PNG, JPG ou WEBP'}</span>
        </label>
      </div>

      {draft.imageDataUrl && (
        <>
          <div style={stepBoxStyle}>
            <div style={stepLabelStyle}>2. Case de la tête (révélée en dernier)</div>
            <MysteryTileSelector imageDataUrl={draft.imageDataUrl} selectedTileIndex={draft.finalTileIndex} onSelect={i => setDraft(d => ({ ...d, finalTileIndex: i }))} />
          </div>
          <div style={stepBoxStyle}>
            <div style={stepLabelStyle}>3. Titre mystérieux</div>
            <input type="text" value={draft.title} onChange={e => setDraft(d => ({ ...d, title: e.target.value }))} placeholder="Ex: Le dragon des cascades" style={inputStyle} />
            <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'space-between', flexWrap: 'wrap' }}>
              <button type="button" onClick={() => setDraft(createEmptyDraft())} style={secBtnStyle}>Réinitialiser</button>
              <button
                type="button"
                onClick={handleAdd}
                disabled={saving || !draft.imageDataUrl || draft.finalTileIndex === null || !draft.title.trim()}
                style={primaryBtnStyle(saving || !draft.imageDataUrl || draft.finalTileIndex === null || !draft.title.trim())}
              >
                {saving ? 'Ajout…' : 'Ajouter à la bibliothèque'}
              </button>
            </div>
          </div>
        </>
      )}

      {images.length > 0 && (
        <div style={{ display: 'grid', gap: '0.6rem', marginTop: '0.5rem' }}>
          <div style={stepLabelStyle}>Images dans la bibliothèque ({images.length})</div>
          {images.map(img => (
            <div key={img.id} style={imgCardStyle}>
              <div style={{ width: 100, aspectRatio: '1408/768', overflow: 'hidden', borderRadius: 8, flexShrink: 0, background: '#0b1020' }}>
                <img src={img.imageDataUrl} alt={img.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#fff', marginBottom: 2 }}>{img.title}</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Tête : case {img.finalTileIndex + 1}</div>
              </div>
              <button type="button" onClick={() => handleRemove(img.id)} style={dangerBtnStyle} disabled={saving}>Supprimer</button>
            </div>
          ))}
        </div>
      )}

      {msg && <div style={{ fontSize: '0.82rem', color: '#a7f3d0', fontWeight: 600, marginTop: '0.5rem' }}>{msg}</div>}
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const containerStyle = {
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #1e1e2e 0%, #2d2b55 100%)',
  fontFamily: 'Plus Jakarta Sans, sans-serif',
  color: '#fff',
};

const headerStyle = {
  padding: '1.25rem 1.5rem',
  borderBottom: '1px solid rgba(255,255,255,0.08)',
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  flexWrap: 'wrap', gap: '0.75rem',
};

const logoRowStyle = { display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' };
const logoIconStyle = {
  width: 36, height: 36, borderRadius: 10,
  background: 'linear-gradient(135deg, #7c3aed, #a78bfa)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontSize: 14, fontWeight: 900, color: '#fff', fontFamily: 'Outfit, sans-serif',
};
const logoTitleStyle = { fontSize: '1.2rem', fontWeight: 900, color: '#fff', fontFamily: 'Outfit, sans-serif' };
const welcomeStyle = { margin: 0, fontSize: '0.85rem', color: '#94a3b8' };
const logoutBtnStyle = {
  padding: '0.5rem 1rem', borderRadius: 10,
  border: '1px solid rgba(255,255,255,0.12)',
  background: 'rgba(255,255,255,0.05)', color: '#94a3b8',
  fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif',
};

const contentStyle = { maxWidth: 900, margin: '0 auto', padding: '2rem 1.5rem' };

const libToggleStyle = {
  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  padding: '0.9rem 1.1rem', borderRadius: 14,
  border: '1px solid rgba(167,139,250,0.2)',
  background: 'rgba(167,139,250,0.06)',
  color: '#c4b5fd', fontSize: '0.95rem', fontWeight: 700,
  cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif',
  marginBottom: 0,
};

const libShellStyle = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.06)',
  borderTop: 'none',
  borderRadius: '0 0 14px 14px',
  padding: '1.25rem',
  display: 'grid', gap: '0.9rem',
};

const sectionHeaderStyle = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem',
};
const sectionTitleStyle = { margin: 0, fontSize: '1.4rem', fontWeight: 800, fontFamily: 'Outfit, sans-serif' };
const addBtnStyle = {
  padding: '0.6rem 1.2rem', borderRadius: 12, border: 'none',
  background: 'linear-gradient(135deg, #7c3aed, #a78bfa)',
  color: '#fff', fontSize: '0.9rem', fontWeight: 700,
  cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif',
};

const loadingStyle = { textAlign: 'center', color: '#a78bfa', padding: '3rem 0' };
const emptyStyle = {
  textAlign: 'center', padding: '3rem 1rem',
  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem',
};
const createFirstBtnStyle = {
  padding: '0.8rem 1.5rem', borderRadius: 14, border: 'none',
  background: 'linear-gradient(135deg, #7c3aed, #a78bfa)',
  color: '#fff', fontSize: '0.95rem', fontWeight: 800,
  cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif', marginTop: '0.5rem',
};
const childrenGridStyle = {
  display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem',
};

// Card
const cardStyle = {
  background: 'rgba(255,255,255,0.06)',
  backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
  border: '1px solid rgba(167,139,250,0.15)',
  borderRadius: 20, padding: '1.25rem',
  display: 'flex', flexDirection: 'column', gap: '1rem',
};
const cardTopStyle = { display: 'flex', alignItems: 'center', gap: '0.75rem' };
const avatarStyle = { fontSize: 36, lineHeight: 1 };
const childNameStyle = { fontSize: '1.1rem', fontWeight: 800, color: '#fff', fontFamily: 'Outfit, sans-serif' };
const lastActiveStyle = { fontSize: '0.75rem', color: '#64748b', marginTop: 2 };
const iconBtnStyle = {
  background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, padding: 4,
};
const statsRowStyle = {
  display: 'flex', justifyContent: 'space-around',
  background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: '0.75rem',
};
const statItemStyle = { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 };
const statValueStyle = { fontSize: '0.95rem', fontWeight: 700, color: '#fff' };
const statLabelStyle = { fontSize: '0.7rem', color: '#64748b' };
const settingsPanelStyle = {
  background: 'rgba(167,139,250,0.05)',
  border: '1px solid rgba(167,139,250,0.15)',
  borderRadius: 12, padding: '0.9rem',
};
const chartsLoadingStyle = {
  marginTop: 12,
  padding: '1rem',
  borderRadius: 12,
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  color: '#94a3b8',
  fontSize: '0.82rem',
  textAlign: 'center',
};
const playBtnStyle = {
  width: '100%', padding: '0.75rem', borderRadius: 14, border: 'none',
  background: 'linear-gradient(135deg, #7c3aed, #a78bfa)',
  color: '#fff', fontSize: '1rem', fontWeight: 800,
  cursor: 'pointer', fontFamily: 'Plus Jakarta Sans, sans-serif',
  boxShadow: '0 6px 20px rgba(124,58,237,0.3)',
};

// Settings
const settingRowStyle = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  gap: '0.8rem', flexWrap: 'wrap',
};
const settingLabelStyle = { fontSize: '0.85rem', fontWeight: 700, color: '#c4b5fd', marginBottom: '0.2rem' };

// Shared form styles
const stepBoxStyle = {
  background: 'rgba(0,0,0,0.18)', border: '1px solid rgba(255,255,255,0.05)',
  borderRadius: 14, padding: '0.85rem', display: 'grid', gap: '0.65rem',
};
const stepLabelStyle = { fontSize: '0.8rem', fontWeight: 800, color: '#fff' };
const uploadBtnStyle = {
  display: 'inline-flex', alignItems: 'center', width: 'fit-content',
  borderRadius: 10, padding: '0.65rem 1rem',
  background: 'rgba(167,139,250,0.12)', border: '1px solid rgba(167,139,250,0.2)',
  color: '#a78bfa', fontSize: '0.84rem', fontWeight: 800, cursor: 'pointer',
};
const inputStyle = {
  width: '100%', borderRadius: 10,
  border: '1px solid rgba(167,139,250,0.24)',
  background: 'rgba(0,0,0,0.24)', color: '#fff',
  padding: '0.7rem 0.9rem', fontSize: '0.95rem', fontWeight: 700,
  outline: 'none', boxSizing: 'border-box', fontFamily: 'Plus Jakarta Sans, sans-serif',
};
const primaryBtnStyle = (disabled) => ({
  border: 'none', borderRadius: 12, padding: '0.7rem 1.1rem',
  background: 'linear-gradient(135deg, #7c3aed, #a78bfa)',
  color: '#fff', fontSize: '0.88rem', fontWeight: 800,
  cursor: disabled ? 'default' : 'pointer', opacity: disabled ? 0.55 : 1,
  fontFamily: 'Plus Jakarta Sans, sans-serif',
});
const secBtnStyle = {
  border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '0.7rem 1.1rem',
  background: 'rgba(255,255,255,0.04)', color: '#cbd5e1',
  fontSize: '0.88rem', fontWeight: 700, cursor: 'pointer',
  fontFamily: 'Plus Jakarta Sans, sans-serif',
};
const dangerBtnStyle = {
  border: '1px solid rgba(248,113,113,0.2)', borderRadius: 10, padding: '0.55rem 0.8rem',
  background: 'rgba(248,113,113,0.08)', color: '#fca5a5',
  fontSize: '0.78rem', fontWeight: 800, cursor: 'pointer',
  fontFamily: 'Plus Jakarta Sans, sans-serif',
};
const imgCardStyle = {
  display: 'flex', gap: '0.8rem', alignItems: 'center',
  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)',
  borderRadius: 12, padding: '0.6rem',
};
