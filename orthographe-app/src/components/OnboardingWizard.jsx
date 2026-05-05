import { useState, useCallback, useRef } from 'react';
import PopupModal from './PopupModal.jsx';
import PinInput from './PinInput.jsx';
import { hashPin } from '../services/pin-crypto.js';
import { saveParentalPin, createChild, saveOnboardingWizard } from '../services/store.js';
import { CheckIcon, BookmarkIcon } from './icons/ProductIcons.jsx';
import AppLogo from './AppLogo.jsx';
import { slugify } from '../pages/ChildBySlug.jsx';

const AVATARS = ['🦊', '🐱', '🦁', '🐸', '🐵', '🦄', '🐲', '🦅', '🐺', '🐼', '🦈', '🐙', '🐴'];

function formatChildNames(list) {
  const names = list.map(c => c.name);
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} et ${names[1]}`;
  return names.slice(0, -1).join(', ') + ' et ' + names[names.length - 1];
}

const STEP_TITLES = [
  'Configurez votre code secret',
  'Ajouter un enfant',
  'Ajoutez cette page à vos favoris',
  'Configurez l\'app pour votre enfant',
  'C\'est tout bon',
];

export default function OnboardingWizard({
  uid,
  email,
  pin,
  children,
  initialStep,
  wizardState,
  onPinSaved,
  onComplete,
}) {
  const [currentStep, setCurrentStep] = useState(initialStep);

  // Step 1: PIN
  const [pinSubStep, setPinSubStep] = useState(1); // 1=choose, 2=confirm
  const [pinDraft, setPinDraft] = useState('');
  const [pinError, setPinError] = useState('');
  const [pinSaved, setPinSaved] = useState(!!pin);

  // Step 2: Add child
  const [childName, setChildName] = useState('');
  const [childAvatar, setChildAvatar] = useState('🦊');
  const [locallyAdded, setLocallyAdded] = useState([]); // children created in this wizard session

  // Step 4: Device config
  const [deviceChoice, setDeviceChoice] = useState(initialStep === 4 ? 'oui' : null);

  // Track accumulated wizard state locally to avoid stale closure issues
  const wizardRef = useRef(wizardState || { completedSteps: [], step4DeviceYes: false, dismissed: false });

  const saveStep = useCallback(async (stepNum, extra = {}) => {
    const current = wizardRef.current;
    const completedSteps = current.completedSteps.includes(stepNum)
      ? current.completedSteps
      : [...current.completedSteps, stepNum];
    const next = { ...current, completedSteps, ...extra };
    wizardRef.current = next;
    await saveOnboardingWizard(uid, next);
    return next;
  }, [uid]);

  const handleNext = useCallback(async () => {
    // Auto-add child if form is filled on step 2
    if (currentStep === 2 && childName.trim()) {
      const name = childName.trim();
      await createChild(uid, name, childAvatar);
      setLocallyAdded(prev => [...prev, { name: name.charAt(0).toUpperCase() + name.slice(1), avatar: childAvatar }]);
      setChildName('');
      setChildAvatar('🦊');
    }
    if (currentStep === 5) {
      await saveStep(5, { dismissed: true });
      onComplete();
    } else if (currentStep === 4) {
      await saveStep(4, { step4DeviceYes: deviceChoice === 'oui' });
      setCurrentStep(5);
    } else {
      await saveStep(currentStep);
      setCurrentStep(currentStep + 1);
    }
  }, [currentStep, deviceChoice, saveStep, onComplete, childName, childAvatar, uid]);

  const handlePinComplete = useCallback(async (val) => {
    if (pinSubStep === 1) {
      setPinDraft(val);
      setPinSubStep(2);
      setPinError('');
    } else {
      if (val === pinDraft) {
        const pinData = await hashPin(val);
        await saveParentalPin(uid, pinData);
        onPinSaved(pinData);
        setPinSaved(true);
        setPinError('');
      } else {
        setPinError('Les codes ne correspondent pas.');
        setPinSubStep(1);
        setPinDraft('');
      }
    }
  }, [pinSubStep, pinDraft, uid, onPinSaved]);

  // Merge prop children with locally added ones (local-store doesn't have onSnapshot)
  const allChildren = [
    ...children.map(c => ({ name: c.name, avatar: c.avatar })),
    ...locallyAdded.filter(la => !children.some(c => c.name === la.name)),
  ];

  // Can advance?
  const canNext =
    currentStep === 1 ? pinSaved :
    currentStep === 2 ? childName.trim().length > 0 || allChildren.length > 0 :
    currentStep === 3 ? true :
    currentStep === 4 ? deviceChoice !== null :
    currentStep === 5 ? true :
    false;

  const firstChild = children[0];

  return (
    <PopupModal
      closeOnBackdrop={false}
      showClose={false}
      zIndex={1100}
      ariaLabel="Assistant de configuration"
      panelStyle={{
        width: 'min(480px, calc(100vw - 2rem))',
        padding: '1.8rem 1.5rem',
      }}
    >
      {/* Step indicator */}
      <div style={stepIndicatorRow}>
        {[1, 2, 3, 4, 5].map(s => (
          <div key={s} style={{
            display: 'flex', alignItems: 'center', gap: 0,
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.75rem', fontWeight: 800,
              background: s < currentStep ? 'var(--gradient-brand)' :
                          s === currentStep ? 'rgba(var(--color-primary-rgb),0.2)' :
                          'rgba(255,255,255,0.06)',
              color: s <= currentStep ? '#fff' : 'rgba(255,255,255,0.3)',
              border: s === currentStep ? '2px solid var(--color-primary)' : '2px solid transparent',
              transition: 'all 0.2s',
            }}>
              {s < currentStep ? '✓' : s}
            </div>
            {s < 5 && <div style={{
              width: 24, height: 2,
              background: s < currentStep ? 'var(--color-primary)' : 'rgba(255,255,255,0.1)',
              transition: 'background 0.2s',
            }} />}
          </div>
        ))}
      </div>

      {/* Title */}
      <h2 style={titleStyle}>{STEP_TITLES[currentStep - 1]}</h2>

      {/* Step content */}
      <div style={{ minHeight: 140 }}>
        {currentStep === 1 && (
          <div style={{ textAlign: 'center' }}>
            {pinSaved ? (
              <div style={successBox}>
                <CheckIcon size={32} />
                <p style={{ margin: '0.5rem 0 0', fontSize: '0.88rem', color: 'var(--color-green)', fontWeight: 700 }}>
                  Code secret défini&nbsp;!
                </p>
              </div>
            ) : (
              <>
                <p style={subtitleStyle}>
                  Ce code à 4 chiffres protège l'accès au tableau de bord parent.
                </p>
                <p style={{ fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '0.8rem', fontWeight: 600 }}>
                  {pinSubStep === 1 ? 'Choisissez un code à 4 chiffres' : 'Confirmez le code'}
                </p>
                <PinInput
                  key={pinSubStep}
                  masked={false}
                  onComplete={handlePinComplete}
                  error={pinError}
                />
              </>
            )}
          </div>
        )}

        {currentStep === 2 && (
          <div>
            <div style={{ display: 'grid', gap: '0.65rem' }}>
              <div>
                <div style={fieldLabel}>Prénom</div>
                <input
                  type="text"
                  value={childName}
                  onChange={e => setChildName(e.target.value)}
                  maxLength={20}
                  placeholder="Ex : Théo"
                  style={inputStyle}
                  autoFocus
                />
              </div>
              <div>
                <div style={fieldLabel}>Avatar</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                  {AVATARS.map(a => (
                    <button
                      key={a}
                      type="button"
                      onClick={() => setChildAvatar(a)}
                      style={{
                        fontSize: 22, lineHeight: 1, padding: '0.25rem', borderRadius: 8, cursor: 'pointer',
                        border: `2px solid ${a === childAvatar ? '#a78bfa' : 'rgba(255,255,255,0.1)'}`,
                        background: a === childAvatar ? 'rgba(167,139,250,0.15)' : 'rgba(255,255,255,0.04)',
                      }}
                    >{a}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div style={{ textAlign: 'center' }}>
            <BookmarkIcon size={48} />
            <p style={{ ...subtitleStyle, maxWidth: 320, marginInline: 'auto' }}>
              Cela vous permettra de la retrouver facilement.<br />
              Son adresse est <strong style={{ color: '#fff' }}>www.primolingo.fr/parent</strong>
            </p>
          </div>
        )}

        {currentStep === 4 && (
          <div>
            <p style={subtitleStyle}>
              Votre enfant utilisera-t-il <strong style={{ color: '#fff' }}>cet appareil</strong> pour jouer&nbsp;?
            </p>
            <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '1.2rem' }}>
              {['oui', 'non'].map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setDeviceChoice(val)}
                  style={{
                    flex: 1, padding: '0.7rem', borderRadius: 12, cursor: 'pointer',
                    border: `2px solid ${deviceChoice === val ? 'var(--color-primary)' : 'rgba(255,255,255,0.1)'}`,
                    background: deviceChoice === val ? 'rgba(var(--color-primary-rgb),0.12)' : 'rgba(255,255,255,0.03)',
                    color: deviceChoice === val ? '#fff' : '#9ca3af',
                    fontSize: '0.95rem', fontWeight: 800, fontFamily: 'var(--font-body)',
                    transition: 'all 0.15s',
                  }}
                >
                  {val === 'oui' ? 'Oui' : 'Non'}
                </button>
              ))}
            </div>

            {deviceChoice === 'oui' && allChildren.length > 0 && (
              <div style={instructionBox}>
                <ol style={instructionList}>
                  <li>
                    Allez sur l'espace de votre enfant
                    <ul style={{ listStyle: 'none', padding: 0, margin: '0.4rem 0 0', display: 'grid', gap: '0.3rem' }}>
                      {allChildren.map(c => (
                        <li key={c.name}>
                          <a
                            href={`/enfant/${slugify(c.name)}?from=onboarding`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: 'var(--color-primary)', fontWeight: 700, textDecoration: 'underline', fontSize: '0.83rem' }}
                          >
                            www.primolingo.fr/enfant/{slugify(c.name)}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </li>
                  <li>
                    Une fois sur son espace, mettez-le en favori{' '}
                    <span style={{ verticalAlign: '-2px', display: 'inline-block' }}><BookmarkIcon size={14} color="var(--color-gold)" /></span>
                  </li>
                  <li>Revenez ici pour terminer</li>
                </ol>
              </div>
            )}

            {deviceChoice === 'non' && (
              <div style={instructionBox}>
                <ol style={instructionList}>
                  <li>Allez sur <strong style={{ color: '#fff' }}>www.primolingo.fr</strong> depuis l'appareil de l'enfant</li>
                  <li>Connectez-vous avec le compte parent{email ? <> (<strong style={{ color: '#fff' }}>{email}</strong>)</> : null}</li>
                  <li>Suivez le guide</li>
                </ol>
              </div>
            )}
          </div>
        )}

        {currentStep === 5 && (
          <div style={{ textAlign: 'center' }}>
            <AppLogo size={100} animated />
            {deviceChoice === 'non' ? (
              <p style={{ fontSize: '0.9rem', color: '#9ca3af', fontWeight: 600, marginTop: '1rem', lineHeight: 1.6 }}>
                Connectez-vous sur l'appareil de l'enfant pour terminer la configuration.
              </p>
            ) : (
              <p style={{ fontSize: '1rem', color: '#fff', fontWeight: 700, marginTop: '1rem', lineHeight: 1.6 }}>
                L'aventure PrimoLingo commence&nbsp;!
              </p>
            )}
          </div>
        )}
      </div>

      {/* Next / Terminer button */}
      <button
        type="button"
        onClick={handleNext}
        disabled={!canNext}
        style={nextBtnStyle(!canNext)}
      >
        {currentStep === 5 ? 'Terminer' : 'Suivant'}
      </button>
    </PopupModal>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const stepIndicatorRow = {
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  gap: 0, marginBottom: '1.4rem',
};

const titleStyle = {
  fontSize: '1.1rem', fontWeight: 900,
  color: 'var(--text-white)', fontFamily: 'var(--font-display)',
  textAlign: 'center', margin: '0 0 1rem',
};

const subtitleStyle = {
  fontSize: '0.85rem', color: '#9ca3af', lineHeight: 1.6,
  margin: '0 0 1rem',
};

const fieldLabel = {
  fontSize: '0.72rem', fontWeight: 800, color: 'rgba(255,255,255,0.4)',
  textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.35rem',
};

const inputStyle = {
  width: '100%', borderRadius: 'var(--radius-sm)',
  border: '1px solid var(--glass-border)',
  background: 'var(--glass-bg)', color: 'var(--text-white)',
  padding: '0.65rem 0.85rem', fontSize: '0.92rem', fontWeight: 700,
  outline: 'none', boxSizing: 'border-box', fontFamily: 'var(--font-body)',
};

const successBox = {
  display: 'flex', flexDirection: 'column', alignItems: 'center',
  padding: '1rem 0',
};

const instructionBox = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 12, padding: '0.8rem 1rem',
};

const instructionList = {
  margin: 0, paddingLeft: '1.1rem',
  display: 'grid', gap: '0.5rem',
  fontSize: '0.85rem', color: '#d1d5db', lineHeight: 1.6,
};

const nextBtnStyle = (disabled) => ({
  width: '100%', marginTop: '1.2rem',
  border: 'none', borderRadius: 'var(--radius-pill)', padding: '12px 20px',
  background: disabled ? 'rgba(255,255,255,0.08)' : 'var(--gradient-brand)',
  color: disabled ? 'rgba(255,255,255,0.3)' : '#fff',
  fontSize: '0.95rem', fontWeight: 800, cursor: disabled ? 'default' : 'pointer',
  fontFamily: 'var(--font-body)',
  boxShadow: disabled ? 'none' : 'var(--shadow-glow)',
  transition: 'all 0.2s',
});
