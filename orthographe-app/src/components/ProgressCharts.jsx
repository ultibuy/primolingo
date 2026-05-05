/**
 * ProgressCharts.jsx — Progress visualization for the parent dashboard.
 *
 * Renders three stacked area charts per child:
 *   1. Quizz terminés per day (grammar vs dictée)
 *   2. Grammar rule level distribution over time
 *   3. Dictée list level distribution over time
 *
 * Requires recharts. Uses statsHistory[] from progress (0 extra Firestore reads).
 */

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { getToday } from '../engine/sm2.js';
import { computeChartDeltas } from '../engine/stats.js';
import { CheckmarkIcon } from './icons/ProductIcons.jsx';

// ---------------------------------------------------------------------------
// Colours
// ---------------------------------------------------------------------------
const C_GRAMMAR  = '#a78bfa';
const C_DICTEE   = '#4ade80';
const C_DIAMOND  = '#60a5fa';
const C_CROWN    = '#fbbf24';
const C_SILVER   = '#c0c0c0';
const C_BRONZE   = '#cd7f32';
const C_UNSEEN   = '#4b5563';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function fmtDate(iso) {
  if (!iso) return '';
  const [, month, day] = iso.split('-');
  return `${day}/${month}`;
}

function sumThisWeek(data) {
  const now = getToday();
  const weekAgo = getToday(-7);
  return data
    .filter(d => d.date >= weekAgo && d.date <= now)
    .reduce((s, d) => s + (d.grammaire || 0) + (d.dictee || 0), 0);
}

// ---------------------------------------------------------------------------
// SVG checkmark
// ---------------------------------------------------------------------------
function Checkmark() {
  return <span style={{ marginLeft: 5, flexShrink: 0, display: 'inline-flex' }}><CheckmarkIcon size={11} /></span>;
}

