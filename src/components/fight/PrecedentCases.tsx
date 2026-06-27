import { PrecedentCase } from '@/types';

interface PrecedentCasesProps {
  cases: PrecedentCase[];
}

const OUTCOME: Record<PrecedentCase['outcome'], { text: string; color: string; border: string }> = {
  plaintiff_won: { text: 'Plaintiff Won', color: 'var(--success)', border: 'var(--success-border)' },
  defendant_won: { text: 'Defendant Won', color: 'var(--danger)',  border: 'var(--danger-border)' },
  settled:       { text: 'Settled',       color: 'var(--warning)', border: 'var(--warning-border)' },
  unknown:       { text: 'Unknown',       color: 'var(--text-secondary)', border: 'var(--border-strong)' },
};

function formatRelevance(score: number | undefined): string | null {
  if (typeof score !== 'number' || Number.isNaN(score)) return null;
  const pct = Math.max(0, Math.min(100, Math.round(score <= 1 ? score * 100 : score)));
  return `${pct}% match`;
}

export default function PrecedentCases({ cases }: PrecedentCasesProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
      <p className="eyebrow" style={{ margin: 0, opacity: 0.5 }}>Retrieved via Semantic Search</p>

      {cases.slice(0, 5).map((c) => (
        <article key={`${c.caseName}-${c.citation}`} className="card-surface">
          <h4 style={{ margin: 0, fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>
            {c.caseName}
          </h4>
          <p style={{ margin: '5px 0 0', color: 'var(--accent)', fontFamily: 'var(--font-mono)', fontSize: 11 }}>
            {c.citation}
          </p>
          <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)', fontSize: 12 }}>
            {c.court} · {c.year}
          </p>

          <div style={{ marginTop: 'var(--space-3)', display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', alignItems: 'center' }}>
            <span className="badge" style={{
              background: 'transparent',
              border: `1px solid ${OUTCOME[c.outcome].border}`,
              color: OUTCOME[c.outcome].color,
            }}>
              {OUTCOME[c.outcome].text}
            </span>
            {formatRelevance(c.relevanceScore) && (
              <span className="badge badge-accent">{formatRelevance(c.relevanceScore)}</span>
            )}
          </div>

          <p style={{ margin: 'var(--space-3) 0 0', color: 'var(--text-secondary)', fontStyle: 'italic', fontSize: 13, lineHeight: 1.6 }}>
            {c.keyHolding}
          </p>

          {c.facts && (
            <details style={{ marginTop: 'var(--space-3)' }}>
              <summary style={{
                cursor: 'pointer', color: 'var(--accent)',
                fontFamily: 'var(--font-display)', fontSize: 11,
                letterSpacing: '0.08em', textTransform: 'uppercase',
              }}>
                Case Facts
              </summary>
              <p style={{ margin: '8px 0 0', color: 'var(--text-secondary)', fontSize: 12, lineHeight: 1.6 }}>
                {c.facts}
              </p>
            </details>
          )}
        </article>
      ))}
    </div>
  );
}
