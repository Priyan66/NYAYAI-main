'use client';

import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import { Landmine } from '@/types';

interface LandmineAlertProps {
  landmines: Landmine[];
}

function formatType(type: Landmine['type']): string {
  return type.replace(/_/g, ' ').toUpperCase();
}

export default function LandmineAlert({ landmines }: LandmineAlertProps) {
  if (landmines.length === 0) return null;

  return (
    <div style={{ display: 'grid', gap: 'var(--space-2)' }}>
      {landmines.map((lm, i) => (
        <motion.article
          key={`${lm.type}-${i}`}
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.1 }}
          style={{
            border: '1px solid var(--danger-border)',
            background: 'var(--danger-dim)',
            borderRadius: 'var(--radius)',
            padding: 'var(--space-4)',
            display: 'grid',
            gridTemplateColumns: '16px 1fr',
            gap: 'var(--space-3)',
          }}
        >
          <AlertTriangle size={15} color="var(--danger)" style={{ marginTop: 2 }} />
          <div>
            <p className="label" style={{ color: 'var(--danger)', margin: '0 0 6px' }}>
              {formatType(lm.type)}
            </p>
            <p style={{ margin: 0, color: 'var(--text-primary)', fontSize: 13, lineHeight: 1.6 }}>
              {lm.description}
            </p>
            <p style={{ margin: '6px 0 0', color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.6 }}>
              {lm.remedy}
            </p>
          </div>
        </motion.article>
      ))}
    </div>
  );
}
