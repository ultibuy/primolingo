/**
 * OtpVerification — composant de saisie du code OTP parental.
 *
 * Props:
 *   uid          {string}   UID Firebase du parent
 *   email        {string}   Email du parent (pour affichage)
 *   onSuccess    {function} Appelé quand le code est vérifié
 *   onCancel     {function} Appelé quand l'utilisateur annule
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { sendOtp, verifyOtp } from '../services/otp.js';

const OTP_EXPIRY_MS = 10 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;

export default function OtpVerification({ uid, email, onSuccess, onCancel }) {
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [status, setStatus] = useState('idle'); // 'idle' | 'sending' | 'sent' | 'verifying' | 'error'
  const [errorMsg, setErrorMsg] = useState('');
  const [expiresAt, setExpiresAt] = useState(null);
  const [sentAt, setSentAt] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef([]);
  const timerRef = useRef(null);

  // Countdown timer
  useEffect(() => {
    if (!expiresAt) return;
    timerRef.current = setInterval(() => {
      const remaining = Math.max(0, Math.round((expiresAt - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining <= 0) clearInterval(timerRef.current);
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [expiresAt]);

  // Resend cooldown
  useEffect(() => {
    if (!sentAt) return;
    const interval = setInterval(() => {
      const elapsed = Date.now() - sentAt;
      const remaining = Math.max(0, Math.round((RESEND_COOLDOWN_MS - elapsed) / 1000));
      setResendCooldown(remaining);
      if (remaining <= 0) clearInterval(interval);
    }, 1000);
    return () => clearInterval(interval);
  }, [sentAt]);

  const handleSend = useCallback(async () => {
    setStatus('sending');
    setErrorMsg('');
    try {
      const { expiresAt: exp } = await sendOtp(uid, email);
      setExpiresAt(new Date(exp).getTime());
      setSentAt(Date.now());
      setStatus('sent');
      setDigits(['', '', '', '', '', '']);
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } catch (err) {
      console.error('sendOtp error:', err);
      setErrorMsg("L'envoi du code a échoué. Réessaie.");
      setStatus('idle');
    }
  }, [uid, email]);

  // Auto-send on mount
  useEffect(() => {
    handleSend();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function handleDigitChange(index, value) {
    const digit = value.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[index] = digit;
    setDigits(next);
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index, e) {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e) {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setDigits(pasted.split(''));
      setTimeout(() => handleVerify(pasted), 50);
    }
  }

  const handleVerify = useCallback(async (codeOverride) => {
    const code = codeOverride || digits.join('');
    if (code.length !== 6) return;

    setStatus('verifying');
    setErrorMsg('');
    try {
      const result = await verifyOtp(uid, code);
      if (result.valid) {
        onSuccess();
      } else if (result.reason === 'expired') {
        setErrorMsg('Ce code a expiré. Envoie-en un nouveau.');
        setStatus('sent');
      } else {
        setErrorMsg('Code incorrect. Réessaie.');
        setStatus('sent');
        setDigits(['', '', '', '', '', '']);
        setTimeout(() => inputRefs.current[0]?.focus(), 50);
      }
    } catch (err) {
      console.error('verifyOtp error:', err);
      setErrorMsg('Une erreur est survenue. Réessaie.');
      setStatus('sent');
    }
  }, [digits, uid, onSuccess]);

  // Auto-verify when all 6 digits are entered
  useEffect(() => {
    if (digits.every(d => d !== '') && status === 'sent') {
      handleVerify();
    }
  }, [digits, status, handleVerify]);

  function formatTime(seconds) {
    if (seconds === null) return '';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        {/* Header */}
        <div style={headerStyle}>
          <div style={keyIconStyle}>🔑</div>
          <h3 style={titleStyle}>Code d'accès parent</h3>
          <p style={subStyle}>
            {status === 'idle' && "Prépare l'envoi du code…"}
            {status === 'sending' && 'Envoi du code en cours…'}
            {(status === 'sent' || status === 'verifying') && (
              <>Un code à 6 chiffres a été envoyé à <strong style={{ color: '#a78bfa' }}>{email}</strong></>
            )}
          </p>
        </div>

        {/* OTP input */}
        {(status === 'sent' || status === 'verifying') && (
          <div style={otpRowStyle} onPaste={handlePaste}>
            {digits.map((d, i) => (
              <input
                key={i}
                ref={el => { inputRefs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={d}
                onChange={e => handleDigitChange(i, e.target.value)}
                onKeyDown={e => handleKeyDown(i, e)}
                disabled={status === 'verifying'}
                style={{
                  ...digitInputStyle,
                  borderColor: d ? '#a78bfa' : 'rgba(167,139,250,0.25)',
                  opacity: status === 'verifying' ? 0.7 : 1,
                }}
              />
            ))}
          </div>
        )}

        {/* Loading spinner during verify */}
        {status === 'verifying' && (
          <div style={{ textAlign: 'center', color: '#a78bfa', fontSize: '0.85rem' }}>
            Vérification…
          </div>
        )}

        {/* Error */}
        {errorMsg && (
          <div style={errorStyle}>{errorMsg}</div>
        )}

        {/* Timer */}
        {timeLeft !== null && timeLeft > 0 && (
          <div style={timerStyle}>
            Code valide encore {formatTime(timeLeft)}
          </div>
        )}
        {timeLeft === 0 && (
          <div style={{ ...timerStyle, color: '#f87171' }}>
            Code expiré
          </div>
        )}

        {/* Resend button */}
        {(status === 'sent' || status === 'verifying' || timeLeft === 0) && (
          <button
            type="button"
            disabled={resendCooldown > 0 || status === 'sending' || status === 'verifying'}
            onClick={handleSend}
            style={{
              ...resendBtnStyle,
              opacity: (resendCooldown > 0 || status === 'sending' || status === 'verifying') ? 0.5 : 1,
              cursor: (resendCooldown > 0 || status === 'sending') ? 'not-allowed' : 'pointer',
            }}
          >
            {resendCooldown > 0 ? `Renvoyer dans ${resendCooldown}s` : 'Renvoyer un code'}
          </button>
        )}

        {/* Cancel */}
        {onCancel && (
          <button type="button" onClick={onCancel} style={cancelBtnStyle}>
            Annuler
          </button>
        )}
      </div>
    </div>
  );
}

