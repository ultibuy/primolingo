import { useEffect, useState, useCallback, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleAuthProvider, reauthenticateWithPopup } from 'firebase/auth';
import { useAuth } from '../contexts/AuthContext.jsx';
import { auth } from '../services/firebase-auth.js';
import { captureException } from '../services/sentry.js';
import posthog from '../services/analytics.js';
import CoinIcon from '../components/CoinIcon.jsx';
import FlameIcon from '../components/FlameIcon.jsx';
import CrownIcon from '../components/CrownIcon.jsx';
import AppLogo from '../components/AppLogo.jsx';
import PinInput from '../components/PinInput.jsx';
import PopupModal from '../components/PopupModal.jsx';
import VersionFooter from '../components/ui/VersionFooter.jsx';
import { allRules } from '../content/loader.js';
import { allDictees, LEVELS } from '../content/dicteesLoader.js';
import { hashPin } from '../services/pin-crypto.js';
import { listChildren, loadParentalPin, saveParentalPin, updateChild } from '../services/store.js';
import {
  loadParentImages,
  saveParentImages,
  loadChildSettings,
  saveChildImageSettings,
  loadProgress,
  saveProgress,
  getDailyBackups,
  restoreDailyBackup,
} from '../store/persistence.js';

const AVATARS = ['🦊', '🐱', '🦁', '🐸', '🐵', '🦄', '🐲', '🦅', '🐺', '🐼', '🦈', '🐙', '🐴'];
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

function detectPlatform() {
  const ua = navigator.userAgent;
  if (/iPad|iPhone|iPod/.test(ua) || (/Mac/.test(ua) && navigator.maxTouchPoints >= 5)) return 'ios';
  if (/Android/.test(ua)) return 'android';
  return 'desktop';
}

