interface CoachingSummaryProps {
  content: string;
}

const HEADING_HINTS = ['Your', 'Next', 'What', 'Timeline', 'Bring', 'Forum',
  'आपकी', 'अगले', 'फोरम', 'यथार्थवादी', 'पहले'];

function isHeading(line: string): boolean {
  return HEADING_HINTS.some(h => line.includes(h)) && line.length < 80;
}

export default function CoachingSummary({ content }: CoachingSummaryProps) {
  const lines = content.split('\n').filter(l => l.trim().length > 0);

  const sections: Array<{ heading: string; body: string[] }> = [];
  let current: { heading: string; body: string[] } | null = null;

  for (const line of lines) {
    if (isHeading(line)) {
      if (current) sections.push(current);
      current = { heading: line, body: [] };
    } else if (current) {
      current.body.push(line);
    } else {
      current = { heading: 'Summary', body: [line] };
    }
  }
  if (current) sections.push(current);

  return (
    <div className="card">
      <h3 style={{
        margin: '0 0 var(--space-4)',
        fontFamily: 'var(--font-display)', fontWeight: 700,
        fontSize: 15, letterSpacing: '0.06em', textTransform: 'uppercase',
        color: 'var(--text-primary)',
      }}>
        Coaching Summary
      </h3>

      <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
        {sections.map((sec, i) => (
          <section key={`${sec.heading}-${i}`}>
            <p className="eyebrow" style={{ margin: '0 0 var(--space-2)' }}>{sec.heading}</p>
            <p style={{
              margin: 0, color: 'var(--text-primary)',
              fontSize: 13, lineHeight: 1.8, whiteSpace: 'pre-wrap',
            }}>
              {sec.body.join('\n')}
            </p>
          </section>
        ))}
      </div>
    </div>
  );
}
