'use client';

import { motion } from 'framer-motion';
import { Check, Loader2, AlertTriangle } from 'lucide-react';
import { AgentStatus } from '@/types';
import StreamingText from '@/components/shared/StreamingText';

interface AgentProgressTrackerProps {
  open: boolean;
  agents: AgentStatus[];
}

export default function AgentProgressTracker({ open, agents }: AgentProgressTrackerProps) {
  if (!open) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 120,
      background: 'rgba(0,0,0,0.97)',
      display: 'grid', placeItems: 'center', padding: 'var(--space-6)',
    }}>
      <div style={{
        width: 'min(480px, 90vw)',
        border: '1px solid var(--border-strong)',
        background: 'var(--bg-secondary)',
        borderRadius: 'var(--radius)',
        padding: 'var(--space-6)',
      }}>
        <p className="eyebrow" style={{ margin: '0 0 var(--space-6)', textAlign: 'center' }}>
          Processing Your Case
        </p>

        {agents.map((agent, idx) => {
          const complete = agent.status === 'complete';
          const active   = agent.status === 'active';
          const error    = agent.status === 'error';

          const iconColor  = complete ? '#000' : active ? 'var(--accent)' : error ? 'var(--danger)' : 'var(--text-secondary)';
          const iconBg     = complete ? 'var(--accent)' : 'transparent';
          const iconBorder = active ? 'var(--accent)' : complete ? 'var(--accent)' : error ? 'var(--danger)' : 'var(--border-strong)';
          const iconShadow = active ? '0 0 0 6px var(--accent-glow)' : 'none';

          return (
            <motion.div key={agent.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.15 }}
            >
              <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-start' }}>
                {/* Icon + connector */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{
                    width: 38, height: 38, borderRadius: '50%',
                    border: `1px solid ${iconBorder}`,
                    background: iconBg, color: iconColor,
                    display: 'grid', placeItems: 'center',
                    boxShadow: iconShadow,
                    transition: 'all var(--transition)',
                  }}>
                    {complete ? <Check size={16} /> :
                     active   ? <Loader2 size={14} className="animate-spin" /> :
                     error    ? <AlertTriangle size={14} /> :
                     <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>{agent.id}</span>}
                  </div>
                  {idx < agents.length - 1 && (
                    <div style={{
                      width: 1, height: 28, marginTop: 4,
                      background: complete ? 'var(--accent)' : 'var(--border)',
                      transition: 'background var(--transition-slow)',
                    }} />
                  )}
                </div>

                {/* Text */}
                <div style={{ flex: 1, paddingTop: 8 }}>
                  <p style={{ margin: 0, fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>
                    {agent.name}
                  </p>
                  <p style={{ margin: '2px 0 0', color: 'var(--text-secondary)', fontSize: 12 }}>
                    {agent.description}
                  </p>
                  <p style={{ margin: '5px 0 0', color: active ? 'var(--text-primary)' : 'var(--text-secondary)', fontSize: 12, minHeight: 18 }}>
                    {active ? <StreamingText text={agent.logLine} speed={20} /> : agent.logLine}
                  </p>
                </div>

                {/* Status badge */}
                <span className={`badge ${
                  complete ? 'badge-success' : active ? 'badge-accent' : error ? 'badge-danger' : 'badge-ghost'
                }`} style={{ marginTop: 10 }}>
                  {agent.status}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
