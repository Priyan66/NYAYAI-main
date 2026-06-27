'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { DisputeRecord, AdversarialCritique, VerificationResult, DisputeRow } from '@/types';
import { useDisputeStore } from '@/store/disputeStore';
import { useUIStore } from '@/store/uiStore';
import AgentProgressTracker from '@/components/fight/AgentProgressTracker';
import CaseAssessmentCard from '@/components/fight/CaseAssessmentCard';
import VerificationBadge from '@/components/fight/VerificationBadge';
import LandmineAlert from '@/components/fight/LandmineAlert';
import PrecedentCases from '@/components/fight/PrecedentCases';
import DocumentViewer from '@/components/fight/DocumentViewer';
import AdversarialStream from '@/components/fight/AdversarialStream';
import EvidenceChecklist from '@/components/fight/EvidenceChecklist';
import CoachingSummary from '@/components/fight/CoachingSummary';
import DocumentDownload from '@/components/fight/DocumentDownload';
import LoadingSkeleton from '@/components/shared/LoadingSkeleton';

interface LocalDispute extends DisputeRow {
  parsedRecord?: DisputeRecord;
}

function tabButtonStyle(active: boolean): React.CSSProperties {
  return {
    border: 'none',
    background: 'transparent',
    color: active ? '#FFFFFF' : '#A0A0A0',
    borderBottom: active ? '2px solid #00B4D8' : '2px solid transparent',
    fontFamily: 'Barlow, sans-serif',
    fontWeight: 600,
    fontSize: '12px',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    padding: '10px 12px',
    cursor: 'pointer',
  };
}

