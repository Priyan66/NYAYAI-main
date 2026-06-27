'use client';

import { ActionItem, ScoreDimension } from '@/types';
import { useRouter } from 'next/navigation';
import { ArrowRight, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

interface ActionCardsProps {
  actionItems: ActionItem[];
  dimensions: ScoreDimension[];
}

export default function ActionCards({ actionItems, dimensions }: ActionCardsProps) {
  const router = useRouter();
  const labelByKey = Object.fromEntries(dimensions.map(d => [d.key, d.label]));

  return (
    <div>
      <p className="eyebrow" style={{ margin: '0 0 var(--space-4)' }}>Recommended Actions</p>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: 'var(--space-4)',
      }}>
        {actionItems.slice(0, 3).map((item, i) => (
          <motion.article key={`${item.dimension}-${i}`}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className="card"
            style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}
          >
            <span className="badge badge-accent" style={{ width: 'fit-content' }}>
              {labelByKey[item.dimension] ?? item.dimension}
            </span>

            <p style={{ margin: 0, color: 'var(--text-primary)', fontSize: 14, lineHeight: 1.6, flex: 1 }}>
              {item.action}
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <Zap size={13} color="var(--accent)" />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 18, color: 'var(--accent)', fontWeight: 500 }}>
                +{item.scoreDelta}
              </span>
              <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>pts</span>
              <span style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontSize: 11, fontFamily: 'var(--font-mono)' }}>
                ~{item.estimatedMinutes} min
              </span>
            </div>

            <button
              onClick={() => router.push(item.dimension === 'consumerRights' ? '/fight' : '/score/scan')}
              className="btn btn-primary btn-sm"
            >
              Take Action <ArrowRight size={11} />
            </button>
          </motion.article>
        ))}
      </div>
    </div>
  );
}
