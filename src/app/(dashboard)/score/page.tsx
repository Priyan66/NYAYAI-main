'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useScoreStore } from '@/store/scoreStore';
import { NyayScoreResult } from '@/types';
import ScoreDashboard from '@/components/score/ScoreDashboard';
import EmptyState from '@/components/shared/EmptyState';
import LoadingSkeleton from '@/components/shared/LoadingSkeleton';
import { useSession } from 'next-auth/react';

interface LatestScoreRow {
  totalScore: number;
  contractSafety: number;
  tenancyProtection: number;
  employmentSecurity: number;
  consumerRights: number;
  digitalRights: number;
  familyDocumentation: number;
  actionItems: string;
  uploadedDocuments: string;
  createdAt: string;
}

function deriveLabel(score: number): Pick<NyayScoreResult, 'label' | 'labelColor'> {
  if (score <= 200) return { label: 'Significantly Vulnerable', labelColor: 'red' };
  if (score <= 350) return { label: 'Moderately Protected',    labelColor: 'amber' };
  return                    { label: 'Well Protected',          labelColor: 'green' };
}

function rowToScore(row: LatestScoreRow): NyayScoreResult {
  const actionItems = (() => { try { return JSON.parse(row.actionItems) as NyayScoreResult['actionItems']; } catch { return []; } })();
  const uploadedDocuments = (() => {
    try {
      return (JSON.parse(row.uploadedDocuments) as Array<{ name: string; type: string; size: number; parseSuccess: boolean }>)
        .map(d => ({ ...d, extractedText: '' }));
    } catch { return []; }
  })();

  return {
    totalScore: row.totalScore,
    ...deriveLabel(row.totalScore),
    scannedAt: new Date(row.createdAt).toISOString(),
    uploadedDocuments,
    actionItems,
    dimensions: [
      { key: 'contractSafety',      label: 'Contract Safety',       score: row.contractSafety,      maxScore: 100, urgentAction: 'Review termination and liability clauses.',                    detailItems: [] },
      { key: 'tenancyProtection',   label: 'Tenancy Protection',    score: row.tenancyProtection,   maxScore: 100, urgentAction: 'Review notice period and deposit deduction clauses.',          detailItems: [] },
      { key: 'employmentSecurity',  label: 'Employment Security',   score: row.employmentSecurity,  maxScore: 100, urgentAction: 'Review notice parity and non-compete scope.',                  detailItems: [] },
      { key: 'consumerRights',      label: 'Consumer Rights',       score: row.consumerRights,      maxScore: 100, urgentAction: 'File unresolved complaints before limitation periods expire.',  detailItems: [] },
      { key: 'digitalRights',       label: 'Digital Rights',        score: row.digitalRights,       maxScore: 100, urgentAction: 'Audit app permissions and unnecessary data access.',            detailItems: [] },
      { key: 'familyDocumentation', label: 'Family Documentation',  score: row.familyDocumentation, maxScore: 100, urgentAction: 'Ensure will, nominees, and POA documentation are updated.',    detailItems: [] },
    ],
  };
}

export default function ScorePage() {
  const { currentScore, setScore } = useScoreStore();
  const [loading, setLoading]      = useState(!currentScore);
  const [score, setLocalScore]     = useState<NyayScoreResult | null>(currentScore);
  const { data: session }          = useSession();

  useEffect(() => {
    if (currentScore) { setLocalScore(currentScore); setLoading(false); return; }
    const run = async () => {
      try {
        setLoading(true);
        const res  = await fetch('/api/dashboard/summary');
        const data = (await res.json()) as { latestScore?: LatestScoreRow };
        if (res.ok && data.latestScore) {
          const mapped = rowToScore(data.latestScore);
          setLocalScore(mapped);
          setScore(mapped, 'latest-db');
        }
      } finally { setLoading(false); }
    };
    void run();
  }, [currentScore, setScore]);

  if (loading) return <div style={{ maxWidth: 1000, margin: '0 auto' }}><LoadingSkeleton lines={6} /></div>;

  if (!score) return (
    <EmptyState
      title="No Legal Health Score Yet"
      description="Upload your agreements or answer guided questions to get your first score in under a minute."
      action={
        <Link href="/score/scan" className="btn btn-primary" style={{ textDecoration: 'none' }}>
          Scan Documents <ArrowRight size={13} />
        </Link>
      }
    />
  );

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      <ScoreDashboard score={score} userName={session?.user?.name ?? undefined} />
    </div>
  );
}
