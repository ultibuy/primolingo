import { useState } from 'react';
import PopupCloseButton from './PopupCloseButton.jsx';

const input = {
  width: '100%', background: 'rgba(0,0,0,0.3)',
  border: '1px solid rgba(255,255,255,0.12)', borderRadius: 8,
  padding: '0.5rem 0.7rem', color: '#e2e2e2', fontSize: '0.85rem',
  fontFamily: 'inherit', outline: 'none',
};
const inputSm = { ...input, fontSize: '0.8rem', padding: '0.4rem 0.6rem' };
const label = {
  fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.1em',
  fontWeight: 800, color: '#9ca3af', marginBottom: '0.2rem', display: 'block',
};
const section = { marginBottom: '1.3rem' };
const sectionTitle = { fontSize: '0.85rem', fontWeight: 700, color: '#c4b5fd', marginBottom: '0.6rem' };
const card = {
  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 12, padding: '0.7rem', marginBottom: '0.4rem',
};
const btnAdd = {
  background: 'rgba(74,222,128,0.12)', border: '1px solid rgba(74,222,128,0.25)',
  borderRadius: 7, padding: '0.2rem 0.6rem', cursor: 'pointer',
  fontSize: '0.7rem', color: '#4ade80', fontWeight: 700,
};
const btnDel = {
  background: 'rgba(248,113,113,0.12)', border: '1px solid rgba(248,113,113,0.25)',
  borderRadius: 6, padding: '0.15rem 0.35rem', cursor: 'pointer',
  fontSize: '0.65rem', color: '#f87171', fontWeight: 700, flexShrink: 0,
};
const row = { display: 'flex', gap: '0.4rem', marginBottom: '0.3rem' };

