'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertTriangle, XCircle, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { VerificationResult, VerificationIssue } from '@/types';

interface VerificationBadgeProps {
  verification: VerificationResult;
}

const SEV: Record<VerificationIssue['severity'], { icon: typeof CheckCircle; color: string; bg: string; border: string; label: string }> = {
  error:   { icon: XCircle,       color: 'var(--danger)',  bg: 'var(--danger-dim)',  border: 'var(--danger-border)',  label: 'Error' },
  warning: { icon: AlertTriangle, color: 'var(--warning)', bg: 'var(--warning-dim)', border: 'var(--warning-border)', label: 'Warning' },
  info:    { icon: CheckCircle,   color: 'var(--accent)',  bg: 'var(--accent-dim)',  border: 'rgba(0,180,216,0.2)',   label: 'Info' },
};

export default function VerificationBadge({ verification }: VerificationBadgeProps) {
  const [expanded, setExpanded] = useState(false);

  const errors   = verification.issues.filter(i => i.severity === 'error').length;
  const warnings = verification.issues.filter(i => i.severity === 'warning').length;
  const clean    = errors === 0 && warnings === 0;

  const statusColor  = errors > 0 ? 'var(--danger)' : warnings > 0 ? 'var(--warning)' : 'var(--success)';
  const borderColor  = errors > 0 ? 'var(--danger-border)' : warnings > 0 ? 'var(--warning-border)' : 'var(--success-border)';
  const statusLabel  = errors > 0
    ? `${errors} error${errors > 1 ? 's' : ''} found`
    : warnings > 0
    ? `${warnings} warning${warnings > 1 ? 's' : ''}`
    : 'All checks passed';
  const StatusIcon = errors > 0 ? XCircle : warnings > 0 ? AlertTriangle : CheckCircle;

  return (
    <div style={{
      background: 'var(--bg-secondary)',
      border: `1px solid ${borderColor}`,
      borderRadius: 'var(--radius)',
      overflow: 'hidden',
    }}>
      <button
        onClick={() => setExpanded(v => !v)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', padding: '10px 16px',
          background: 'transparent', border: 'none', cursor: 'pointer',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <StatusIcon size={15} color={statusColor} />
          <span style={{
            fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 11,
            letterSpacing: '0.1em', textTransform: 'uppercase', color: statusColor,
          }}>
            Document Verification
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-secondary)' }}>
            {statusLabel}
          </span>
        </div>
        <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={13} color="var(--text-muted)" />
        </motion.div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ padding: '0 16px 16px', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              {clean && (
                <div style={{
                  padding: 'var(--space-3)', borderRadius: 'var(--radius-sm)',
                  background: 'var(--success-dim)', border: '1px solid var(--success-border)',
                  fontSize: 13, color: 'var(--success)',
                }}>
                  All automated checks passed. Citations verified against statute database, document structure validated, jurisdiction confirmed.
                </div>
              )}
              {verification.issues.map((issue, i) => {
                const s = SEV[issue.severity];
                const IssueIcon = s.icon;
                return (
                  <motion.div key={i}
                    initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                    style={{ padding: '10px 12px', borderRadius: 'var(--radius-sm)', background: s.bg, border: `1px solid ${s.border}` }}
                  >
                    <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'flex-start' }}>
                      <IssueIcon size={13} color={s.color} style={{ marginTop: 2, flexShrink: 0 }} />
                      <div>
                        <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center', marginBottom: 4 }}>
                          <span className="badge" style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.color }}>{s.label}</span>
                          <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                            {issue.category}
                          </span>
                        </div>
                        <p style={{ margin: 0, fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.5 }}>{issue.message}</p>
                        <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{issue.suggestion}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
              <p style={{ margin: '4px 0 0', fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-ghost)' }}>
                Verified at {new Date(verification.checkedAt).toLocaleTimeString('en-IN')}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