const DEVICES = [
  { id: 'desktop', label: 'Ordinateur', emoji: '💻' },
  { id: 'ios',     label: 'iPhone / iPad', emoji: '📱' },
  { id: 'android', label: 'Android', emoji: '📱' },
];

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
  const [savingImg, setSavingImg] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    loadChildSettings(uid, childId).then(s => setSettings(s));
  }, [uid, childId]);

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
    <div style={{ display: 'grid', gap: '0.9rem' }}>
      <div>
        <div style={subSectionLabelStyle}>Images mystère activées</div>
        {parentImages.length === 0 ? (
          <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.4rem' }}>
            Aucune image dans la bibliothèque. Ajoutez-en dans la section « Mon compte » ci-dessus.
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
  const [backups, setBackups] = useState(null);
  const [restoring, setRestoring] = useState(null);
  const [msg, setMsg] = useState('');
  const [showAll, setShowAll] = useState(false);
  const PREVIEW_COUNT = 2;

  useEffect(() => {
    getDailyBackups(uid, childId).then(setBackups);
  }, [uid, childId]);

  // kept for compatibility but no longer used as the trigger button was removed
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
    <div>
      <div style={subSectionLabelStyle}>Sauvegardes quotidiennes</div>
      <div style={{ marginTop: '0.5rem' }}>
        {backups === null ? (
          <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Chargement…</div>
        ) : backups.length === 0 ? (
          <div style={{ fontSize: '0.78rem', color: '#9ca3af' }}>Aucune sauvegarde disponible.</div>
        ) : (
          <div style={{ display: 'grid', gap: '0.4rem' }}>
            {(showAll ? backups : backups.slice(0, PREVIEW_COUNT)).map(backup => (
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
            {!showAll && backups.length > PREVIEW_COUNT && (
              <button
                type="button"
                onClick={() => setShowAll(true)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0', textAlign: 'left', fontFamily: 'var(--font-body)' }}
              >
                ↓ Voir les {backups.length - PREVIEW_COUNT} sauvegardes précédentes
              </button>
            )}
          </div>
        )}
        {msg && (
          <div style={{ marginTop: '0.5rem', fontSize: '0.78rem', fontWeight: 600, color: msg.startsWith('Restauré') ? '#a7f3d0' : '#f87171' }}>
            {msg}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── FlaggedQuestionsPanel ────────────────────────────────────────────────────

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
      await saveProgress({ ...progress, flaggedQuestions: [] }, uid, childId);
      setCleared(true);
    } catch (e) { captureException(e); }
    setClearing(false);
  }

  if (cleared) return null;

  return (
    <div style={{
      background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.18)',
      borderRadius: 12, padding: '0.75rem 0.9rem',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      gap: '0.6rem', flexWrap: 'wrap',
    }}>
      <div style={{ fontSize: '0.82rem', color: '#fbbf24', fontWeight: 700 }}>
        {count} question{count > 1 ? 's' : ''} signalée{count > 1 ? 's' : ''}
      </div>
      <div style={{ display: 'flex', gap: '0.4rem' }}>
        <button type="button" onClick={handleDownload} style={outlineBtnStyle('#fbbf24', 'rgba(251,191,36,0.25)', 'rgba(251,191,36,0.1)')}>
          Télécharger
        </button>
        <button type="button" onClick={handleReset} disabled={clearing} style={{ ...outlineBtnStyle('#fca5a5', 'rgba(248,113,113,0.25)', 'rgba(248,113,113,0.08)'), opacity: clearing ? 0.5 : 1 }}>
          {clearing ? '…' : 'Vider'}
        </button>
      </div>
    </div>
  );
}

// ─── ImageLibraryWithRefresh ──────────────────────────────────────────────────

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
    <div style={{ display: 'grid', gap: '0.9rem' }}>
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
                type="button" onClick={handleAdd}
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
        <div style={{ display: 'grid', gap: '0.6rem' }}>
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

      {msg && <div style={{ fontSize: '0.82rem', color: '#a7f3d0', fontWeight: 600 }}>{msg}</div>}
    </div>
  );
}

// ─── ChildPanelV2 (collapsible) ───────────────────────────────────────────────

function ChildPanelV2({ child, uid, parentImages, isOpen, onToggle }) {
  const navigate = useNavigate();
  const progress = child.progress || {};
  const streak = progress.streak?.current || 0;
  const coins = progress.coins || 0;
  const rulesDone = Object.values(progress.rules || {}).filter(r => r.level >= 3).length;
  const lastActive = progress.streak?.lastActiveDate || null;
  const flaggedQuestions = progress.flaggedQuestions || [];

  return (
    <div style={panelStyle}>
      {/* Header — always visible, clickable to expand/collapse */}
      <div
        role="button"
        tabIndex={0}
        onClick={onToggle}
        onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && onToggle()}
        style={panelHeaderStyle}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flex: 1, minWidth: 0 }}>
          <span style={{ fontSize: 30, lineHeight: 1, flexShrink: 0 }}>{child.avatar || '🦊'}</span>
          <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-white)', fontFamily: 'var(--font-display)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {child.name}
          </span>
        </div>
        {/* Stat chips */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
          <span style={statChipStyle}><FlameIcon size={13} intensity={1} /> {streak}</span>
          <span style={statChipStyle}><CrownIcon size={13} animate={false} /> {rulesDone}</span>
          <span style={{ ...statChipStyle, display: 'inline-flex', alignItems: 'center', gap: 2 }}><CoinIcon size={13} /> {coins}</span>
        </div>
        <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, flexShrink: 0 }}>{isOpen ? '▲' : '▼'}</span>
      </div>

      {/* Expanded content */}
      {isOpen && (
        <div style={{ padding: '0 1rem 1rem', display: 'grid', gap: '1.4rem' }}>
          {/* Activité */}
          <div>
            <div style={sectionDividerStyle}>Activité</div>
            {lastActive && (
              <div style={{ fontSize: '0.78rem', color: 'var(--text-subtle)', marginBottom: '0.6rem' }}>
                Dernière session : {lastActive}
              </div>
            )}
            {flaggedQuestions.length > 0 && (
              <FlaggedQuestionsPanel uid={uid} childId={child.id} flaggedQuestions={flaggedQuestions} />
            )}
            <Suspense fallback={<div style={chartsLoadingStyle}>Chargement des graphiques...</div>}>
              <ProgressCharts statsHistory={progress.statsHistory || []} totalGrammarRules={TOTAL_GRAMMAR_RULES} totalDicteeRules={TOTAL_DICTEE_RULES} />
            </Suspense>
          </div>

          {/* Activité seule dans Suivi des enfants — les images mystère sont gérées dans Gestion des enfants */}
        </div>
      )}
    </div>
  );
}

// ─── AccesEnfantSection ────────────────────────────────────────────────────────

const DEVICE_INSTRUCTIONS = {
  desktop: {
    label: 'Ordinateur',
    parentBookmark: 'Ctrl+D (Windows) ou Cmd+D (Mac)',
    steps: [
      'Rendez-vous sur primolingo.app et connectez-vous avec votre compte parent',
      'Dans la section « Gestion des enfants », cliquez sur « Ouvrir la partie enfant »',
      'Mettez la page en favoris (Ctrl+D sur Windows, Cmd+D sur Mac) pour que l\'enfant y accède directement',
    ],
  },
  ios: {
    label: 'iPhone / iPad',
    parentBookmark: 'Dans Safari : Partager → « Ajouter aux favoris »',
    steps: [
      'Rendez-vous sur primolingo.app dans Safari et connectez-vous avec votre compte parent',
      'Dans la section « Gestion des enfants », appuyez sur « Ouvrir la partie enfant »',
      'Appuyez sur le bouton Partager (□↑), puis « Sur l\'écran d\'accueil »',
    ],
  },
  android: {
    label: 'Android',
    parentBookmark: 'Dans Chrome : ⋮ → « Ajouter aux favoris »',
    steps: [
      'Rendez-vous sur primolingo.app dans Chrome et connectez-vous avec votre compte parent',
      'Dans la section « Gestion des enfants », appuyez sur « Ouvrir la partie enfant »',
      'Appuyez sur ⋮ (trois points en haut à droite), puis « Ajouter à l\'écran d\'accueil »',
    ],
  },
};