export default function RuleEditor({ rule, onSave, onClose }) {
  const [title, setTitle] = useState(rule.title || '');
  const [shortTitle, setShortTitle] = useState(rule.shortTitle || '');
  const [desc, setDesc] = useState(rule.description || '');
  const [choices, setChoices] = useState(() => JSON.parse(JSON.stringify(rule.choices || [])));
  const [axes, setAxes] = useState(() => JSON.parse(JSON.stringify(rule.decisionAxes || [])));
  const [memo, setMemo] = useState(() => JSON.parse(JSON.stringify(rule.memoCard || { title: '', rows: [] })));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);

  // ── Choice helpers ──
  const setChoice = (i, field, val) =>
    setChoices(p => p.map((c, j) => j === i ? { ...c, [field]: val } : c));
  const setChoiceProp = (i, key, val) =>
    setChoices(p => p.map((c, j) => {
      if (j !== i) return c;
      const next = { ...c };
      if (val === '' || val === undefined) { delete next[key]; } else {
        // Try to parse booleans/numbers
        if (val === 'true') next[key] = true;
        else if (val === 'false') next[key] = false;
        else if (val === 'null') next[key] = null;
        else if (!isNaN(Number(val)) && val.trim() !== '') next[key] = Number(val);
        else next[key] = val;
      }
      return next;
    }));
  const addChoice = () => setChoices(p => [...p, { id: '', label: '' }]);
  const delChoice = (i) => setChoices(p => p.filter((_, j) => j !== i));
  const addChoiceProp = (i) => {
    const key = prompt("Nom de la propriété (ex: isVerbe, sujet)");
    if (key && key !== 'id' && key !== 'label') setChoiceProp(i, key, '');
  };

  // ── Axis helpers ──
  const setAxisField = (ai, field, val) =>
    setAxes(p => p.map((a, i) => i === ai ? { ...a, [field]: val } : a));
  const setOptField = (ai, oi, field, val) =>
    setAxes(p => p.map((a, i) => i !== ai ? a : {
      ...a, options: a.options.map((o, j) => j !== oi ? o : { ...o, [field]: val })
    }));
  const setOptEliminates = (ai, oi, val) =>
    setOptField(ai, oi, 'eliminates', val.split(',').map(s => s.trim()).filter(Boolean));
  const addAxis = () => setAxes(p => [...p, { id: '', question: '', options: [] }]);
  const delAxis = (ai) => setAxes(p => p.filter((_, i) => i !== ai));
  const addAxisOption = (ai) =>
    setAxes(p => p.map((a, i) => i !== ai ? a : {
      ...a, options: [...(a.options || []), { value: '', label: '', eliminates: [] }]
    }));
  const delAxisOption = (ai, oi) =>
    setAxes(p => p.map((a, i) => i !== ai ? a : {
      ...a, options: a.options.filter((_, j) => j !== oi)
    }));

  // ── Memo helpers ──
  const setMemoField = (field, val) => setMemo(p => ({ ...p, [field]: val }));
  const setMemoRow = (ri, field, val) =>
    setMemo(p => ({ ...p, rows: p.rows.map((r, i) => i === ri ? { ...r, [field]: val } : r) }));
  const addMemoRow = () => setMemo(p => ({ ...p, rows: [...p.rows, { form: '', test: '', example: '' }] }));
  const delMemoRow = (ri) => setMemo(p => ({ ...p, rows: p.rows.filter((_, i) => i !== ri) }));

  // ── Save ──
  const handleSave = async () => {
    setSaving(true); setError(null);
    const data = { id: rule.id, title, shortTitle, description: desc, choices, decisionAxes: axes, memoCard: memo };
    try {
      const res = await fetch('/api/save-rule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: rule.id, data }),
      });
      const result = await res.json();
      if (!res.ok) { setError(result.error); setSaving(false); return; }
      onSave({ ...data, questions: rule.questions });
      setSaved(true); setSaving(false);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      setError(e.message); setSaving(false);
    }
  };

  const extraKeys = (c) => Object.keys(c).filter(k => !['id', 'label'].includes(k));

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
      backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        position: 'relative', width: 'min(720px, 94vw)', maxHeight: '92vh',
        display: 'flex', flexDirection: 'column',
        background: 'rgba(30,30,46,0.98)', border: '1px solid rgba(167,139,250,0.25)',
        borderRadius: 20, boxShadow: '0 20px 80px rgba(0,0,0,0.6)',
        animation: 'bounce-in 0.3s ease forwards',
      }}>
        <PopupCloseButton onClick={onClose} ariaLabel="Fermer" />

        {/* Header */}
        <div style={{ padding: '1rem 1.4rem 0.6rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 800, color: '#f87171', marginBottom: '0.15rem' }}>
            DEBUG — Éditer la règle
          </div>
          <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#c4b5fd' }}>{rule.id}</div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: 'auto', padding: '1rem 1.4rem' }}>

          {/* ═══ Infos ═══ */}
          <div style={section}>
            <div style={sectionTitle}>Informations générales</div>
            <div style={row}>
              <div style={{ flex: 2 }}>
                <span style={label}>Titre</span>
                <input value={title} onChange={e => setTitle(e.target.value)} style={input} />
              </div>
              <div style={{ flex: 1 }}>
                <span style={label}>Titre court</span>
                <input value={shortTitle} onChange={e => setShortTitle(e.target.value)} style={input} />
              </div>
            </div>
            <span style={label}>Description</span>
            <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={2} style={{ ...input, resize: 'vertical' }} />
          </div>

          {/* ═══ Choix ═══ */}
          <div style={section}>
            <div style={{ ...sectionTitle, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Choix de réponse ({choices.length})</span>
              <button onClick={addChoice} style={btnAdd}>+ Ajouter un choix</button>
            </div>
            {choices.map((c, i) => (
              <div key={i} style={card}>
                <div style={{ ...row, alignItems: 'flex-end' }}>
                  <div style={{ width: 80 }}>
                    <span style={label}>ID</span>
                    <input value={c.id} onChange={e => setChoice(i, 'id', e.target.value)} style={inputSm} />
                  </div>
                  <div style={{ width: 100 }}>
                    <span style={label}>Label affiché</span>
                    <input value={c.label} onChange={e => setChoice(i, 'label', e.target.value)} style={inputSm} />
                  </div>
                  <div style={{ flex: 1 }} />
                  <button onClick={() => addChoiceProp(i)} style={{ ...btnAdd, fontSize: '0.63rem', padding: '0.15rem 0.4rem' }}>+ propriété</button>
                  <button onClick={() => delChoice(i)} style={btnDel}>✕</button>
                </div>
                {extraKeys(c).length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginTop: '0.35rem' }}>
                    {extraKeys(c).map(k => (
                      <div key={k} style={{
                        display: 'flex', alignItems: 'center', gap: '0.2rem',
                        background: 'rgba(255,255,255,0.04)', borderRadius: 6,
                        padding: '0.2rem 0.4rem', border: '1px solid rgba(255,255,255,0.06)',
                      }}>
                        <span style={{ fontSize: '0.65rem', color: '#9ca3af', fontWeight: 700 }}>{k}:</span>
                        <input
                          value={String(c[k] ?? '')}
                          onChange={e => setChoiceProp(i, k, e.target.value)}
                          style={{ ...inputSm, width: 70, fontSize: '0.72rem', padding: '0.15rem 0.3rem', border: 'none', background: 'transparent', color: '#fde68a' }}
                        />
                        <button onClick={() => setChoiceProp(i, k, undefined)} style={{ ...btnDel, fontSize: '0.5rem', padding: '0.1rem 0.2rem' }}>✕</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* ═══ Axes ═══ */}
          <div style={section}>
            <div style={{ ...sectionTitle, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Axes de décision ({axes.length})</span>
              <button onClick={addAxis} style={btnAdd}>+ Ajouter un axe</button>
            </div>
            {axes.map((axis, ai) => (
              <div key={ai} style={{ ...card, borderLeft: '3px solid #a78bfa44' }}>
                <div style={{ ...row, alignItems: 'flex-end', marginBottom: '0.4rem' }}>
                  <div style={{ width: 100 }}>
                    <span style={label}>ID axe</span>
                    <input value={axis.id} onChange={e => setAxisField(ai, 'id', e.target.value)} style={inputSm} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <span style={label}>Question affichée</span>
                    <input value={axis.question} onChange={e => setAxisField(ai, 'question', e.target.value)} style={inputSm} />
                  </div>
                  <button onClick={() => delAxis(ai)} style={btnDel}>✕ axe</button>
                </div>
                {axis.dependsOn && (
                  <div style={{ fontSize: '0.68rem', color: '#6b7280', marginBottom: '0.3rem' }}>
                    Dépend de : <strong style={{ color: '#c4b5fd' }}>{axis.dependsOn}</strong>
                    {axis.showWhen !== undefined && <span> (showWhen: {String(axis.showWhen)})</span>}
                  </div>
                )}
                <div style={{ marginBottom: '0.4rem' }}>
                  <span style={label}>Sous-titre</span>
                  <input value={axis.sub || ''} onChange={e => setAxisField(ai, 'sub', e.target.value)} style={inputSm} placeholder="Ex : Test : remplace par « avait »" />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#9ca3af' }}>Options ({axis.options?.length || 0})</span>
                  <button onClick={() => addAxisOption(ai)} style={{ ...btnAdd, fontSize: '0.63rem' }}>+ option</button>
                </div>
                {axis.options?.map((opt, oi) => (
                  <div key={oi} style={{
                    background: 'rgba(255,255,255,0.03)', borderRadius: 8,
                    padding: '0.45rem', marginBottom: '0.25rem',
                    border: '1px solid rgba(255,255,255,0.05)',
                  }}>
                    <div style={{ ...row, alignItems: 'flex-end' }}>
                      <div style={{ flex: 1 }}>
                        <span style={label}>Label</span>
                        <input value={opt.label} onChange={e => setOptField(ai, oi, 'label', e.target.value)} style={inputSm} />
                      </div>
                      <div style={{ width: 80 }}>
                        <span style={label}>Value</span>
                        <input value={String(opt.value ?? '')} style={{ ...inputSm, opacity: 0.6 }}
                          onChange={e => {
                            let v = e.target.value;
                            if (v === 'true') v = true;
                            else if (v === 'false') v = false;
                            setOptField(ai, oi, 'value', v);
                          }} />
                      </div>
                      <button onClick={() => delAxisOption(ai, oi)} style={btnDel}>✕</button>
                    </div>
                    <div style={{ marginTop: '0.25rem' }}>
                      <span style={label}>Élimine (IDs séparés par virgule)</span>
                      <input
                        value={(opt.eliminates || []).join(', ')}
                        onChange={e => setOptEliminates(ai, oi, e.target.value)}
                        style={{ ...inputSm, color: '#f87171' }}
                        placeholder="ex: a, as"
                      />
                    </div>
                    {opt.sub && (
                      <div style={{ marginTop: '0.25rem' }}>
                        <span style={label}>Sous-texte</span>
                        <input value={opt.sub} onChange={e => setOptField(ai, oi, 'sub', e.target.value)} style={inputSm} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* ═══ Mémo ═══ */}
          <div style={section}>
            <div style={{ ...sectionTitle, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Fiche mémo ({memo.rows?.length || 0} lignes)</span>
              <button onClick={addMemoRow} style={btnAdd}>+ ligne</button>
            </div>
            <span style={label}>Titre</span>
            <input value={memo.title || ''} onChange={e => setMemoField('title', e.target.value)} style={{ ...input, marginBottom: '0.5rem' }} />
            {memo.rows?.map((r, i) => (
              <div key={i} style={{ ...row, ...card, alignItems: 'flex-end', padding: '0.5rem', marginBottom: '0.3rem' }}>
                <div style={{ width: 55 }}>
                  <span style={label}>Forme</span>
                  <input value={r.form || ''} onChange={e => setMemoRow(i, 'form', e.target.value)} style={inputSm} />
                </div>
                <div style={{ flex: 1 }}>
                  <span style={label}>Test</span>
                  <input value={r.test || ''} onChange={e => setMemoRow(i, 'test', e.target.value)} style={inputSm} />
                </div>
                <div style={{ flex: 1 }}>
                  <span style={label}>Exemple</span>
                  <input value={r.example || ''} onChange={e => setMemoRow(i, 'example', e.target.value)} style={inputSm} />
                </div>
                <button onClick={() => delMemoRow(i)} style={btnDel}>✕</button>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '0.7rem 1.4rem 1rem',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', gap: '0.5rem', justifyContent: 'space-between', alignItems: 'center',
        }}>
          {error && <div style={{ fontSize: '0.75rem', color: '#f87171', flex: 1 }}>{error}</div>}
          <div style={{ display: 'flex', gap: '0.5rem', marginLeft: 'auto' }}>
            <button onClick={onClose} style={{
              padding: '0.5rem 1rem', borderRadius: 10,
              border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)',
              color: '#9ca3af', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600,
            }}>Annuler</button>
            <button onClick={handleSave} disabled={saving} style={{
              padding: '0.5rem 1.2rem', borderRadius: 10, border: 'none',
              background: saved ? 'linear-gradient(135deg, #059669, #34d399)' : 'linear-gradient(135deg, #7c3aed, #a78bfa)',
              color: '#fff', cursor: saving ? 'wait' : 'pointer', fontSize: '0.85rem', fontWeight: 700,
              boxShadow: '0 2px 10px rgba(124,58,237,0.3)', minWidth: 140, opacity: saving ? 0.7 : 1,
            }}>
              {saving ? 'Sauvegarde…' : saved ? '✓ Sauvé sur disque' : 'Sauvegarder'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