const containerStyle = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.7)',
  backdropFilter: 'blur(8px)',
  WebkitBackdropFilter: 'blur(8px)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 2000,
  padding: '1rem',
};

const cardStyle = {
  width: 'min(400px, 100%)',
  background: 'linear-gradient(180deg, rgba(30,30,46,0.98), rgba(45,43,85,0.96))',
  border: '1px solid rgba(167,139,250,0.25)',
  borderRadius: 24,
  padding: '2rem 1.75rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
  boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
  fontFamily: 'Plus Jakarta Sans, sans-serif',
};

const headerStyle = {
  textAlign: 'center',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.4rem',
};

const keyIconStyle = {
  fontSize: 40,
};

const titleStyle = {
  margin: 0,
  fontSize: '1.2rem',
  fontWeight: 900,
  color: '#fff',
  fontFamily: 'Outfit, sans-serif',
};

const subStyle = {
  margin: 0,
  fontSize: '0.85rem',
  color: '#94a3b8',
  lineHeight: 1.5,
};

const otpRowStyle = {
  display: 'flex',
  gap: '0.5rem',
  justifyContent: 'center',
};

const digitInputStyle = {
  width: 46,
  height: 56,
  borderRadius: 12,
  border: '2px solid rgba(167,139,250,0.25)',
  background: 'rgba(167,139,250,0.08)',
  color: '#fff',
  fontSize: '1.5rem',
  fontWeight: 900,
  textAlign: 'center',
  outline: 'none',
  fontFamily: 'Outfit, sans-serif',
  transition: 'border-color 0.15s',
};

const errorStyle = {
  padding: '0.65rem 1rem',
  borderRadius: 10,
  background: 'rgba(127,29,29,0.7)',
  border: '1px solid rgba(248,113,113,0.3)',
  color: '#fee2e2',
  fontSize: '0.82rem',
  textAlign: 'center',
};

const timerStyle = {
  textAlign: 'center',
  fontSize: '0.8rem',
  color: '#64748b',
};

const resendBtnStyle = {
  background: 'none',
  border: '1px solid rgba(167,139,250,0.25)',
  borderRadius: 10,
  padding: '0.6rem',
  color: '#a78bfa',
  fontSize: '0.82rem',
  fontFamily: 'Plus Jakarta Sans, sans-serif',
  cursor: 'pointer',
  textAlign: 'center',
};

const cancelBtnStyle = {
  background: 'none',
  border: 'none',
  color: '#64748b',
  fontSize: '0.8rem',
  cursor: 'pointer',
  textAlign: 'center',
  fontFamily: 'Plus Jakarta Sans, sans-serif',
  padding: '0.25rem',
};
