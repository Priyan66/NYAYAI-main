'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import DocumentUpload from '@/components/score/DocumentUpload';
import { useScoreStore } from '@/store/scoreStore';
import { NyayScoreResult } from '@/types';

type Step = 'upload' | 'processing';

export default function ScoreScanPage() {
  const router = useRouter();
  const [step, setStep]           = useState<Step>('upload');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { setScore, setScanning, setScanProgress, scanProgress } = useScoreStore();

  useEffect(() => { setScanning(false); setScanProgress(0); }, [setScanProgress, setScanning]);

  const runProgress = () => {
    setScanProgress(0);
    setTimeout(() => setScanProgress(20),  300);
    setTimeout(() => setScanProgress(45),  900);
    setTimeout(() => setScanProgress(70), 1600);
  };

  const handleSubmit = async (files: File[], questionnaire: Record<string, boolean> | null) => {
    try {
      setIsSubmitting(true);
      setStep('processing');
      setScanning(true);
      runProgress();

      const formData = new FormData();
      files.forEach(f => formData.append('files', f));
      if (questionnaire) formData.append('questionnaire', JSON.stringify(questionnaire));

      const res  = await fetch('/api/score/upload', { method: 'POST', body: formData });
      const data = (await res.json()) as { error?: string; scoreId?: string; score?: NyayScoreResult };

      if (!res.ok || !data.score || !data.scoreId) throw new Error(data.error ?? 'Scan failed');

      setScanProgress(100);
      setScore(data.score, data.scoreId);
      setScanning(false);
      toast.success('Legal health score ready');
      router.push('/score');
    } catch {
      setStep('upload');
      setScanning(false);
      toast.error('Failed to scan documents. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', display: 'grid', gap: 'var(--space-6)' }}>
      {/* Header */}
      <div>
        <p className="eyebrow" style={{ margin: '0 0 var(--space-2)' }}>Nyay Score</p>
        <h1 style={{ margin: '0 0 var(--space-2)', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 28, color: 'var(--text-primary)' }}>
          Scan Legal Documents
        </h1>
        <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.6 }}>
          Upload contracts and agreements, or answer guided questions to compute your legal health score.
        </p>
      </div>

      {step === 'upload' && (
        <DocumentUpload onSubmit={handleSubmit} isSubmitting={isSubmitting} />
      )}

      {step === 'processing' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="card"
          style={{ display: 'grid', gap: 'var(--space-4)' }}
        >
          <p className="eyebrow">Analysing Documents</p>

          {/* Progress bar */}
          <div style={{
            height: 6, background: 'var(--border)',
            borderRadius: 3, overflow: 'hidden',
          }}>
            <motion.div
              animate={{ width: `${scanProgress}%` }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              style={{ height: '100%', background: 'var(--accent)', borderRadius: 3 }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: 13 }}>
              {scanProgress < 45  ? 'Extracting text from documents…' :
               scanProgress < 75  ? 'Analysing legal clauses…' :
               scanProgress < 100 ? 'Computing your score…' :
               'Complete!'}
            </p>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--accent)' }}>
              {scanProgress}%
            </span>
          </div>

          {/* Animated scan line */}
          <div style={{
            height: 40, borderRadius: 'var(--radius-sm)',
            background: 'var(--bg-surface)',
            overflow: 'hidden', position: 'relative',
          }}>
            <motion.div
              animate={{ y: ['-100%', '200%'] }}
              transition={{ repeat: Infinity, duration: 1.4, ease: 'linear' }}
              style={{
                position: 'absolute', left: 0, right: 0, height: '40%',
                background: 'linear-gradient(180deg, transparent, var(--accent-glow), transparent)',
              }}
            />
          </div>
        </motion.div>
      )}
    </div>
  );
}
