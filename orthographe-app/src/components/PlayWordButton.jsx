import { useEffect, useRef, useState } from 'react';

const MAX_PLAY_MS = 12000; // safety: stop animation after 12s no matter what

/**
 * PlayWordButton — circular audio bubble (design: InlineAudioBubbleMockup).
 *
 * Props:
 *  word      — French word to speak via TTS fallback
 *  audioUrl  — optional MP3 URL; TTS used if absent or on error
 *  autoPlay  — play on mount
 *  inline    — true → display: inline-flex (inside a sentence)
 *              false → centered block wrapper
 */
export default function PlayWordButton({
  word,
  audioUrl,
  autoPlay = false,
  inline = false,
}) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const safetyRef = useRef(null);

  // ── Stable helpers via refs so DOM event callbacks never go stale ───────
  const stopRef = useRef(null);
  stopRef.current = () => {
    setIsPlaying(false);
    if (safetyRef.current) { clearTimeout(safetyRef.current); safetyRef.current = null; }
    window.speechSynthesis?.cancel();
  };

  const startRef = useRef(null);
  startRef.current = () => {
    stopRef.current(); // cancel any previous playback
    setIsPlaying(true);
    safetyRef.current = setTimeout(() => stopRef.current(), MAX_PLAY_MS);
  };

  const trySpeak = () => {
    if (!window.speechSynthesis) {
      startRef.current(); // animate only; safety timeout will stop it
      return;
    }
    startRef.current();
    const u = new SpeechSynthesisUtterance(word);
    u.lang = 'fr-FR';
    u.rate = 0.85;
    u.onend = () => stopRef.current();
    u.onerror = () => stopRef.current();
    window.speechSynthesis.speak(u);
  };

  const play = () => {
    const audio = audioRef.current;
    if (audio && audioUrl) {
      audio.currentTime = 0;
      startRef.current();
      audio.play().catch(() => trySpeak());
    } else {
      trySpeak();
    }
  };

  // Auto-play on mount if requested
  useEffect(() => {
    if (autoPlay) {
      const t = setTimeout(play, 250);
      return () => clearTimeout(t);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioUrl]);

  // Cleanup on unmount
  useEffect(() => {
    return () => stopRef.current();
  }, []);

  const bubble = (
    <span style={bubbleWrapStyle}>
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          preload="auto"
          onEnded={() => stopRef.current()}
          onError={() => trySpeak()}
        />
      )}
      {/* Pulsing ring — always visible; speeds up when playing */}
      <span
        aria-hidden="true"
        style={{
          ...pulseStyle,
          animationDuration: isPlaying ? '0.9s' : '2s',
        }}
      />
      <button
        type="button"
        onClick={play}
        aria-label="Écouter"
        style={{
          ...circleStyle,
          background: isPlaying
            ? 'var(--color-primary, #a78bfa)'
            : 'var(--color-accent, #c4b5fd)',
        }}
      >
        <SpeakerIcon />
      </button>
    </span>
  );

  if (inline) return bubble;

  return <span style={blockWrapperStyle}>{bubble}</span>;
}

function SpeakerIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#1e1e2e"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
    </svg>
  );
}

/* ─── Styles ─── */

// The bubble itself (circle + pulse ring) — always positioned relative
const bubbleWrapStyle = {
  position: 'relative',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 38,
  height: 38,
  verticalAlign: 'middle',
  flexShrink: 0,
  margin: '0 0.45rem',
};

// Standalone (not inside a sentence): centered with some breathing room
const blockWrapperStyle = {
  display: 'flex',
  justifyContent: 'center',
  margin: '0.4rem 0 1.2rem',
};

const pulseStyle = {
  position: 'absolute',
  inset: -2,
  borderRadius: '50%',
  border: '2px solid',
  opacity: 0.65,
  animation: 'inline-audio-pulse 2s ease-out infinite',
  pointerEvents: 'none',
};

const circleStyle = {
  position: 'relative',
  width: 38,
  height: 38,
  borderRadius: '50%',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  border: '3px solid rgba(196,181,253,0.32)',
  padding: 0,
  flexShrink: 0,
  zIndex: 1,
  transition: 'background 0.2s ease',
};
