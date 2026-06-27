interface EvidenceChecklistProps {
  content: string;
}

export default function EvidenceChecklist({ content }: EvidenceChecklistProps) {
  const lines = content.split('\n').filter(l => l.trim().length > 0);

  return (
    <div className="card">
      <h3 style={{
        margin: '0 0 var(--space-4)',
        fontFamily: 'var(--font-display)', fontWeight: 700,
        fontSize: 15, letterSpacing: '0.06em', textTransform: 'uppercase',
        color: 'var(--text-primary)',
      }}>
        Evidence Checklist
      </h3>

      <div style={{ display: 'grid', gap: 'var(--space-2)' }}>
        {lines.map((line, i) => {
          const have = line.startsWith('✓ HAVE') || line.startsWith('✓');
          const need = line.startsWith('✗ NEED') || line.startsWith('✗');

          if (have) return (
            <div key={i} style={{
              borderLeft: '2px solid var(--success)',
              background: 'var(--success-dim)',
              padding: '7px 10px', borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
              color: 'var(--text-primary)', fontSize: 13, lineHeight: 1.6,
            }}>
              {line}
            </div>
          );

          if (need) return (
            <div key={i} style={{
              borderLeft: '2px solid var(--danger)',
              background: 'var(--danger-dim)',
              padding: '7px 10px', borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
              color: 'var(--text-primary)', fontSize: 13, lineHeight: 1.6,
            }}>
              {line}
            </div>
          );

          return (
            <div key={i} style={{ color: 'var(--text-secondary)', fontSize: 13, paddingLeft: 10, lineHeight: 1.6 }}>
              {line}
            </div>
          );
        })}
      </div>
    </div>
  );
}