function AccesEnfantSection() {
  const [childDevice, setChildDevice] = useState('desktop');
  const [parentDevice, setParentDevice] = useState('desktop');
  const [shareDone, setShareDone] = useState(false);

  async function handleShare() {
    const url = window.location.origin + '/play';
    try {
      if (navigator.share) {
        await navigator.share({ title: 'PrimoLingo — partie enfant', url });
        setShareDone(true);
        setTimeout(() => setShareDone(false), 3000);
      } else {
        await navigator.clipboard.writeText(url);
        setShareDone(true);
        setTimeout(() => setShareDone(false), 3000);
      }
    } catch (_) { /* dismissed */ }
  }

  useEffect(() => {
    const detected = detectPlatform();
    setParentDevice(detected); // parent is on this device right now
    setChildDevice(detected);  // default child device to same, user can change
  }, []);

  const childInstr = DEVICE_INSTRUCTIONS[childDevice];
  const parentInstr = DEVICE_INSTRUCTIONS[parentDevice];

  return (
    <div style={{ display: 'grid', gap: '1.2rem' }}>
      {/* Preamble */}
      <div style={infoCardStyle}>
        <p style={{ margin: 0, fontSize: '0.9rem', color: '#d1d5db', lineHeight: 1.7 }}>
          PrimoLingo est constituée de <strong style={{ color: '#fff' }}>deux parties</strong> : ce tableau de bord parent (pour vous) et la <strong style={{ color: '#fff' }}>partie enfant</strong> accessible via les boutons ci-dessous. Il n'y a pas d'app séparée — tout se passe dans le navigateur.
        </p>
        <p style={{ margin: '0.5rem 0 0', fontSize: '0.85rem', color: '#9ca3af', lineHeight: 1.6 }}>
          Depuis la partie enfant, un bouton permet de revenir sur ce tableau de bord — il nécessite votre <strong style={{ color: '#d1d5db' }}>code parental</strong>.
        </p>
        <p style={{ margin: '0.5rem 0 0', fontSize: '0.85rem', color: '#9ca3af', lineHeight: 1.6 }}>
          <svg style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.3em', flexShrink: 0 }} width="16" height="16" viewBox="0 0 48 48" aria-hidden="true">
            <defs>
              <linearGradient id="recStarGrad" x1="13" y1="40" x2="34" y2="8" gradientUnits="userSpaceOnUse">
                <stop stopColor="#fb923c" />
                <stop offset="0.48" stopColor="#fbbf24" />
                <stop offset="1" stopColor="#fff7ad" />
              </linearGradient>
            </defs>
            <path d="m24 5.7 5.4 10.9 12 1.8-8.7 8.4 2.1 12-10.8-5.7-10.8 5.7 2.1-12-8.7-8.4 12-1.8L24 5.7Z" fill="url(#recStarGrad)" stroke="#fde68a" strokeWidth="1.4" strokeLinejoin="round" />
          </svg>{' '}<strong style={{ color: '#fff' }}>Recommandé :</strong> mettre ce tableau de bord en favori sur votre appareil, et mettre la partie enfant en favori sur l'appareil de votre enfant.
        </p>
      </div>

      {/* Two-column cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
        {/* Card: parent device — no selector, auto-detected */}
        <div style={accessCardStyle('#a78bfa', 'rgba(167,139,250,0.08)')}>
          <div style={accessCardHeaderStyle}>
            <span style={{ fontSize: 22 }}>🖥️</span>
            <div>
              <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#fff' }}>Sur votre appareil</div>
              <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: 2 }}>Tableau de bord parent</div>
            </div>
          </div>
          <ol style={{ margin: '0 0 0.5rem', paddingLeft: '1.1rem' }}>
            <li style={{ fontSize: '0.82rem', color: '#d1d5db', lineHeight: 1.65, marginBottom: '0.25rem' }}>
              Ajoutez un enfant dans « Gestion des enfants » ci-dessous
            </li>
            <li style={{ fontSize: '0.82rem', color: '#d1d5db', lineHeight: 1.65 }}>
              Mettez cette page en favori pour y revenir facilement
            </li>
          </ol>
          <div style={{ fontSize: '0.78rem', color: '#9ca3af', lineHeight: 1.6, padding: '0.5rem 0.7rem', background: 'rgba(167,139,250,0.06)', borderRadius: 8, border: '1px solid rgba(167,139,250,0.12)' }}>
            {parentInstr.parentBookmark}
          </div>
        </div>

        {/* Card: child device — with device selector */}
        <div style={accessCardStyle('#60cdff', 'rgba(96,205,255,0.08)')}>
          <div style={accessCardHeaderStyle}>
            <span style={{ fontSize: 22 }}>📱</span>
            <div>
              <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#fff' }}>Sur l'appareil de l'enfant</div>
              <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: 2 }}>Partie enfant</div>
            </div>
          </div>
          {/* Device selector — inside child card only */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '0.8rem' }}>
            {DEVICES.map(d => (
              <button
                key={d.id}
                type="button"
                onClick={() => setChildDevice(d.id)}
                style={{
                  padding: '4px 10px', borderRadius: 'var(--radius-pill)',
                  border: `1px solid ${d.id === childDevice ? 'rgba(96,205,255,0.5)' : 'rgba(255,255,255,0.1)'}`,
                  background: d.id === childDevice ? 'rgba(96,205,255,0.12)' : 'rgba(255,255,255,0.03)',
                  color: d.id === childDevice ? '#60cdff' : '#9ca3af',
                  fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-body)',
                }}
              >
                {d.emoji} {d.label}
              </button>
            ))}
          </div>
          <ol style={{ margin: 0, paddingLeft: '1.1rem' }}>
            {childInstr.steps.map((s, i) => (
              <li key={i} style={{ fontSize: '0.8rem', color: '#d1d5db', lineHeight: 1.65, marginBottom: '0.3rem' }}>{s}</li>
            ))}
          </ol>
          {(childDevice === 'ios' || childDevice === 'android') && (
            <button
              type="button"
              onClick={handleShare}
              style={{
                marginTop: '0.8rem', width: '100%', padding: '0.55rem 1rem',
                borderRadius: 10, border: '1px solid rgba(96,205,255,0.35)',
                background: shareDone ? 'rgba(74,222,128,0.12)' : 'rgba(96,205,255,0.1)',
                color: shareDone ? '#4ade80' : '#60cdff',
                fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer',
                fontFamily: 'var(--font-body)', transition: 'background 0.2s, color 0.2s',
              }}
            >
              {shareDone ? '✓ Lien copié !' : '↗ Ouvrir / partager la partie enfant'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── ChildEditForm (inline name + avatar editing) ────────────────────────────

function ChildEditForm({ uid, child, onSaved, onCancel }) {
  const [name, setName] = useState(child.name);
  const [avatar, setAvatar] = useState(child.avatar || AVATARS[0]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSave() {
    if (!name.trim()) { setError('Le prénom est obligatoire.'); return; }
    setSaving(true);
    try {
      await updateChild(uid, child.id, { name: name.trim(), avatar });
      onSaved({ ...child, name: name.trim(), avatar });
    } catch (e) {
      captureException(e);
      setError('Erreur lors de la sauvegarde.');
    }
    setSaving(false);
  }

  return (
    <div style={{ display: 'grid', gap: '0.75rem' }}>
      <div>
        <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.4rem' }}>Prénom</div>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          maxLength={20}
          style={inputStyle}
          autoFocus
        />
      </div>
      <div>
        <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.4rem' }}>Avatar</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
          {AVATARS.map(a => (
            <button
              key={a}
              type="button"
              onClick={() => setAvatar(a)}
              style={{
                fontSize: 24, lineHeight: 1, padding: '0.3rem', borderRadius: 8, cursor: 'pointer',
                border: `2px solid ${a === avatar ? '#a78bfa' : 'rgba(255,255,255,0.1)'}`,
                background: a === avatar ? 'rgba(167,139,250,0.15)' : 'rgba(255,255,255,0.04)',
              }}
            >{a}</button>
          ))}
        </div>
      </div>
      {error && <div style={{ fontSize: '0.78rem', color: '#f87171', fontWeight: 600 }}>{error}</div>}
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button type="button" onClick={handleSave} disabled={saving} style={primaryBtnStyle(saving)}>
          {saving ? 'Enregistrement…' : 'Enregistrer'}
        </button>
        <button type="button" onClick={onCancel} style={secBtnStyle}>Annuler</button>
      </div>
    </div>
  );
}

// ─── GestionEnfantsSection ────────────────────────────────────────────────────

function GestionEnfantsSection({ children, uid, parentImages, pin, navigate, refreshParentImages, onChildUpdated }) {
  const [editingChildId, setEditingChildId] = useState(null);
  const [imagesOpen, setImagesOpen] = useState(true);

  return (
    <div style={{ display: 'grid', gap: '2rem' }}>

      {/* Per-child: partie enfant + sauvegardes */}
      {children.length > 0 && (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {children.map(child => (
            <div key={child.id} style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', padding: '1rem 1.1rem', display: 'grid', gap: '0.9rem' }}>
              {/* Child header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span style={{ fontSize: 24, lineHeight: 1 }}>{child.avatar || '🦊'}</span>
                  <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-white)', fontFamily: 'var(--font-display)' }}>{child.name}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingChildId(editingChildId === child.id ? null : child.id)}
                  style={{ background: 'none', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 8, cursor: 'pointer', color: 'rgba(255,255,255,0.75)', padding: '4px 8px', fontSize: '0.75rem', fontWeight: 700, fontFamily: 'var(--font-body)' }}
                >
                  ✏️ Modifier
                </button>
              </div>
              {/* Inline edit form */}
              {editingChildId === child.id && (
                <ChildEditForm
                  uid={uid}
                  child={child}
                  onSaved={(updated) => { onChildUpdated?.(updated); setEditingChildId(null); }}
                  onCancel={() => setEditingChildId(null)}
                />
              )}
              {/* Ouvrir la partie enfant */}
              <div>
                <div style={sectionDividerStyle}>Partie enfant</div>
                <p style={{ fontSize: '0.8rem', color: '#9ca3af', margin: '0 0 0.6rem', lineHeight: 1.5 }}>
                  Ouvrez la partie enfant puis mettez-la en favori sur l'appareil de <strong style={{ color: '#d1d5db' }}>{child.name}</strong>.
                </p>
                <button
                  type="button"
                  onClick={() => { posthog.capture('child_play_launched', { child_id: child.id }); window.open(`/play/${child.id}`, '_blank'); }}
                  style={primaryBtnStyle(false)}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="#fff" style={{ marginRight: 6, verticalAlign: '-1px' }}><path d="M6 4l15 8-15 8V4z"/></svg>
                  Ouvrir la partie enfant
                </button>
              </div>
              {/* Sauvegardes */}
              <BackupRestorePanel uid={uid} childId={child.id} />
            </div>
          ))}
        </div>
      )}

      {/* Bibliothèque images mystère */}
      <div>
        <CollapsibleSection title="Bibliothèque d'images mystère" titleAs="h3" open={imagesOpen} onToggle={() => setImagesOpen(o => !o)}>
        <p style={{ fontSize: '0.83rem', color: '#64748b', lineHeight: 1.7, margin: '0 0 0.9rem' }}>
          Une image mystère se révèle progressivement au fil des sessions, case par case — c'est la récompense visuelle qui motive votre enfant à jouer chaque jour. PrimoLingo inclut déjà un ensemble d'images pré-configurées. Vous pouvez aussi <strong style={{ color: '#9ca3af' }}>ajouter vos propres photos</strong> (vacances, animaux, famille…) selon les goûts de vos enfants, et choisir <strong style={{ color: '#9ca3af' }}>pour quel enfant</strong> chaque image apparaîtra.
        </p>
        <div style={libShellStyle}>
          <ImageLibraryWithRefresh uid={uid} onSaved={refreshParentImages} />
        </div>

        {/* Per-child image activation */}
        {children.length > 0 && parentImages.length > 0 && (
          <div style={{ marginTop: '1.2rem', display: 'grid', gap: '0.75rem' }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Images activées par enfant
            </div>
            {children.map(child => (
              <div key={child.id} style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 10, padding: '0.75rem 0.9rem' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#d1d5db', marginBottom: '0.5rem' }}>
                  {child.avatar || '🦊'} {child.name}
                </div>
                <ChildSettings uid={uid} childId={child.id} parentImages={parentImages} />
              </div>
            ))}
          </div>
        )}
        </CollapsibleSection>
      </div>
    </div>
  );
}

function CollapsibleSection({ title, titleAs: Tag = 'h2', open, onToggle, children, titleStyle }) {
  return (
    <>
      <button
        type="button"
        onClick={onToggle}
        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left' }}
      >
        <Tag style={{ ...(titleStyle || sectionTitleStyle), margin: 0, flex: 1 }}>{title}</Tag>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)', flexShrink: 0 }}><polyline points="6 9 12 15 18 9"/></svg>
      </button>
      {open && <div style={{ marginTop: '1rem' }}>{children}</div>}
    </>
  );
}

// ─── ParentDashboardV2 ────────────────────────────────────────────────────────

export default function ParentDashboardV2() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [parentImages, setParentImages] = useState([]);
  const [openChildIds, setOpenChildIds] = useState(new Set());
  const [monCompteOpen, setMonCompteOpen] = useState(false);
  const [accesEnfantOpen, setAccesEnfantOpen] = useState(true);
  const [gestionOpen, setGestionOpen] = useState(true);
  const [suiviOpen, setSuiviOpen] = useState(true);
  const [pin, setPin] = useState(undefined);
  const [showPinSetup, setShowPinSetup] = useState(false);
  const [showPinManage, setShowPinManage] = useState(false);
  const [pinSetupStep, setPinSetupStep] = useState(1);
  const [pinDraft, setPinDraft] = useState('');
  const [pinError, setPinError] = useState('');
  const [reauthError, setReauthError] = useState('');

  useEffect(() => {
    if (!user?.uid) return;
    const unsub = listChildren(user.uid, (list) => {
      setChildren(list);
      setLoading(false);
      setOpenChildIds(new Set(list.length > 0 ? [list[0].id] : []));
    });
    return unsub;
  }, [user?.uid]);

  useEffect(() => {
    if (!user?.uid) return;
    loadParentImages(user.uid).then(setParentImages);
  }, [user?.uid]);

  useEffect(() => {
    if (!user?.uid) return;
    loadParentalPin(user.uid).then(p => {
      setPin(p);
      if (!p) setShowPinSetup(true);
    });
  }, [user?.uid]);

  const refreshParentImages = useCallback(() => {
    loadParentImages(user?.uid).then(setParentImages);
  }, [user?.uid]);

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
        captureException(err);
        setReauthError('Reconnexion échouée. Réessayez.');
      }
    }
  }, [user?.uid]);

  async function handleSignOut() {
    posthog.capture('parent_signed_out');
    await signOut();
    navigate('/');
  }

  function toggleChild(childId) {
    setOpenChildIds(prev => {
      const next = new Set(prev);
      next.has(childId) ? next.delete(childId) : next.add(childId);
      return next;
    });
  }

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
          borderRadius: 22, padding: '2rem 1.8rem',
          maxWidth: 360, width: '90%',
          border: '1px solid rgba(255,255,255,0.1)', textAlign: 'center',
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
      {showPinSetup && renderPinModal(true)}
      {showPinManage && renderPinModal(false)}

      {/* ── Header ── */}
      <div style={headerStyle}>
        <div style={logoRowStyle}>
          <AppLogo size={40} />
          <span style={logoTitleStyle}>PrimoLingo</span>
          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#a78bfa', marginLeft: 6, padding: '2px 8px', borderRadius: 99, background: 'rgba(167,139,250,0.15)', border: '1px solid rgba(167,139,250,0.25)' }}>v2 bêta</span>
        </div>
        {reauthError && <span style={{ fontSize: '0.75rem', color: '#f87171' }}>{reauthError}</span>}
      </div>

      {/* ── Content ── */}
      <div style={contentStyle}>

        {/* Greeting */}
        <div style={{ marginBottom: '2rem', padding: '1.4rem 1.6rem', background: 'rgba(167,139,250,0.05)', border: '1px solid rgba(167,139,250,0.12)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
          <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--text-white)', marginBottom: '0.8rem', fontFamily: 'var(--font-display)' }}>
            Bonjour 👋
          </div>
          <p style={{ margin: '0 0 0.75rem', fontSize: '0.88rem', color: '#9ca3af', lineHeight: 1.5 }}>
            Bienvenue dans l'espace parent de PrimoLingo. Vous pouvez :
          </p>
          <ol style={{ margin: 0, paddingLeft: '1.3rem', display: 'grid', gap: '0.35rem', textAlign: 'left', maxWidth: 380, marginInline: 'auto' }}>
            <li style={{ fontSize: '0.88rem', color: '#d1d5db', lineHeight: 1.5 }}><strong>Configurer</strong> les profils de vos enfants</li>
            <li style={{ fontSize: '0.88rem', color: '#d1d5db', lineHeight: 1.5 }}><strong>Suivre</strong> leur progression et activité</li>
            <li style={{ fontSize: '0.88rem', color: '#d1d5db', lineHeight: 1.5 }}><strong>Gérer</strong> les images mystère</li>
            <li style={{ fontSize: '0.88rem', color: '#d1d5db', lineHeight: 1.5 }}><strong>Accéder</strong> à la partie enfant</li>
          </ol>
        </div>

        {/* ─ Section 1: Accès enfant ─ */}
        <section style={sectionStyle}>
          <CollapsibleSection title="Accès enfant" open={accesEnfantOpen} onToggle={() => setAccesEnfantOpen(o => !o)}>
            <AccesEnfantSection />
          </CollapsibleSection>
        </section>

        {/* ─ Section 2: Gestion des enfants ─ */}
        <section style={sectionStyle}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
            <CollapsibleSection title="Gestion des enfants" open={gestionOpen} onToggle={() => setGestionOpen(o => !o)}>
              {loading ? null : (
                <GestionEnfantsSection
                  children={children}
                  uid={user.uid}
                  parentImages={parentImages}
                  pin={pin}
                  navigate={navigate}
                  refreshParentImages={refreshParentImages}
                  onChildUpdated={(updated) => setChildren(prev => prev.map(c => c.id === updated.id ? { ...c, ...updated } : c))}
                />
              )}
            </CollapsibleSection>
            {!gestionOpen && (
              <button
                type="button"
                onClick={() => pin ? navigate('/parent/child/new') : setShowPinSetup(true)}
                style={{ ...primaryBtnStyle(false), opacity: pin ? 1 : 0.5 }}
              >
                + Ajouter un enfant
              </button>
            )}
          </div>
          {gestionOpen && (
            <div style={{ marginTop: '0.75rem' }}>
              <button
                type="button"
                onClick={() => pin ? navigate('/parent/child/new') : setShowPinSetup(true)}
                style={{ ...primaryBtnStyle(false), opacity: pin ? 1 : 0.5 }}
              >
                + Ajouter un enfant
              </button>
            </div>
          )}
        </section>

        {/* ─ Section 3: Suivi des enfants ─ */}
        <section style={sectionStyle}>
          <CollapsibleSection title="Suivi des enfants" open={suiviOpen} onToggle={() => setSuiviOpen(o => !o)}>
            {loading ? (
              <div style={{ textAlign: 'center', color: 'var(--color-primary)', padding: '3rem 0' }}>Chargement…</div>
            ) : children.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                <div style={{ fontSize: 48 }}>👶</div>
                <p style={{ color: '#94a3b8', fontSize: '1rem', margin: 0 }}>
                  Aucun enfant pour l'instant.<br />Ajoutez-en un dans « Gestion des enfants » ci-dessus.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {children.map(child => (
                  <ChildPanelV2
                    key={child.id}
                    child={child}
                    uid={user.uid}
                    parentImages={parentImages}
                    isOpen={openChildIds.has(child.id)}
                    onToggle={() => toggleChild(child.id)}
                  />
                ))}
              </div>
            )}
          </CollapsibleSection>
        </section>

        {/* ─ Section 4: Mon compte ─ */}
        <section style={sectionStyle}>
          <CollapsibleSection title="Mon compte" open={monCompteOpen} onToggle={() => setMonCompteOpen(o => !o)}>
            {/* Account info */}
            <div style={{ marginBottom: '1rem', padding: '0.65rem 0.9rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10 }}>
              <p style={{ margin: '0 0 0.5rem', fontSize: '0.95rem', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-display)' }}>Compte connecté</p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.6rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.83rem', color: '#d1d5db', fontWeight: 600 }}>{user?.email || 'compte local'}</span>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', padding: '2px 8px', borderRadius: 99, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    {user?.providerData?.[0]?.providerId === 'google.com' ? '🔵 Google' : user?.uid === 'localhost-dev' ? '🛠 Dev local' : '✉️ Email'}
                  </span>
                </div>
                <button type="button" onClick={handleSignOut} style={logoutBtnStyle}>Déconnexion</button>
              </div>
            </div>
            {/* PIN card */}
            <div style={pinCardStyle}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.9rem' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#fff' }}>Code parental à 4 chiffres</span>
                    <span style={{
                      fontSize: '0.68rem', fontWeight: 800, padding: '2px 8px', borderRadius: 99,
                      background: pin ? 'rgba(74,222,128,0.12)' : 'rgba(251,191,36,0.12)',
                      border: `1px solid ${pin ? 'rgba(74,222,128,0.3)' : 'rgba(251,191,36,0.3)'}`,
                      color: pin ? '#4ade80' : '#fbbf24',
                    }}>
                      {pin === undefined ? '…' : pin ? 'Défini' : 'Non défini'}
                    </span>
                  </div>
                  <ol style={{ margin: '0 0 0.75rem', paddingLeft: '1.1rem' }}>
                    <li style={{ fontSize: '0.83rem', color: '#9ca3af', lineHeight: 1.65, marginBottom: '0.3rem' }}>
                      <strong style={{ color: '#d1d5db' }}>Protéger la flamme</strong> de votre enfant (le nombre de jours consécutifs d'utilisation) quand il a une bonne raison de ne pas avoir joué — week-end familial, pas de possibilité de jouer, etc.
                    </li>
                    <li style={{ fontSize: '0.83rem', color: '#9ca3af', lineHeight: 1.65 }}>
                      <strong style={{ color: '#d1d5db' }}>Restaurer la progression</strong> à un jour particulier en cas de besoin.
                    </li>
                  </ol>
                  <button type="button" onClick={handlePinManageClick} style={secBtnStyle}>
                    {pin ? 'Gérer le code' : 'Définir le code'}
                  </button>
                </div>
              </div>
            </div>
          </CollapsibleSection>
        </section>

        <VersionFooter style={{ marginTop: '2rem', paddingBottom: '5rem' }} />
      </div>
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const containerStyle = {
  minHeight: '100vh',
  backgroundColor: 'var(--color-bg1)',
  backgroundImage: 'var(--app-star-field)',
  backgroundSize: '620px 620px, 680px 680px, 560px 560px, 720px 720px, 640px 640px, 760px 760px, 600px 600px, cover',
  backgroundPosition: 'center center',
  backgroundAttachment: 'fixed',
  fontFamily: 'var(--font-body)',
  color: 'var(--text-white)',
};

const headerStyle = {
  padding: '1rem 1.5rem',
  borderBottom: '1px solid rgba(255,255,255,0.08)',
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  flexWrap: 'wrap', gap: '0.6rem',
};

const logoRowStyle = { display: 'flex', alignItems: 'center', gap: '0.5rem' };
const logoTitleStyle = { fontSize: '1.15rem', fontWeight: 900, color: 'var(--text-white)', fontFamily: 'var(--font-display)' };

const logoutBtnStyle = {
  padding: '7px 14px', borderRadius: 'var(--radius-pill)',
  border: '1px solid var(--glass-border)',
  background: 'var(--glass-bg)', color: 'var(--text-light)',
  fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-body)',
};

