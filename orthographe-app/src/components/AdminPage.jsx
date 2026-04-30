import { useEffect, useState } from 'react';

const TILE_COUNT = 6;

function createEmptyDraft() {
  return {
    imageDataUrl: '',
    finalTileIndex: null,
    title: '',
    fileName: '',
  };
}

function createCustomMysteryImageId() {
  return `custom-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export default function AdminPage({
  settings,
  onSave,
  onBack,
  saving = false,
  saveError = null,
}) {
  const [form, setForm] = useState(() => ({
    prodQuestionCount: String(settings?.prodQuestionCount || 20),
    customMysteryImages: settings?.customMysteryImages || [],
  }));
  const [localMessage, setLocalMessage] = useState('');
  const [mysteryDraft, setMysteryDraft] = useState(createEmptyDraft);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setForm({
      prodQuestionCount: String(settings?.prodQuestionCount || 20),
      customMysteryImages: settings?.customMysteryImages || [],
    });
  }, [settings]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const result = await onSave({
      prodQuestionCount: form.prodQuestionCount,
      customMysteryImages: form.customMysteryImages,
    });

    if (result?.success) {
      setLocalMessage('Paramètres admin sauvegardés.');
      setTimeout(() => setLocalMessage(''), 1800);
    }
  };

  const handleMysteryFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setMysteryDraft({
        imageDataUrl: String(reader.result || ''),
        finalTileIndex: null,
        title: '',
        fileName: file.name,
      });
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  const handleAddMysteryImage = () => {
    if (!mysteryDraft.imageDataUrl || mysteryDraft.finalTileIndex === null || !mysteryDraft.title.trim()) return;
    setForm((prev) => ({
      ...prev,
      customMysteryImages: [
        ...prev.customMysteryImages,
        {
          id: createCustomMysteryImageId(),
          title: mysteryDraft.title.trim(),
          imageDataUrl: mysteryDraft.imageDataUrl,
          finalTileIndex: mysteryDraft.finalTileIndex,
        },
      ],
    }));
    setMysteryDraft(createEmptyDraft());
  };

  const handleRemoveMysteryImage = (imageId) => {
    setForm((prev) => ({
      ...prev,
      customMysteryImages: prev.customMysteryImages.filter((entry) => entry.id !== imageId),
    }));
  };

  return (
    <div style={pageStyle}>
      <div style={shellStyle}>
        <div style={headerStyle}>
          {onBack && (
            <button type="button" onClick={onBack} style={backLinkStyle}>← Retour</button>
          )}
          <div style={{ textAlign: 'center', flex: 1 }}>
            <div style={kickerStyle}>Administration</div>
            <h1 style={titleStyle}>Paramètres admin</h1>
          </div>
          <div style={{ minWidth: 100 }} />
        </div>

        <form onSubmit={handleSubmit} style={formStyle}>
          <section style={sectionStyle}>
            <div style={sectionTitleStyle}>Nombre de questions par session</div>
            <p style={sectionTextStyle}>
              Nombre de questions par session de quiz (entre 1 et 50).
            </p>

            <label style={fieldStyle}>
              <span style={labelStyle}>Questions par session</span>
              <input
                type="number"
                min="1"
                max="50"
                value={form.prodQuestionCount}
                onChange={(event) => setForm((prev) => ({ ...prev, prodQuestionCount: event.target.value }))}
                style={inputStyle}
              />
            </label>
          </section>

          <section style={sectionStyle}>
            <div style={sectionTitleStyle}>Nouvelle image mystère</div>
            <p style={sectionTextStyle}>
              Workflow: 1) upload une image, 2) choisis la case qui contient la tête pour qu'elle soit dévoilée en dernier, 3) donne un titre mystérieux visible dans la boutique.
            </p>

            <div style={stepBoxStyle}>
              <div style={stepLabelStyle}>1. Upload</div>
              <label style={uploadBoxStyle}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleMysteryFileChange}
                  style={{ display: 'none' }}
                />
                <span style={uploadButtonStyle}>Choisir une image</span>
                <span style={uploadHintStyle}>
                  {mysteryDraft.fileName || 'PNG, JPG ou WEBP'}
                </span>
              </label>
            </div>

            {mysteryDraft.imageDataUrl && (
              <>
                <div style={stepBoxStyle}>
                  <div style={stepLabelStyle}>2. Choix de la tête</div>
                  <p style={miniHelpStyle}>
                    Clique sur la case qui contient la tête. Cette case sera révélée en dernier dans la boutique.
                  </p>
                  <MysteryTileSelector
                    imageDataUrl={mysteryDraft.imageDataUrl}
                    selectedTileIndex={mysteryDraft.finalTileIndex}
                    onSelect={(tileIndex) => setMysteryDraft((prev) => ({ ...prev, finalTileIndex: tileIndex }))}
                  />
                </div>

                <div style={stepBoxStyle}>
                  <div style={stepLabelStyle}>3. Titre mystérieux</div>
                  <label style={fieldStyle}>
                    <span style={labelStyle}>Titre affiché à l'enfant</span>
                    <input
                      type="text"
                      value={mysteryDraft.title}
                      onChange={(event) => setMysteryDraft((prev) => ({ ...prev, title: event.target.value }))}
                      placeholder="Ex: Le dragon des cascades"
                      style={inputStyle}
                    />
                  </label>
                  <div style={draftActionsStyle}>
                    <button
                      type="button"
                      onClick={() => setMysteryDraft(createEmptyDraft())}
                      style={secondaryButtonStyle}
                    >
                      Réinitialiser
                    </button>
                    <button
                      type="button"
                      onClick={handleAddMysteryImage}
                      disabled={!mysteryDraft.imageDataUrl || mysteryDraft.finalTileIndex === null || !mysteryDraft.title.trim()}
                      style={saveButtonStyle(!mysteryDraft.imageDataUrl || mysteryDraft.finalTileIndex === null || !mysteryDraft.title.trim())}
                    >
                      Ajouter à la boutique
                    </button>
                  </div>
                </div>
              </>
            )}

            <div style={stepBoxStyle}>
              <div style={stepLabelStyle}>Images mystère personnalisées</div>
              {form.customMysteryImages.length === 0 ? (
                <p style={miniHelpStyle}>Aucune image personnalisée pour l'instant.</p>
              ) : (
                <div style={customListStyle}>
                  {form.customMysteryImages.map((entry) => (
                    <div key={entry.id} style={customCardStyle}>
                      <div style={customPreviewStyle}>
                        <img src={entry.imageDataUrl} alt={entry.title} style={customPreviewImageStyle} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={customTitleStyle}>{entry.title}</div>
                        <div style={customMetaStyle}>
                          Tête finale: case {entry.finalTileIndex + 1}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveMysteryImage(entry.id)}
                        style={dangerButtonStyle}
                      >
                        Supprimer
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          <div style={footerStyle}>
            <div style={messageStyle(saveError)}>
              {saveError || localMessage || ' '}
            </div>
            <button type="submit" disabled={saving} style={saveButtonStyle(saving)}>
              {saving ? 'Sauvegarde...' : 'Sauvegarder'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function MysteryTileSelector({ imageDataUrl, selectedTileIndex, onSelect }) {
  return (
    <div style={mysterySelectorStyle}>
      <img src={imageDataUrl} alt="Découpage de l'image mystère" style={mysterySelectorImageStyle} />
      {Array.from({ length: TILE_COUNT }).map((_, tileIndex) => {
        const col = tileIndex % 3;
        const row = Math.floor(tileIndex / 3);
        const selected = selectedTileIndex === tileIndex;
        return (
          <button
            key={tileIndex}
            type="button"
            onClick={() => onSelect(tileIndex)}
            style={{
              ...tileButtonStyle,
              left: `${col * 33.3333}%`,
              top: `${row * 50}%`,
              borderColor: selected ? '#fbbf24' : 'rgba(255,255,255,0.14)',
              background: selected ? 'rgba(251,191,36,0.18)' : 'rgba(10,14,24,0.15)',
              boxShadow: selected ? 'inset 0 0 0 2px rgba(251,191,36,0.45)' : 'inset 0 0 0 1px rgba(255,255,255,0.04)',
            }}
          >
            <span style={tileBadgeStyle(selected)}>{tileIndex + 1}</span>
          </button>
        );
      })}
    </div>
  );
}

const pageStyle = {
  minHeight: '100vh',
  backgroundColor: 'var(--color-bg1)',
  backgroundImage: 'var(--app-page-overlay), var(--app-page-image)',
  backgroundSize: 'cover, cover',
  backgroundPosition: 'center, center',
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'center',
  padding: '1.2rem',
  fontFamily: 'var(--font-body)',
  color: '#e2e2e2',
};

const shellStyle = {
  width: 'min(820px, 100%)',
  background: 'linear-gradient(180deg, rgba(var(--color-bg1-rgb),0.96), rgba(var(--color-bg2-rgb),0.9))',
  border: '1px solid rgba(var(--color-primary-rgb),0.16)',
  borderRadius: 28,
  boxShadow: '0 20px 60px rgba(0,0,0,0.35)',
  padding: '1rem',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
};

const headerStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.8rem',
  justifyContent: 'space-between',
  marginBottom: '1rem',
};

const kickerStyle = {
  fontSize: '0.72rem',
  textTransform: 'uppercase',
  letterSpacing: '0.14em',
  color: 'var(--color-accent)',
  fontWeight: 800,
  marginBottom: '0.3rem',
};

const titleStyle = {
  fontSize: '1.8rem',
  lineHeight: 1.05,
  fontWeight: 800,
  margin: 0,
  color: '#fff',
  fontFamily: 'var(--font-display)',
};

const formStyle = {
  display: 'grid',
  gap: '1rem',
};

const sectionStyle = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.06)',
  borderRadius: 20,
  padding: '1rem',
  display: 'grid',
  gap: '0.8rem',
};

const sectionTitleStyle = {
  fontSize: '1rem',
  fontWeight: 800,
  color: '#fff',
};

const sectionTextStyle = {
  fontSize: '0.86rem',
  color: '#9ca3af',
  lineHeight: 1.5,
  margin: 0,
};

const fieldStyle = {
  display: 'grid',
  gap: '0.35rem',
};

const labelStyle = {
  fontSize: '0.76rem',
  fontWeight: 700,
  color: 'var(--color-accent)',
};

const inputStyle = {
  width: '100%',
  borderRadius: 12,
  border: '1px solid rgba(var(--color-primary-rgb),0.24)',
  background: 'rgba(0,0,0,0.24)',
  color: '#fff',
  padding: '0.78rem 0.9rem',
  fontSize: '0.96rem',
  fontWeight: 700,
  outline: 'none',
};

const footerStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '1rem',
  flexWrap: 'wrap',
};

const messageStyle = (hasError) => ({
  minHeight: 20,
  fontSize: '0.82rem',
  color: hasError ? '#fca5a5' : '#a7f3d0',
  fontWeight: 600,
});

const saveButtonStyle = (disabled) => ({
  border: 'none',
  borderRadius: 14,
  padding: '0.8rem 1.2rem',
  background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
  color: '#fff',
  fontSize: '0.92rem',
  fontWeight: 800,
  cursor: disabled ? 'default' : 'pointer',
  opacity: disabled ? 0.65 : 1,
  boxShadow: '0 10px 24px rgba(var(--color-primary-rgb),0.22)',
});

const secondaryButtonStyle = {
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 14,
  padding: '0.8rem 1.2rem',
  background: 'rgba(255,255,255,0.04)',
  color: '#cbd5e1',
  fontSize: '0.9rem',
  fontWeight: 800,
  cursor: 'pointer',
};

const dangerButtonStyle = {
  border: '1px solid rgba(248,113,113,0.2)',
  borderRadius: 12,
  padding: '0.62rem 0.9rem',
  background: 'rgba(248,113,113,0.08)',
  color: '#fca5a5',
  fontSize: '0.78rem',
  fontWeight: 800,
  cursor: 'pointer',
};

const linkBaseStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: 100,
  borderRadius: 12,
  padding: '0.55rem 0.8rem',
  textDecoration: 'none',
  fontSize: '0.76rem',
  fontWeight: 700,
};

const backLinkStyle = {
  ...linkBaseStyle,
  background: 'rgba(var(--color-primary-rgb),0.1)',
  border: '1px solid rgba(var(--color-primary-rgb),0.18)',
  color: 'var(--color-accent)',
};


const stepBoxStyle = {
  background: 'rgba(0,0,0,0.18)',
  border: '1px solid rgba(255,255,255,0.05)',
  borderRadius: 16,
  padding: '0.85rem',
  display: 'grid',
  gap: '0.7rem',
};

const stepLabelStyle = {
  fontSize: '0.8rem',
  fontWeight: 800,
  color: '#fff',
};

const uploadBoxStyle = {
  display: 'grid',
  gap: '0.45rem',
};

const uploadButtonStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 'fit-content',
  borderRadius: 12,
  padding: '0.72rem 1rem',
  background: 'rgba(var(--color-accent-rgb),0.12)',
  border: '1px solid rgba(var(--color-accent-rgb),0.2)',
  color: 'var(--color-accent)',
  fontSize: '0.84rem',
  fontWeight: 800,
  cursor: 'pointer',
};

const uploadHintStyle = {
  fontSize: '0.76rem',
  color: '#9ca3af',
};

const miniHelpStyle = {
  fontSize: '0.78rem',
  color: '#9ca3af',
  lineHeight: 1.5,
  margin: 0,
};

const draftActionsStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: '0.8rem',
  flexWrap: 'wrap',
};

const mysterySelectorStyle = {
  position: 'relative',
  width: '100%',
  aspectRatio: '1408 / 768',
  overflow: 'hidden',
  borderRadius: 18,
  border: '1px solid rgba(255,255,255,0.08)',
  background: '#0b1020',
};

const mysterySelectorImageStyle = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  display: 'block',
};

const tileButtonStyle = {
  position: 'absolute',
  width: '33.3333%',
  height: '50%',
  border: '1px solid rgba(255,255,255,0.14)',
  background: 'rgba(10,14,24,0.15)',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const tileBadgeStyle = (selected) => ({
  width: 34,
  height: 34,
  borderRadius: 999,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: selected ? '#fbbf24' : 'rgba(15,23,42,0.7)',
  color: selected ? '#111827' : '#fff',
  fontSize: '0.88rem',
  fontWeight: 900,
});

const customListStyle = {
  display: 'grid',
  gap: '0.7rem',
};

const customCardStyle = {
  display: 'flex',
  gap: '0.8rem',
  alignItems: 'center',
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.06)',
  borderRadius: 16,
  padding: '0.7rem',
};

const customPreviewStyle = {
  width: 120,
  aspectRatio: '1408 / 768',
  overflow: 'hidden',
  borderRadius: 12,
  flexShrink: 0,
  background: '#0b1020',
};

const customPreviewImageStyle = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  display: 'block',
};

const customTitleStyle = {
  fontSize: '0.9rem',
  fontWeight: 800,
  color: '#fff',
  marginBottom: '0.2rem',
};

const customMetaStyle = {
  fontSize: '0.76rem',
  color: '#9ca3af',
};
