/**
 * DebugTestPanel — renders the test checklist dynamically from testRegistry.
 * Replaces the hardcoded table in Dashboard.jsx.
 */
import testRegistry from '../debug/testRegistry.js';
import {
  TargetIcon, CoinsIcon, CharacterIcon, BookIcon, LockIcon,
  TrophyIcon, ChartMedalIcon, PaletteIcon, MotionIcon,
} from './icons/ProductIcons.jsx';
import CrownIcon from './CrownIcon.jsx';
import ShieldIcon from './ShieldIcon.jsx';

const CATEGORY_ICONS = {
  target: (s) => <TargetIcon size={s} />,
  coins: (s) => <CoinsIcon size={s} />,
  character: (s) => <CharacterIcon size={s} />,
  book: (s) => <BookIcon size={s} />,
  chart: (s) => <ChartMedalIcon size={s} />,
  lock: (s) => <LockIcon size={s} />,
  motion: (s) => <MotionIcon size={s} />,
  trophy: (s) => <TrophyIcon size={s} color="var(--color-gold)" />,
  crown: (s) => <CrownIcon size={s} animate={false} />,
  shield: (s) => <ShieldIcon size={s} />,
  palette: (s) => <PaletteIcon size={s} />,
};

// Group tests by category, preserving order
function groupByCategory(entries) {
  const groups = [];
  const seen = new Set();
  for (const entry of entries) {
    if (!seen.has(entry.category)) {
      seen.add(entry.category);
      groups.push({
        key: entry.category,
        label: entry.categoryLabel || entry.category,
        icon: entry.categoryIcon || 'target',
        tests: [],
      });
    }
    groups[groups.length - 1].tests.push(entry);
  }
  return groups;
}

export default function DebugTestPanel() {
  const groups = groupByCategory(testRegistry);
  const totalTests = testRegistry.length;
  const totalSuites = new Set(testRegistry.map(t => t.file)).size;

  return (
    <div style={{ marginTop: '1rem', paddingTop: '0.9rem', borderTop: '1px dashed rgba(74,222,128,0.18)' }}>
      <div style={{ fontSize: '0.65rem', color: '#4ade80', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.6rem' }}>
        Tests fonctionnels — {totalSuites} suites · {totalTests} tests
      </div>
      <div style={{ maxHeight: '55vh', overflowY: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.72rem', lineHeight: 1.6 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(74,222,128,0.25)', textAlign: 'left' }}>
              <th style={{ color: '#4ade80', padding: '5px 4px', width: '8%' }}>ID</th>
              <th style={{ color: '#4ade80', padding: '5px 8px', width: '40%' }}>Règle testée</th>
              <th style={{ color: '#4ade80', padding: '5px 8px', width: '52%' }}>Le test passe si…</th>
            </tr>
          </thead>
          <tbody>
            {groups.map((group, gi) => (
              <>
                <tr key={`h-${group.key}`} style={{ borderTop: gi > 0 ? '1px solid rgba(255,255,255,0.08)' : 'none' }}>
                  <td colSpan={3} style={{ color: '#4ade80', fontWeight: 700, padding: '10px 8px 5px', fontSize: '0.78rem' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                      {CATEGORY_ICONS[group.icon]?.(14)}
                      {group.label}
                    </span>
                  </td>
                </tr>
                {group.tests.map((test) => (
                  <tr key={test.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ color: '#6ee7b7', padding: '4px 4px', verticalAlign: 'top', fontFamily: 'monospace', fontWeight: 700, fontSize: '0.65rem' }}>{test.id}</td>
                    <td style={{ color: '#e2e2e2', padding: '4px 8px', verticalAlign: 'top' }}>{test.rule}</td>
                    <td style={{ color: '#9ca3af', padding: '4px 8px', verticalAlign: 'top' }}>{test.criteria}</td>
                  </tr>
                ))}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