const contentStyle = { maxWidth: 860, margin: '0 auto', padding: '2rem 1.25rem' };

const sectionStyle = {
  marginBottom: '2.5rem',
  paddingBottom: '2.5rem',
  borderBottom: '1px solid rgba(255,255,255,0.06)',
};

const sectionTitleStyle = {
  margin: '0 0 1.2rem', fontSize: '1.25rem', fontWeight: 900,
  fontFamily: 'var(--font-display)', color: 'var(--text-white)',
};

const sectionDividerStyle = {
  fontSize: '0.7rem', fontWeight: 800, color: 'rgba(255,255,255,0.3)',
  textTransform: 'uppercase', letterSpacing: '0.12em',
  marginBottom: '0.6rem', paddingBottom: '0.4rem',
  borderBottom: '1px solid rgba(255,255,255,0.06)',
};

const subSectionLabelStyle = {
  fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-accent)', marginBottom: '0.4rem',
};

// PIN card
const pinCardStyle = {
  background: 'rgba(167,139,250,0.05)',
  border: '1px solid rgba(167,139,250,0.15)',
  borderRadius: 16, padding: '1.1rem 1.25rem',
};

// Info card
const infoCardStyle = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: 14, padding: '1rem 1.1rem',
};

// Access card
const accessCardStyle = (color, bg) => ({
  background: bg,
  border: `1px solid ${color}22`,
  borderRadius: 16, padding: '1rem 1.1rem',
  display: 'flex', flexDirection: 'column', gap: '0',
});

