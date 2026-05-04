import { useState, useRef, useEffect, useCallback } from 'react';

const PIN_LENGTH = 4;

export default function PinInput({ onComplete, error, locked, lockedUntil, masked = true, autoFocus = true }) {
  const [digits, setDigits] = useState(Array(PIN_LENGTH).fill(''));
  const [shake, setShake] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const inputRefs = useRef([]);

  // Auto-focus first input — longer delay for iOS portal rendering
  useEffect(() => {
    if (autoFocus && !locked) {
      setTimeout(() => {
        const el = inputRefs.current[0];
        if (el) { el.focus(); el.click(); }
      }, 300);
    }
  }, [autoFocus, locked]);

  // Shake on error
  useEffect(() => {
    if (error) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShake(true);
      setDigits(Array(PIN_LENGTH).fill(''));
      const t = setTimeout(() => {
        setShake(false);
        inputRefs.current[0]?.focus();
      }, 500);
      return () => clearTimeout(t);
    }
  }, [error]);

  // Lockout countdown
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!lockedUntil) { setCountdown(0); return; }
    const tick = () => {
      const remaining = Math.max(0, Math.ceil((lockedUntil - Date.now()) / 1000));
      setCountdown(remaining);
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [lockedUntil]);

  const handleChange = useCallback((index, value) => {
    const digit = value.replace(/[^0-9]/g, '').slice(-1);
    setDigits(prev => {
      const next = [...prev];
      next[index] = digit;
      // Auto-submit when all digits filled
      if (digit && index === PIN_LENGTH - 1 && next.every(d => d !== '')) {
        setTimeout(() => onComplete?.(next.join('')), 50);
      }
      return next;
    });
    if (digit && index < PIN_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }, [onComplete]);

  const handleKeyDown = useCallback((index, e) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      setDigits(prev => {
        const next = [...prev];
        next[index - 1] = '';
        return next;
      });
    }
  }, [digits]);

  const handlePaste = useCallback((e) => {
    e.preventDefault();
    const pasted = (e.clipboardData.getData('text') || '').replace(/[^0-9]/g, '').slice(0, PIN_LENGTH);
    if (!pasted) return;
    const next = Array(PIN_LENGTH).fill('');
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
    setDigits(next);
    if (pasted.length === PIN_LENGTH) {
      setTimeout(() => onComplete?.(next.join('')), 50);
    } else {
      inputRefs.current[pasted.length]?.focus();
    }
  }, [onComplete]);

  const isLocked = locked || countdown > 0;

  return (
    <div style={{ textAlign: 'center' }}>
      <div
        style={{
          display: 'flex', gap: 10, justifyContent: 'center',
          animation: shake ? 'pin-shake 0.4s ease' : 'none',
        }}
      >
        {digits.map((d, i) => (
          <input
            key={i}
            ref={el => inputRefs.current[i] = el}
            type="tel"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            value={masked && d ? '•' : d}
            disabled={isLocked}
            onChange={e => handleChange(i, e.target.value)}
            onKeyDown={e => handleKeyDown(i, e)}
            onPaste={i === 0 ? handlePaste : undefined}
            autoFocus={autoFocus && i === 0}
            onFocus={e => e.target.select()}
            style={{
              width: 52, height: 60,
              fontSize: masked ? '1.6rem' : '1.4rem',
              fontWeight: 800,
              textAlign: 'center',
              border: `2px solid ${error ? 'var(--color-red)' : d ? 'rgba(var(--color-primary-rgb),0.6)' : 'var(--glass-border)'}`,
              borderRadius: 'var(--radius-sm)',
              background: isLocked ? 'rgba(255,255,255,0.03)' : 'var(--glass-bg)',
              color: isLocked ? 'var(--text-subtle)' : 'var(--text-white)',
              outline: 'none',
              caretColor: 'transparent',
              transition: 'border-color var(--motion-base), box-shadow var(--motion-base)',
              fontFamily: 'var(--font-body)',
              boxShadow: d && !error ? '0 0 0 4px rgba(var(--color-primary-rgb),0.15)' : 'none',
            }}
          />
        ))}
      </div>

      {error && !isLocked && (
        <p style={{ color: 'var(--color-red)', fontSize: '0.82rem', marginTop: '0.6rem', fontWeight: 600 }}>
          {error}
        </p>
      )}

      {isLocked && countdown > 0 && (
        <p style={{ color: 'var(--color-gold)', fontSize: '0.82rem', marginTop: '0.6rem', fontWeight: 600 }}>
          Trop de tentatives — réessaie dans {countdown}s
        </p>
      )}

      <style>{`
        @keyframes pin-shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-5px); }
          80% { transform: translateX(5px); }
        }
        @keyframes pin-pulse {
          0%, 100% { border-color: rgba(var(--color-primary-rgb),0.3); }
          50% { border-color: rgba(var(--color-primary-rgb),0.7); }
        }
        input[inputmode="numeric"]:focus {
          border-color: var(--color-primary) !important;
          box-shadow: 0 0 0 4px rgba(var(--color-primary-rgb),0.2) !important;
          animation: pin-pulse 1.2s ease infinite;
        }
      `}</style>
    </div>
  );
}
