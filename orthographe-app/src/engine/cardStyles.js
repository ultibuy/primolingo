/**
 * Shared style utilities for RuleCard and DicteeCard.
 * Pure functions — no React dependency.
 */

import { parseLocalDate, getToday } from './sm2.js';

/**
 * Compute dynamic card container style based on diamond review state
 * and recent trophy. Used by both grammar and dictée cards via BaseCard.
 */
export function computeCardStyle(isDue, recentTrophy) {
  const style = { transition: 'all 0.4s ease' };
  if (isDue) {
    style.background = 'linear-gradient(135deg, rgba(251,146,0,0.06) 0%, rgba(255,255,255,0.04) 100%)';
    style.border = '1.5px solid rgba(251,146,0,0.5)';
    style.animation = 'review-pulse 3s ease-in-out infinite';
  } else if (recentTrophy) {
    style.background = 'linear-gradient(135deg, rgba(251,191,36,0.08) 0%, rgba(255,255,255,0.06) 100%)';
    style.border = '1px solid rgba(251,191,36,0.35)';
    style.boxShadow = '0 0 30px rgba(251,191,36,0.1)';
    style.animation = 'card-glow 4s ease-in-out infinite';
  }
  return style;
}

/**
 * Compute action button style.
 * Gradient depends on level, due/disabled states.
 */
export function computeButtonStyle({ buttonDisabled, isDue, ruleLevel }) {
  let background;
  if (buttonDisabled) {
    background = 'rgba(255,255,255,0.06)';
  } else if (isDue) {
    background = 'linear-gradient(135deg, #ea580c, #fb923c)';
  } else if (ruleLevel <= 1) {
    background = 'linear-gradient(135deg, var(--color-primary), var(--color-accent))';
  } else if (ruleLevel <= 2) {
    background = 'linear-gradient(135deg, #059669, #34d399)';
  } else if (ruleLevel === 3) {
    background = 'linear-gradient(135deg, #d97706, #fbbf24)';
  } else {
    background = 'linear-gradient(135deg, #2563eb, #60a5fa)';
  }

  return {
    background,
    color: buttonDisabled ? '#6b7280' : '#fff',
    boxShadow: buttonDisabled
      ? 'none'
      : isDue
        ? '0 4px 15px rgba(234,88,12,0.3)'
        : '0 4px 15px rgba(0,0,0,0.2)',
  };
}

/**
 * Format a date string (YYYY-MM-DD) as a relative or short date in French.
 */
export function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = parseLocalDate(dateStr);
  const today = parseLocalDate(getToday());
  if (!d || !today) return '';
  const diff = Math.round((d - today) / (1000 * 60 * 60 * 24));
  if (diff === 0) return "aujourd'hui";
  if (diff === 1) return 'demain';
  if (diff < 7) return `dans ${diff} jours`;
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}