const accessCardHeaderStyle = {
  display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem',
};

// Child panel
const panelStyle = {
  background: 'var(--glass-bg)',
  backdropFilter: 'blur(var(--blur-md))', WebkitBackdropFilter: 'blur(var(--blur-md))',
  border: '1px solid var(--glass-border)',
  borderRadius: 'var(--radius-md)',
  overflow: 'hidden',
};

const panelHeaderStyle = {
  display: 'flex', alignItems: 'center', gap: '0.6rem',
  padding: '0.85rem 1rem', cursor: 'pointer',
  userSelect: 'none',
};

const statChipStyle = {
  display: 'inline-flex', alignItems: 'center', gap: 3,
  fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-light)',
  padding: '2px 8px', borderRadius: 99,
  background: 'rgba(255,255,255,0.06)',
};

const chartsLoadingStyle = {
  padding: '1rem', borderRadius: 'var(--radius-sm)',
  background: 'var(--glass-bg)', border: '1px solid var(--glass-border)',
  color: 'var(--text-muted)', fontSize: '0.82rem', textAlign: 'center',
};

// Library shell (always-open, no toggle)
const libShellStyle = {
  background: 'var(--glass-bg)',
  border: '1px solid var(--glass-border)',
  borderRadius: 'var(--radius-md)',
  padding: '1.25rem',
  backdropFilter: 'blur(var(--blur-md))',
  WebkitBackdropFilter: 'blur(var(--blur-md))',
};

