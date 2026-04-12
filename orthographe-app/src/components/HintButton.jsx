/**
 * HintButton — B1 consumable: reveal the decision panel in direct mode.
 *
 * Usage in QuizDirect.jsx:
 *   import HintButton from './HintButton.jsx';
 *   // In the question header:
 *   <HintButton
 *     count={inventory.revealHint}
 *     onUse={() => onUseItem('revealHint')}
 *     disabled={showResult}
 *   />
 *
 * When clicked and count > 0, it calls onUse() and sets local `used` state
 * to true. The parent component should then render the DecisionPanel.
 *
 * Props:
 *   count    — number of reveal-hint items in inventory
 *   onUse    — callback to decrement inventory (called once on first click)
 *   disabled — whether the button should be non-interactive (e.g. after answering)
 *   active   — controlled: if true, hint is shown (parent manages state)
 *   onToggle — alternative to onUse: parent-controlled toggle callback
 */
import { useState } from 'react';

export default function HintButton({ count = 0, onUse, disabled = false, active, onToggle }) {
  const [used, setUsed] = useState(false);

  // Support both controlled (active/onToggle) and uncontrolled (used/onUse) modes
  const isActive = active !== undefined ? active : used;

  const handleClick = () => {
    if (disabled) return;

    if (isActive) {
      // Already showing — if controlled, toggle off
      if (onToggle) onToggle(false);
      return;
    }

    if (count <= 0 && !used) return; // No hints available

    if (!used) {
      // First activation: consume the item
      setUsed(true);
      if (onUse) onUse();
      if (onToggle) onToggle(true);
    }
  };

  const canUse = count > 0 || used;
  const opacity = disabled ? 0.3 : canUse ? 1 : 0.4;

  return (
    <button
      onClick={handleClick}
      disabled={disabled || (!canUse && !isActive)}
      title={
        isActive
          ? 'Indice actif'
          : canUse
            ? `Utiliser un indice (${used ? 'actif' : count + ' restant' + (count > 1 ? 's' : '')})`
            : 'Aucun indice disponible'
      }
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.3rem',
        padding: '0.35rem 0.6rem',
        borderRadius: 8,
        border: isActive
          ? '2px solid #fbbf24'
          : '1px solid rgba(255,255,255,0.15)',
        background: isActive
          ? 'rgba(251,191,36,0.2)'
          : 'rgba(255,255,255,0.06)',
        color: isActive ? '#fde68a' : canUse ? 'var(--color-accent)' : '#6b7280',
        cursor: disabled || (!canUse && !isActive) ? 'default' : 'pointer',
        fontSize: '0.82rem',
        fontWeight: 600,
        opacity,
        transition: 'all 0.25s ease',
      }}
    >
      <span style={{ fontSize: '1rem' }}>
        {'\u{1F4A1}'}
      </span>
      {!isActive && !used && count > 0 && (
        <span style={{ fontSize: '0.7rem' }}>
          {count}
        </span>
      )}
      {isActive && (
        <span style={{ fontSize: '0.7rem' }}>
          Indice
        </span>
      )}
    </button>
  );
}