export default function FightResultPage() {
  const params = useParams<{ disputeId: string }>();
  const disputeId = params.disputeId;

  const [dispute, setDispute] = useState<LocalDispute | null>(null);
  const [loading, setLoading] = useState(true);
  const [pipelineRunning, setPipelineRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verification, setVerification] = useState<VerificationResult | null>(null);

  const {
    agents,
    setAgentStatus,
    setCurrentStep,
    setDisputeRecord,
    updateDocuments,
    setAdversarialPhase,
  } = useDisputeStore();
  const { activeDocumentTab, setActiveDocumentTab } = useUIStore();

  const record = useMemo(() => {
    if (!dispute) return null;
    if (dispute.parsedRecord) return dispute.parsedRecord;
    try {
      return JSON.parse(dispute.disputeRecord) as DisputeRecord;
    } catch {
      return null;
    }
  }, [dispute]);

  const parseSse = (buffer: string) => {
    const events = buffer.split('\n\n');
    const complete = events.slice(0, -1);
    const remainder = events[events.length - 1] ?? '';

    const parsed = complete
      .map((block) => block.split('\n').find((line) => line.startsWith('data: ')))
      .filter((line): line is string => Boolean(line))
      .map((line) => line.replace('data: ', '').trim())
      .filter((line) => line.length > 0);

    return { parsed, remainder };
  };

  const fetchDispute = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/fight/${disputeId}`);
      const data = (await response.json()) as LocalDispute | { error: string };
      if (!response.ok || 'error' in data) throw new Error('Could not load dispute');

      let parsedRecord: DisputeRecord | undefined;
      try {
        parsedRecord = JSON.parse(data.disputeRecord) as DisputeRecord;
      } catch {
        parsedRecord = undefined;
      }

      setDispute({ ...data, parsedRecord });
      if (parsedRecord) setDisputeRecord(parsedRecord);

      if (data.status === 'intake') {
        await runPipeline();
      }
    } catch {
      setError('Failed to load case data');
    } finally {
      setLoading(false);
    }
  };

  const runPipeline = async () => {
    setPipelineRunning(true);
    setError(null);

    try {
      // Agent 2: Legal Intelligence
      setCurrentStep('analyse');
      setAgentStatus(2, 'active', 'Mapping statutes, forum, and precedents...');
      const analyseRes = await fetch('/api/fight/analyse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ disputeId }),
      });

      const analyseData = (await analyseRes.json()) as {
        disputeRecord?: DisputeRecord;
        error?: string;
      };

      if (!analyseRes.ok || !analyseData.disputeRecord) {
        throw new Error(analyseData.error ?? 'Analysis failed');
      }

      setAgentStatus(2, 'complete', 'Legal intelligence complete');
      setDisputeRecord(analyseData.disputeRecord);

      // Agent 3: Document Generation (now sequential with shared context)
      setCurrentStep('generate');
      setAgentStatus(3, 'active', 'Drafting legal notice...');

      const generateRes = await fetch('/api/fight/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ disputeId }),
      });

      if (!generateRes.body) throw new Error('Streaming unavailable');

      const reader = generateRes.body.getReader();
      const decoder = new TextDecoder();
      let sseBuffer = '';

      const docs: {
        legalNotice: string;
        forumComplaint: string;
        evidenceChecklist: string;
        coachingSummary: string;
      } = {
        legalNotice: '',
        forumComplaint: '',
        evidenceChecklist: '',
        coachingSummary: '',
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        sseBuffer += decoder.decode(value, { stream: true });
        const { parsed, remainder } = parseSse(sseBuffer);
        sseBuffer = remainder;

        for (const raw of parsed) {
          try {
            const event = JSON.parse(raw) as { type: string; content: string };
            if (event.type === 'status') {
              setAgentStatus(3, 'active', event.content);
            }
            if (event.type === 'notice') docs.legalNotice = event.content;
            if (event.type === 'complaint') docs.forumComplaint = event.content;
            if (event.type === 'checklist') docs.evidenceChecklist = event.content;
            if (event.type === 'coaching') docs.coachingSummary = event.content;
            if (event.type === 'verification') {
              try {
                setVerification(JSON.parse(event.content) as VerificationResult);
              } catch { /* ignore parse errors */ }
            }
            if (event.type === 'error') throw new Error(event.content);
          } catch (err) {
            // Re-throw actual errors (from event.type === 'error'), swallow JSON parse failures
            if (err instanceof Error && err.message && !err.message.includes('JSON')) throw err;
          }
        }
      }

      setAgentStatus(3, 'complete', 'Documents drafted and verified');
      updateDocuments(docs);
      setCurrentStep('complete');

      setDispute((prev) =>
        prev
          ? {
              ...prev,
              status: 'generated',
              disputeRecord: JSON.stringify(analyseData.disputeRecord),
              parsedRecord: analyseData.disputeRecord,
              legalNotice: docs.legalNotice,
              forumComplaint: docs.forumComplaint,
              evidenceChecklist: docs.evidenceChecklist,
              coachingSummary: docs.coachingSummary,
            }
          : prev
      );

      toast.success('Documents generated successfully');
    } catch {
      setAgentStatus(2, 'error', 'Analysis failed');
      setAgentStatus(3, 'error', 'Generation failed');
      setError('Pipeline failed. Please refresh and retry.');
    } finally {
      setPipelineRunning(false);
    }
  };

  useEffect(() => {
    void fetchDispute();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disputeId]);

  if (loading) {
    return (
      <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gap: '18px' }}>
        <LoadingSkeleton lines={5} />
        <LoadingSkeleton lines={7} />
      </div>
    );
  }

  if (error || !dispute || !record) {
    return (
      <div
        style={{
          maxWidth: '600px',
          margin: '60px auto',
          padding: '24px',
          border: '1px solid rgba(239,68,68,0.3)',
          borderRadius: '6px',
          background: 'rgba(239,68,68,0.04)',
          textAlign: 'center',
        }}
      >
        <p style={{ color: '#EF4444', fontSize: '15px', margin: 0 }}>
          {error ?? 'Case data unavailable'}
        </p>
        <button
          onClick={() => window.location.reload()}
          style={{
            marginTop: '16px',
            padding: '8px 20px',
            border: '1px solid rgba(255,255,255,0.2)',
            background: 'transparent',
            color: '#FFFFFF',
            borderRadius: '4px',
            cursor: 'pointer',
            fontFamily: 'Barlow, sans-serif',
            fontWeight: 600,
            fontSize: '12px',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  const finalNotice = dispute.revisedNotice ?? dispute.legalNotice ?? '';
  const finalComplaint = dispute.revisedComplaint ?? dispute.forumComplaint ?? '';
  const critique = dispute.adversarialCritique
    ? (JSON.parse(dispute.adversarialCritique) as AdversarialCritique)
    : null;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Pipeline progress overlay */}
      <AgentProgressTracker open={pipelineRunning} agents={agents} />

      {/* ── SECTION 1: Your Legal Position ── */}
      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '14px',
          marginBottom: '20px',
        }}
      >
        {/* Case Assessment (replaces fake gauge) */}
        <div>
          {record.caseAssessment ? (
            <CaseAssessmentCard assessment={record.caseAssessment} />
          ) : (
            /* Backward compat: show basic info if old data */
            <div
              style={{
                background: '#080808',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '6px',
                padding: '20px',
              }}
            >
              <p style={{ margin: 0, color: '#A0A0A0', fontSize: '13px' }}>
                Case assessment not available for this dispute.
              </p>
            </div>
          )}
        </div>

        {/* Statute info + Landmines */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {record.statuteInfo && (
            <div
              style={{
                background: '#080808',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '6px',
                padding: '16px',
              }}
            >
              <p
                style={{
                  margin: 0,
                  color: '#00B4D8',
                  fontFamily: 'Barlow, sans-serif',
                  fontSize: '10px',
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                }}
              >
                Applicable Law
              </p>
              <p style={{ margin: '8px 0 0', color: '#FFFFFF', fontWeight: 600, fontSize: '14px' }}>
                {record.statuteInfo.actName}
              </p>
              <div
                style={{
                  marginTop: '10px',
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '8px',
                }}
              >
                <div>
                  <p style={{ margin: 0, color: '#666', fontSize: '10px', fontFamily: 'Barlow, sans-serif', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Forum</p>
                  <p style={{ margin: '2px 0 0', color: '#A0A0A0', fontSize: '12px' }}>{record.statuteInfo.recommendedForum}</p>
                </div>
                <div>
                  <p style={{ margin: 0, color: '#666', fontSize: '10px', fontFamily: 'Barlow, sans-serif', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Filing Fee</p>
                  <p style={{ margin: '2px 0 0', color: '#A0A0A0', fontSize: '12px', fontFamily: 'JetBrains Mono, monospace' }}>Rs.{String(record.statuteInfo.filingFeeINR)}</p>
                </div>
                <div>
                  <p style={{ margin: 0, color: '#666', fontSize: '10px', fontFamily: 'Barlow, sans-serif', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Avg Resolution</p>
                  <p style={{ margin: '2px 0 0', color: '#A0A0A0', fontSize: '12px', fontFamily: 'JetBrains Mono, monospace' }}>{record.statuteInfo.avgResolutionDays} days</p>
                </div>
                <div>
                  <p style={{ margin: 0, color: '#666', fontSize: '10px', fontFamily: 'Barlow, sans-serif', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Sections</p>
                  <p style={{ margin: '2px 0 0', color: '#00B4D8', fontSize: '11px', fontFamily: 'JetBrains Mono, monospace' }}>{record.statuteInfo.relevantSections.join(', ')}</p>
                </div>
              </div>
            </div>
          )}
          <LandmineAlert landmines={record.landmines ?? []} />
        </div>
      </section>

      {/* Precedent Cases */}
      {(record.precedentCases?.length ?? 0) > 0 && (
        <section style={{ marginBottom: '20px' }}>
          <PrecedentCases cases={record.precedentCases ?? []} />
        </section>
      )}

      {/* ── SECTION 2: Documents ── */}
      {/* Verification badge */}
      {verification && (
        <div style={{ marginBottom: '12px' }}>
          <VerificationBadge verification={verification} />
        </div>
      )}

      <section style={{ marginBottom: '20px' }}>
        <div
          style={{
            display: 'flex',
            gap: '8px',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            flexWrap: 'wrap',
          }}
        >
          <button
            onClick={() => setActiveDocumentTab('initial')}
            style={tabButtonStyle(activeDocumentTab === 'initial')}
          >
            Draft Documents
          </button>
          <button
            onClick={() => setActiveDocumentTab('adversarial')}
            style={tabButtonStyle(activeDocumentTab === 'adversarial')}
          >
            Strength Test
          </button>
          <button
            onClick={() => setActiveDocumentTab('final')}
            style={tabButtonStyle(activeDocumentTab === 'final')}
          >
            Final Documents
          </button>
        </div>

        <div style={{ marginTop: '14px' }}>
          {activeDocumentTab === 'initial' && (
            <div style={{ display: 'grid', gap: '12px' }}>
              {!dispute.legalNotice ? (
                <LoadingSkeleton lines={8} />
              ) : (
                <>
                  <DocumentViewer content={dispute.legalNotice ?? ''} />
                  {dispute.forumComplaint && (
                    <DocumentViewer content={dispute.forumComplaint} />
                  )}
                </>
              )}
            </div>
          )}

          {activeDocumentTab === 'adversarial' && (
            <AdversarialStream
              disputeId={disputeId}
              initialNotice={dispute.legalNotice ?? ''}
              initialComplaint={dispute.forumComplaint ?? ''}
              onComplete={(revisedNotice, revisedComplaint, newCritique) => {
                setAdversarialPhase('finalized');
                setAgentStatus(4, 'complete', 'Adversarial review complete');
                setDispute((prev) =>
                  prev
                    ? {
                        ...prev,
                        revisedNotice,
                        revisedComplaint,
                        adversarialCritique: JSON.stringify(newCritique),
                      }
                    : prev
                );
                updateDocuments({
                  revisedNotice,
                  revisedComplaint,
                  adversarialCritique: newCritique,
                });
              }}
            />
          )}

          {activeDocumentTab === 'final' && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '12px',
              }}
            >
              <DocumentViewer content={finalNotice} />
              <DocumentViewer content={finalComplaint} />
              {critique && (
                <div
                  style={{
                    background: '#080808',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '6px',
                    padding: '20px',
                  }}
                >
                  <p
                    style={{
                      margin: '0 0 8px',
                      color: '#2DD4BF',
                      fontFamily: 'Barlow, sans-serif',
                      fontWeight: 700,
                      fontSize: '11px',
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                    }}
                  >
                    Weaknesses Addressed
                  </p>
                  <ul
                    style={{
                      margin: 0,
                      paddingLeft: '16px',
                      color: '#A0A0A0',
                      lineHeight: 1.7,
                      fontSize: '13px',
                    }}
                  >
                    {[
                      ...critique.wrongCitations,
                      ...critique.proceduralVulnerabilities,
                      ...critique.factualGaps,
                      ...critique.counterNarratives,
                    ]
                      .slice(0, 8)
                      .map((item, i) => (
                        <li key={`${item}-${i}`}>{item}</li>
                      ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ── SECTION 3: What To Do Next ── */}
      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '12px',
          marginBottom: '20px',
        }}
      >
        <EvidenceChecklist content={dispute.evidenceChecklist ?? ''} />
        <CoachingSummary content={dispute.coachingSummary ?? ''} />
      </section>

      {/* Sticky download bar */}
      <DocumentDownload
        disputeId={disputeId}
        legalNotice={finalNotice}
        forumComplaint={finalComplaint}
        evidenceChecklist={dispute.evidenceChecklist ?? ''}
        coachingSummary={dispute.coachingSummary ?? ''}
      />
    </div>
  );
}
