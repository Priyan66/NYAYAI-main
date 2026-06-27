'use client';

import { motion } from 'framer-motion';
import { ScoreDimension } from '@/types';

interface DimensionBarsProps {
  dimensions: ScoreDimension[];
}

function barColor(score: number): string {
  if (score >= 80) return 'var(--success)';
  if (score >= 50) return 'var(--warning)';
  return 'var(--danger)';
}

export default function DimensionBars({ dimensions }: DimensionBarsProps) {
  return (
    <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
      {dimensions.map((dim, i) => {
        const color = barColor(dim.score);
        const pct   = `${Math.max(0, Math.min(100, dim.score))}%`;
        return (
          <div key={dim.key}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 'var(--space-2)' }}>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13, color: 'var(--text-primary)' }}>
                {dim.label}
              </span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color }}>
                {dim.score}/100
              </span>
            </div>

            {/* Bar track */}
            <div style={{
              width: '100%', height: 3,
              background: 'var(--border)',
              borderRadius: 2, overflow: 'hidden',
            }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: pct }}
                transition={{ duration: 0.7, delay: i * 0.08, ease: 'easeOut' }}
                style={{ height: '100%', background: color, borderRadius: 2 }}
              />
            </div>

            <p style={{ margin: 'var(--space-2) 0 0', color: 'var(--text-secondary)', fontSize: 12, lineHeight: 1.6 }}>
              {dim.urgentAction}
            </p>
          </div>
        );
      })}
    </div>
  );
}
