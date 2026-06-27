'use client';

import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, RefreshCcw, CheckCircle } from 'lucide-react';
import { AdversarialCritique } from '@/types';
import DocumentViewer from './DocumentViewer';

type Phase = 'initial' | 'critiquing' | 'rewriting' | 'finalized';

interface AdversarialStreamProps {
  disputeId: string;
  initialNotice: string;
  initialComplaint: string;
  onComplete: (revisedNotice: string, revisedComplaint: string, critique: AdversarialCritique) => void;
}

const PHASE_LABEL: Record<Phase, { text: string; color: string; icon?: typeof AlertTriangle }> = {
  initial:    { text: 'Initial Draft Ready',            color: 'var(--text-secondary)' },
  critiquing: { text: 'Defence Counsel Analysis Running', color: 'var(--danger)',  icon: AlertTriangle },
  rewriting:  { text: 'Strengthening Documents',         color: 'var(--accent)',   icon: RefreshCcw },
  finalized:  { text: 'Documents Finalized',             color: 'var(--success)',  icon: CheckCircle },
};

export default function AdversarialStream({ disputeId, initialNotice, initialComplaint, onComplete }: AdversarialStreamProps) {
  const [phase, setPhase] = useState<Phase>('initial');
  const [streamedItems, setStreamedItems] = useState<string[]>([]);
  const [revisedNotice, setRevisedNotice] = useState('');
  const [isRunning, setIsRunning] = useState(false);

  const critiqueRef        = useRef<AdversarialCritique | null>(null);
  const revisedNoticeRef   = useRef('');
  const revisedComplaintRef = useRef('');

  const pushItems = async (items: string[]) => {
    for (const item of items) {
      await new Promise(r => setTimeout(r, 380));
      setStreamedItems(prev => [...prev, item]);
    }
  };

  const run = async () => {
    setIsRunning(true);
    setPhase('critiquing');
    setStreamedItems([]);

    try {
      const res = await fetch('/api/fight/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ disputeId }),
      });
      if (!res.body) throw new Error('No stream');

      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let buf = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        const blocks = buf.split('\n\n');
        buf = blocks.pop() ?? '';

        for (const block of blocks) {
          const line = block.split('\n').find(l => l.startsWith('data: '));
          if (!line) continue;
          const raw = line.replace('data: ', '').trim();
          if (!raw) continue;

          try {
            const ev = JSON.parse(raw) as { type: string; content: string };

            if (ev.type === 'critique') {
              const c = JSON.parse(ev.content) as AdversarialCritique;
              critiqueRef.current = c;
              await pushItems([...c.wrongCitations, ...c.proceduralVulnerabilities, ...c.factualGaps, ...c.counterNarratives]);
            }
            if (ev.type === 'phase' && ev.content === 'rewriting') {
              await new Promise(r => setTimeout(r, 500));
              setPhase('rewriting');
            }
            if (ev.type === 'revised_notice') {
              revisedNoticeRef.current = ev.content;
              setRevisedNotice(ev.content);
            }
            if (ev.type === 'revised_complaint') {
              revisedComplaintRef.current = ev.content;
            }
            if (ev.type === 'phase' && ev.content === 'finalized') setPhase('finalized');
            if (ev.type === 'done') {
              setPhase('finalized');
              if (critiqueRef.current) {
                onComplete(
                  revisedNoticeRef.current || initialNotice,
                  revisedComplaintRef.current || initialComplaint,
                  critiqueRef.current,
                );
              }
              setIsRunning(false);
            }
          } catch { /* ignore malformed chunks */ }
        }
      }
    } catch {
      setIsRunning(false);
      setPhase('initial');
    }
  };

  const phaseInfo = PHASE_LABEL[phase];
  const PhaseIcon = phaseInfo.icon;
  const isAnimating = phase === 'critiquing' || phase === 'rewriting';

  return (
    <div>
      {/* Phase bar */}
      <div style={{
        marginBottom: 'var(--space-6)',
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', gap: 'var(--space-3)', flexWrap: 'wrap',
      }}>
        <AnimatePresence mode="wait">
          <motion.div key={phase}
            initial={{ opacity: 0 }} animate={{ opacity: isAnimating ? [1, 0.5, 1] : 1 }}
            exit={{ opacity: 0 }}
            transition={isAnimating ? { repeat: Infinity, duration: 1.4 } : { duration: 0.2 }}
            style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}
          >
            {PhaseIcon && <PhaseIcon size={13} color={phaseInfo.color} />}
            <span style={{
              fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 11,
              letterSpacing: '0.14em', textTransform: 'uppercase', color: phaseInfo.color,
            }}>
              {phaseInfo.text}
            </span>
          </motion.div>
        </AnimatePresence>

        {phase === 'initial' && !isRunning && (
          <button className="btn btn-danger" onClick={() => void run()}>
            Run Adversarial Review
          </button>
        )}
      </div>

      {/* Content grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: streamedItems.length > 0 ? 'minmax(0,1fr) minmax(0,1fr)' : '1fr',
        gap: 'var(--space-4)',
      }}>
        <DocumentViewer
          content={phase === 'finalized' && revisedNotice ? revisedNotice : initialNotice}
          isRewriting={phase === 'rewriting'}
        />

        {streamedItems.length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
            style={{
              background: 'var(--danger-dim)',
              border: '1px solid var(--danger-border)',
              borderRadius: 'var(--radius)',
              padding: 'var(--space-5)',
            }}
          >
            <p className="label" style={{ color: 'var(--danger)', margin: '0 0 var(--space-4)' }}>
              Defence Counsel Attacks
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {streamedItems.map((item, i) => (
                <motion.div key={`${i}-${item}`}
                  initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.25 }}
                  className="row-item"
                >
                  <span style={{ color: 'var(--danger)', flexShrink: 0 }}>⚠</span>
                  <span style={{ color: 'var(--text-primary)' }}>{item}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
