'use client';

import { motion } from 'framer-motion';
import { Shield, AlertTriangle, TrendingUp, ChevronRight } from 'lucide-react';
import { CaseAssessment, CaseStrength } from '@/types';

interface CaseAssessmentCardProps {
  assessment: CaseAssessment;
}

const STRENGTH: Record<CaseStrength, {
  color: string;
  bg: string;
  border: string;
  glow: string;
  icon: typeof Shield;
}> = {
  strong:     { color: 'var(--success)', bg: 'var(--success-dim)', border: 'var(--success-border)', glow: 'rgba(45,212,191,0.10)', icon: Shield },
  moderate:   { color: 'var(--warning)', bg: 'var(--warning-dim)', border: 'var(--warning-border)', glow: 'rgba(245,158,11,0.10)', icon: TrendingUp },
  challenging:{ color: 'var(--danger)',  bg: 'var(--danger-dim)',  border: 'var(--danger-border)',  glow: 'rgba(239,68,68,0.10)',  icon: AlertTriangle },
};

const LIMITATION_COLOR: Record<string, string> = {
  expired:    'var(--danger)',
  near_expiry:'var(--warning)',
  within:     'var(--success)',
};
const LIMITATION_BG: Record<string, string> = {
  expired:    'var(--danger-dim)',
  near_expiry:'var(--warning-dim)',
  within:     'var(--success-dim)',
};
const LIMITATION_BORDER: Record<string, string> = {
  expired:    'var(--danger-border)',
  near_expiry:'var(--warning-border)',
  within:     'var(--success-border)',
};

export default function CaseAssessmentCard({ assessment }: CaseAssessmentCardProps) {
  const cfg = STRENGTH[assessment.strength];
  const Icon = cfg.icon;
  const limStatus = assessment.limitationStatus ?? 'within';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{
        background: cfg.bg,
        border: `1px solid ${cfg.border}`,
        borderRadius: 'var(--radius)',
        padding: 'var(--space-5)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Ambient glow */}
      <div style={{
        position: 'absolute', top: -40, right: -40,
        width: 120, height: 120, borderRadius: '50%',
        background: cfg.glow, filter: 'blur(40px)', pointerEvents: 'none',
      }} />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-4)', position: 'relative' }}>
        <div style={{
          width: 36, height: 36, borderRadius: 8,
          background: cfg.glow, border: `1px solid ${cfg.border}`,
          display: 'grid', placeItems: 'center',
        }}>
          <Icon size={18} color={cfg.color} />
        </div>
        <div>
          <p className="eyebrow" style={{ color: cfg.color, margin: 0 }}>Case Assessment</p>
          <p style={{ margin: '3px 0 0', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 15, color: 'var(--text-primary)' }}>
            {assessment.label}
          </p>
        </div>
      </div>

      {/* Limitation period */}
      {assessment.limitationDetail && (
        <div style={{
          padding: '8px 12px',
          borderRadius: 'var(--radius-sm)',
          background: LIMITATION_BG[limStatus],
          border: `1px solid ${LIMITATION_BORDER[limStatus]}`,
          marginBottom: 'var(--space-4)',
          fontSize: 12,
          color: LIMITATION_COLOR[limStatus],
          fontFamily: 'var(--font-mono)',
        }}>
          ⏱ {assessment.limitationDetail}
        </div>
      )}

      {/* Strengths */}
      {assessment.strengths.length > 0 && (
        <div style={{ marginBottom: 'var(--space-3)' }}>
          <p className="label" style={{ color: 'var(--success)', marginBottom: 'var(--space-2)' }}>Strengths</p>
          {assessment.strengths.map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.08 * i }}
              className="row-item">
              <ChevronRight size={12} color="var(--success)" style={{ marginTop: 3, flexShrink: 0 }} />
              <span style={{ color: 'var(--text-secondary)' }}>{s}</span>
            </motion.div>
          ))}
        </div>
      )}

      {/* Weaknesses */}
      {assessment.weaknesses.length > 0 && (
        <div style={{ marginBottom: 'var(--space-3)' }}>
          <p className="label" style={{ color: 'var(--warning)', marginBottom: 'var(--space-2)' }}>Weaknesses</p>
          {assessment.weaknesses.map((w, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.08 * i + 0.15 }}
              className="row-item">
              <ChevronRight size={12} color="var(--warning)" style={{ marginTop: 3, flexShrink: 0 }} />
              <span style={{ color: 'var(--text-secondary)' }}>{w}</span>
            </motion.div>
          ))}
        </div>
      )}

      {/* Critical actions */}
      {assessment.criticalActions.length > 0 && (
        <div style={{
          padding: 'var(--space-3)',
          borderRadius: 'var(--radius-sm)',
          background: 'var(--danger-dim)',
          border: '1px solid var(--danger-border)',
        }}>
          <p className="label" style={{ color: 'var(--danger)', marginBottom: 'var(--space-2)' }}>Do This Now</p>
          {assessment.criticalActions.map((a, i) => (
            <div key={i} className="row-item">
              <span style={{ color: 'var(--danger)', fontWeight: 700, flexShrink: 0 }}>{i + 1}.</span>
              <span style={{ color: 'var(--text-primary)' }}>{a}</span>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
