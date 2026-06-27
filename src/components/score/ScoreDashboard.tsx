import Link from 'next/link';
import { RefreshCw } from 'lucide-react';
import { NyayScoreResult } from '@/types';
import ScoreGauge from './ScoreGauge';
import DimensionBars from './DimensionBars';
import ActionCards from './ActionCards';

interface ScoreDashboardProps {
  score: NyayScoreResult;
  userName?: string;
}

export default function ScoreDashboard({ score, userName }: ScoreDashboardProps) {
  return (
    <div style={{ display: 'grid', gap: 'var(--space-5)' }}>
      {/* Top bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
        <div>
          <p className="eyebrow" style={{ margin: '0 0 var(--space-1)' }}>Legal Health Score</p>
          <h1 style={{ margin: 0, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, color: 'var(--text-primary)' }}>
            Your Legal Position
          </h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: 11, fontFamily: 'var(--font-mono)' }}>
            Last scanned {new Date(score.scannedAt).toLocaleDateString('en-IN')}
          </span>
          <Link href="/score/scan" className="btn btn-ghost btn-sm" style={{ textDecoration: 'none' }}>
            <RefreshCw size={11} /> Re-scan
          </Link>
        </div>
      </div>

      {/* Gauge + Dimensions */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: 'var(--space-4)',
        alignItems: 'start',
      }}>
        <div className="card" style={{ display: 'flex', justifyContent: 'center' }}>
          <ScoreGauge
            score={score.totalScore}
            label={score.label}
            labelColor={score.labelColor}
            userName={userName}
            scannedAt={score.scannedAt}
          />
        </div>
        <div className="card">
          <p className="eyebrow" style={{ margin: '0 0 var(--space-4)' }}>Breakdown</p>
          <DimensionBars dimensions={score.dimensions} />
        </div>
      </div>

      {/* Action cards */}
      <ActionCards actionItems={score.actionItems} dimensions={score.dimensions} />
    </div>
  );
}