// Buttons
const playBtnStyle = {
  width: '100%', padding: '11px 20px', borderRadius: 'var(--radius-pill)', border: 'none',
  background: 'var(--gradient-brand)',
  color: 'var(--text-white)', fontSize: 14, fontWeight: 700,
  cursor: 'pointer', fontFamily: 'var(--font-body)',
  boxShadow: 'var(--shadow-glow)',
};

const primaryBtnStyle = (disabled) => ({
  border: 'none', borderRadius: 'var(--radius-pill)', padding: '9px 18px',
  background: 'var(--gradient-brand)',
  color: 'var(--text-white)', fontSize: 13, fontWeight: 700,
  cursor: disabled ? 'default' : 'pointer', opacity: disabled ? 0.55 : 1,
  fontFamily: 'var(--font-body)', boxShadow: disabled ? 'none' : 'var(--shadow-glow)',
});

const secBtnStyle = {
  border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-pill)', padding: '8px 16px',
  background: 'var(--glass-bg)', color: 'var(--text-light)',
  fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-body)',
};

const dangerBtnStyle = {
  border: '1px solid rgba(248,113,113,0.2)', borderRadius: 'var(--radius-pill)', padding: '8px 14px',
  background: 'rgba(248,113,113,0.08)', color: 'var(--color-red)',
  fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer', fontFamily: 'var(--font-body)',
};

