'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import AnimatedCounter from '@/components/shared/AnimatedCounter';

interface ScoreGaugeProps {
  score: number;
  label: string;
  labelColor: 'red' | 'amber' | 'green';
  userName?: string;
  scannedAt?: string;
}

const ARC_COLOR: Record<string, string> = {
  red:   'var(--danger)',
  amber: 'var(--warning)',
  green: 'var(--success)',
};
const ARC_BG: Record<string, string> = {
  red:   'var(--danger-dim)',
  amber: 'var(--warning-dim)',
  green: 'var(--success-dim)',
};
const ARC_BORDER: Record<string, string> = {
  red:   'var(--danger-border)',
  amber: 'var(--warning-border)',
  green: 'var(--success-border)',
};

export default function ScoreGauge({ score, label, labelColor, userName, scannedAt }: ScoreGaugeProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const MAX = 500;
  const R   = 80;
  const C   = Math.PI * R;
  const offset = mounted ? C - (score / MAX) * C : C;
  const color  = ARC_COLOR[labelColor];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-3)' }}>
      {/* Arc */}
      <div style={{ position: 'relative', width: 200, height: 120 }}>
        <svg viewBox="0 0 200 120" width="200" height="120">
          {/* Track */}
          <path d="M 10 110 A 90 90 0 0 1 190 110" fill="none"
            stroke="var(--border)" strokeWidth="10" strokeLinecap="butt" />
          {/* Fill */}
          <motion.path d="M 10 110 A 90 90 0 0 1 190 110" fill="none"
            stroke={color} strokeWidth="10" strokeLinecap="butt"
            strokeDasharray={C}
            initial={{ strokeDashoffset: C }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.6, ease: 'easeOut', delay: 0.2 }}
          />
          {/* Tick marks */}
          {[0, 0.25, 0.5, 0.75, 1].map(t => {
            const a = Math.PI * (1 - t);
            return (
              <line key={t}
                x1={100 + 90 * Math.cos(a)} y1={110 - 90 * Math.sin(a)}
                x2={100 + 78 * Math.cos(a)} y2={110 - 78 * Math.sin(a)}
                stroke="var(--border-strong)" strokeWidth="1"
              />
            );
          })}
        </svg>
        {/* Score number */}
        <div style={{
          position: 'absolute', bottom: 12, left: '50%',
          transform: 'translateX(-50%)', textAlign: 'center',
        }}>
          {mounted ? (
            <AnimatedCounter target={score} duration={1600}
              style={{ fontFamily: 'var(--font-mono)', fontSize: 48, fontWeight: 500, color, lineHeight: 1 }}
            />
          ) : (
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 48, fontWeight: 500, color }}>0</span>
          )}
        </div>
      </div>

      {/* Label badge */}
      <span style={{
        padding: '4px 14px',
        background: ARC_BG[labelColor],
        border: `1px solid ${ARC_BORDER[labelColor]}`,
        borderRadius: 'var(--radius-sm)',
        fontFamily: 'var(--font-display)', fontWeight: 700,
        fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase',
        color,
      }}>
        {label}
      </span>

      {userName && (
        <p style={{ margin: 0, fontSize: 13, color: 'var(--text-secondary)', fontFamily: 'var(--font-body)' }}>
          {userName}
        </p>
      )}
      {scannedAt && (
        <p style={{ margin: 0, fontSize: 11, color: 'var(--text-ghost)', fontFamily: 'var(--font-mono)' }}>
          Scanned {new Date(scannedAt).toLocaleDateString('en-IN')}
        </p>
      )}
    </div>
  );
}
