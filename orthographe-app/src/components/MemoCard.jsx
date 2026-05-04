/**
 * MemoCard — renders a rule's memoCard as a semantic HTML table.
 * Used on SEO rule pages.
 *
 * Props:
 *   memoCard  – { title, rows: [{ form, test, example }] }
 */
export default function MemoCard({ memoCard }) {
  if (!memoCard?.rows?.length) return null;

  return (
    <div style={cardWrap}>
      {memoCard.title && (
        <p style={captionStyle}>{memoCard.title}</p>
      )}
      <div style={tableWrap}>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={{ ...thStyle, width: '18%' }}>Forme</th>
              <th style={{ ...thStyle, width: '36%' }}>Test de remplacement</th>
              <th style={{ ...thStyle, width: '46%' }}>Exemple</th>
            </tr>
          </thead>
          <tbody>
            {memoCard.rows.map((row, i) => (
              <tr key={i} style={i % 2 === 1 ? rowAltStyle : {}}>
                <td style={formCellStyle}>{row.form}</td>
                <td style={tdStyle}>{row.test}</td>
                <td style={{ ...tdStyle, color: 'rgba(255,255,255,0.5)', fontStyle: 'italic', fontSize: '0.82rem' }}>
                  {row.example}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const cardWrap = {
  background: 'rgba(124,58,237,0.08)',
  border: '1px solid rgba(124,58,237,0.22)',
  borderRadius: 20,
  overflow: 'hidden',
  marginBottom: '1.5rem',
  backdropFilter: 'blur(20px)',
};

const captionStyle = {
  fontSize: '0.78rem',
  fontWeight: 700,
  color: '#a78bfa',
  textTransform: 'uppercase',
  letterSpacing: '2px',
  margin: 0,
  padding: '0.7rem 1rem 0.5rem',
  borderBottom: '1px solid rgba(124,58,237,0.15)',
  fontFamily: 'Outfit, sans-serif',
};

const tableWrap = {
  overflowX: 'auto',
};

const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: '0.88rem',
  fontFamily: 'inherit',
};

const thStyle = {
  padding: '0.55rem 0.9rem',
  textAlign: 'left',
  fontSize: '0.72rem',
  fontWeight: 700,
  color: 'rgba(255,255,255,0.5)',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  background: 'rgba(255,255,255,0.06)',
  borderBottom: '1px solid rgba(255,255,255,0.1)',
};

const tdStyle = {
  padding: '0.6rem 0.9rem',
  color: 'rgba(255,255,255,0.85)',
  verticalAlign: 'top',
  lineHeight: 1.5,
  borderBottom: '1px solid rgba(255,255,255,0.06)',
};

const formCellStyle = {
  ...tdStyle,
  fontWeight: 800,
  color: '#c4b5fd',
  fontSize: '1rem',
  fontFamily: 'JetBrains Mono, monospace',
};

const rowAltStyle = {
  background: 'rgba(255,255,255,0.02)',
};
