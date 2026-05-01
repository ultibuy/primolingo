export default function SegmentedTabs({ tabs, activeKey, onChange, style }) {
  return (
    <div
      role="tablist"
      style={{
        display: 'flex',
        background: 'rgba(0,0,0,0.32)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 13,
        padding: 3,
        gap: 2,
        width: '100%',
        minWidth: 0,
        boxSizing: 'border-box',
        ...style,
      }}
    >
      {tabs.map(tab => {
        const active = activeKey === tab.key;
        return (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange?.(tab.key)}
            style={{
              flex: 1,
              minWidth: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              padding: '10px 6px',
              borderRadius: 10,
              border: 'none',
              cursor: 'pointer',
              background: active ? 'rgba(255,255,255,0.08)' : 'transparent',
              color: active ? '#fff' : 'rgba(255,255,255,0.55)',
              fontFamily: 'inherit',
              fontSize: '0.78rem',
              fontWeight: 800,
              transition: 'background 0.18s ease, color 0.18s ease',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {tab.icon && (
              <span style={{ width: 14, height: 14, display: 'inline-flex', flexShrink: 0 }}>
                {tab.icon}
              </span>
            )}
            <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