// ---------------------------------------------------------------------------
// Level counts row (icon + number, no pills, no labels)
// ---------------------------------------------------------------------------
function LevelCounts({ counts }) {
  return (
    <div style={{ display: 'flex', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
      {counts.map(({ icon, val, color }) => (
        <span key={icon} style={{ fontSize: '0.75rem', fontWeight: 700, color, lineHeight: 1 }}>
          {icon} {val}
        </span>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Custom tooltip
// ---------------------------------------------------------------------------
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'rgba(30,30,50,0.95)',
      border: '1px solid rgba(255,255,255,0.12)',
      borderRadius: 8,
      padding: '8px 12px',
      fontSize: 12,
      color: '#e2e8f0',
    }}>
      <div style={{ fontWeight: 700, marginBottom: 4 }}>{label}</div>
      {payload.map(p => (
        <div key={p.dataKey} style={{ color: p.color }}>
          {p.name} : {p.value}
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Chart 1: Quizz terminés per day
// ---------------------------------------------------------------------------
function QuizzChart({ statsHistory }) {
  const chartData = computeChartDeltas(statsHistory).map(d => ({ ...d, label: fmtDate(d.date) }));

  const totalAll = statsHistory.length > 0
    ? (statsHistory[statsHistory.length - 1].gTotal || 0) + (statsHistory[statsHistory.length - 1].dTotal || 0)
    : 0;
  const thisWeek = sumThisWeek(chartData);

  if (statsHistory.length === 0) {
    return (
      <div style={cardStyle}>
        <div style={headerStyle}>QUIZZ · 30 DERNIERS JOURS</div>
        <div style={emptyStyle}>Pas encore de données</div>
      </div>
    );
  }

  return (
    <div style={cardStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
        <div style={headerStyle}>QUIZZ · 30 DERNIERS JOURS</div>
        <div style={headerSubStyle}>{totalAll}</div>
      </div>
      <div style={deltaStyle}>+{thisWeek} ces 7 derniers jours</div>
      <ResponsiveContainer width="100%" height={170}>
        <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="gradGrammar" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor={C_GRAMMAR} stopOpacity={0.6} />
              <stop offset="95%" stopColor={C_GRAMMAR} stopOpacity={0.05} />
            </linearGradient>
            <linearGradient id="gradDictee" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor={C_DICTEE} stopOpacity={0.6} />
              <stop offset="95%" stopColor={C_DICTEE} stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          <XAxis dataKey="label" tick={{ fill: '#94a3b8', fontSize: 10 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
          <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} tickLine={false} axisLine={false} allowDecimals={false} />
          <Tooltip content={<CustomTooltip />} />
          <Area type="monotone" dataKey="dictee"    name="Dictée"    stackId="1" stroke={C_DICTEE}  fill="url(#gradDictee)"  strokeWidth={1.5} />
          <Area type="monotone" dataKey="grammaire" name="Grammaire" stackId="1" stroke={C_GRAMMAR} fill="url(#gradGrammar)" strokeWidth={1.5} />
          <Legend wrapperStyle={{ fontSize: 11, paddingTop: 4 }} formatter={(value, entry) => <span style={{ color: entry.color }}>{value}</span>} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Chart 2: Grammar rule levels over time
// ---------------------------------------------------------------------------
function GrammarRulesChart({ statsHistory, totalGrammarRules }) {
  const chartData = statsHistory.map(entry => ({
    date: entry.date,
    label: fmtDate(entry.date),
    'À découvrir': entry.l0 || 0,
    'Bronze':      entry.l1 || 0,
    'Argent':      entry.l2 || 0,
    'Couronne':    entry.l3 || 0,
    'Diamant':     entry.l4 || 0,
  }));

  const last = statsHistory.length > 0 ? statsHistory[statsHistory.length - 1] : null;

  if (statsHistory.length === 0) {
    return (
      <div style={cardStyle}>
        <div style={{ ...headerStyle, display: 'flex', alignItems: 'center' }}>
          RÈGLES GRAMMAIRE <Checkmark />
        </div>
        <div style={emptyStyle}>Pas encore de données</div>
      </div>
    );
  }

  return (
    <div style={cardStyle}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
        <div style={{ ...headerStyle, display: 'flex', alignItems: 'center' }}>
          RÈGLES GRAMMAIRE <Checkmark />
        </div>
      </div>
      {last && (
        <LevelCounts counts={[
          { icon: '💎', val: last.l4 || 0, color: C_DIAMOND },
          { icon: '👑', val: last.l3 || 0, color: C_CROWN },
          { icon: '🥈', val: last.l2 || 0, color: C_SILVER },
          { icon: '🥉', val: last.l1 || 0, color: C_BRONZE },
          { icon: '🔒', val: last.l0 || 0, color: '#64748b' },
        ]} />
      )}
      <ResponsiveContainer width="100%" height={170}>
        <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="gradDiamond" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor={C_DIAMOND} stopOpacity={0.7} />
              <stop offset="95%" stopColor={C_DIAMOND} stopOpacity={0.1} />
            </linearGradient>
            <linearGradient id="gradCrown" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor={C_CROWN} stopOpacity={0.7} />
              <stop offset="95%" stopColor={C_CROWN} stopOpacity={0.1} />
            </linearGradient>
            <linearGradient id="gradSilver" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor={C_SILVER} stopOpacity={0.6} />
              <stop offset="95%" stopColor={C_SILVER} stopOpacity={0.1} />
            </linearGradient>
            <linearGradient id="gradBronze" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor={C_BRONZE} stopOpacity={0.6} />
              <stop offset="95%" stopColor={C_BRONZE} stopOpacity={0.1} />
            </linearGradient>
            <linearGradient id="gradUnseen" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor={C_UNSEEN} stopOpacity={0.5} />
              <stop offset="95%" stopColor={C_UNSEEN} stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          <XAxis dataKey="label" tick={{ fill: '#94a3b8', fontSize: 10 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
          <YAxis domain={[0, totalGrammarRules]} tick={{ fill: '#94a3b8', fontSize: 10 }} tickLine={false} axisLine={false} allowDecimals={false} />
          <Tooltip content={<CustomTooltip />} />
          <Area type="monotone" dataKey="Diamant"     stackId="1" stroke={C_DIAMOND} fill="url(#gradDiamond)" strokeWidth={1.5} />
          <Area type="monotone" dataKey="Couronne"    stackId="1" stroke={C_CROWN}   fill="url(#gradCrown)"   strokeWidth={1.5} />
          <Area type="monotone" dataKey="Argent"      stackId="1" stroke={C_SILVER}  fill="url(#gradSilver)"  strokeWidth={1.5} />
          <Area type="monotone" dataKey="Bronze"      stackId="1" stroke={C_BRONZE}  fill="url(#gradBronze)"  strokeWidth={1.5} />
          <Area type="monotone" dataKey="À découvrir" stackId="1" stroke={C_UNSEEN}  fill="url(#gradUnseen)"  strokeWidth={1.5} />
          <Legend wrapperStyle={{ fontSize: 11, paddingTop: 4 }} formatter={(value, entry) => <span style={{ color: entry.color }}>{value}</span>} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Chart 3: Dictée list levels over time
// ---------------------------------------------------------------------------
function OrthoChart({ statsHistory, totalDicteeRules }) {
  const chartData = statsHistory.map(entry => ({
    date: entry.date,
    label: fmtDate(entry.date),
    'À découvrir': entry.ol0 || 0,
    'Bronze':      entry.ol1 || 0,
    'Argent':      entry.ol2 || 0,
    'Maîtrisée':   entry.ol3 || 0,
  }));

  const last = statsHistory.length > 0 ? statsHistory[statsHistory.length - 1] : null;
  const hasOrthoData = last && (last.ol0 || last.ol1 || last.ol2 || last.ol3);

  if (statsHistory.length === 0 || !hasOrthoData) {
    return (
      <div style={cardStyle}>
        <div style={{ ...headerStyle, display: 'flex', alignItems: 'center' }}>
          LISTES ORTHOGRAPHES <Checkmark />
        </div>
        <div style={emptyStyle}>Pas encore de données</div>
      </div>
    );
  }

  return (
    <div style={cardStyle}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
        <div style={{ ...headerStyle, display: 'flex', alignItems: 'center' }}>
          LISTES ORTHOGRAPHES <Checkmark />
        </div>
      </div>
      {last && (
        <LevelCounts counts={[
          { icon: '👑', val: last.ol3 || 0, color: C_CROWN },
          { icon: '🥈', val: last.ol2 || 0, color: C_SILVER },
          { icon: '🥉', val: last.ol1 || 0, color: C_BRONZE },
          { icon: '🔒', val: last.ol0 || 0, color: '#64748b' },
        ]} />
      )}
      <ResponsiveContainer width="100%" height={170}>
        <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="gradOCrown" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor={C_CROWN}  stopOpacity={0.7} />
              <stop offset="95%" stopColor={C_CROWN}  stopOpacity={0.1} />
            </linearGradient>
            <linearGradient id="gradOSilver" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor={C_SILVER} stopOpacity={0.6} />
              <stop offset="95%" stopColor={C_SILVER} stopOpacity={0.1} />
            </linearGradient>
            <linearGradient id="gradOBronze" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor={C_BRONZE} stopOpacity={0.6} />
              <stop offset="95%" stopColor={C_BRONZE} stopOpacity={0.1} />
            </linearGradient>
            <linearGradient id="gradOUnseen" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor={C_UNSEEN} stopOpacity={0.5} />
              <stop offset="95%" stopColor={C_UNSEEN} stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          <XAxis dataKey="label" tick={{ fill: '#94a3b8', fontSize: 10 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
          <YAxis domain={[0, totalDicteeRules]} tick={{ fill: '#94a3b8', fontSize: 10 }} tickLine={false} axisLine={false} allowDecimals={false} />
          <Tooltip content={<CustomTooltip />} />
          <Area type="monotone" dataKey="Maîtrisée"   stackId="1" stroke={C_CROWN}  fill="url(#gradOCrown)"  strokeWidth={1.5} />
          <Area type="monotone" dataKey="Argent"       stackId="1" stroke={C_SILVER} fill="url(#gradOSilver)" strokeWidth={1.5} />
          <Area type="monotone" dataKey="Bronze"       stackId="1" stroke={C_BRONZE} fill="url(#gradOBronze)" strokeWidth={1.5} />
          <Area type="monotone" dataKey="À découvrir"  stackId="1" stroke={C_UNSEEN} fill="url(#gradOUnseen)" strokeWidth={1.5} />
          <Legend wrapperStyle={{ fontSize: 11, paddingTop: 4 }} formatter={(value, entry) => <span style={{ color: entry.color }}>{value}</span>} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Shared styles
// ---------------------------------------------------------------------------
const cardStyle = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 16,
  padding: '14px 16px 10px',
  marginBottom: 12,
};

const headerStyle = {
  fontSize: '0.7rem',
  fontWeight: 800,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: '#94a3b8',
};

const headerSubStyle = {
  fontSize: '0.8rem',
  fontWeight: 700,
  color: '#e2e8f0',
};

const deltaStyle = {
  fontSize: '0.72rem',
  color: '#4ade80',
  fontWeight: 700,
  marginBottom: 6,
};

const emptyStyle = {
  fontSize: '0.8rem',
  color: '#64748b',
  textAlign: 'center',
  padding: '20px 0',
};

// ---------------------------------------------------------------------------
// ProgressCharts (main export)
// ---------------------------------------------------------------------------
export default function ProgressCharts({ statsHistory, totalGrammarRules, totalDicteeRules }) {
  const history = Array.isArray(statsHistory) ? statsHistory : [];
  return (
    <div style={{ marginTop: 12 }}>
      <QuizzChart statsHistory={history} />
      <GrammarRulesChart statsHistory={history} totalGrammarRules={totalGrammarRules} />
      <OrthoChart statsHistory={history} totalDicteeRules={totalDicteeRules} />
    </div>
  );
}