function outlineBtnStyle(color, borderColor, bg) {
  return {
    padding: '0.35rem 0.75rem', borderRadius: 8,
    border: `1px solid ${borderColor}`, background: bg,
    color: color, fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
  };
}

// Form styles
const stepBoxStyle = {
  background: 'var(--glass-bg)', border: '1px solid var(--glass-border)',
  borderRadius: 'var(--radius-sm)', padding: '0.85rem', display: 'grid', gap: '0.65rem',
};
const stepLabelStyle = { fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-white)' };
const uploadBtnStyle = {
  display: 'inline-flex', alignItems: 'center', width: 'fit-content',
  borderRadius: 'var(--radius-pill)', padding: '8px 16px',
  background: 'rgba(167,139,250,0.12)', border: '1px solid rgba(167,139,250,0.2)',
  color: 'var(--color-primary)', fontSize: 13, fontWeight: 700, cursor: 'pointer',
};
const inputStyle = {
  width: '100%', borderRadius: 'var(--radius-sm)',
  border: '1px solid var(--glass-border)',
  background: 'var(--glass-bg)', color: 'var(--text-white)',
  padding: '0.7rem 0.9rem', fontSize: '0.95rem', fontWeight: 700,
  outline: 'none', boxSizing: 'border-box', fontFamily: 'var(--font-body)',
};
const imgCardStyle = {
  display: 'flex', gap: '0.8rem', alignItems: 'center',
  background: 'var(--glass-bg)', border: '1px solid var(--glass-border)',
  borderRadius: 'var(--radius-sm)', padding: '0.6rem',
};
