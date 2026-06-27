'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { detectLanguage } from '@/lib/language';
import LanguageBadge from '@/components/shared/LanguageBadge';
import { useDisputeStore } from '@/store/disputeStore';
import { Send, ArrowRight, SkipForward } from 'lucide-react';

// ── Steps ──────────────────────────────────────────────────────────
type Step = 'story' | 'evidence' | 'details' | 'review';

const EVIDENCE_PRESETS = [
  { id: 'salary_slip', label: 'Salary Slip', emoji: '📄' },
  { id: 'official_receipt', label: 'Receipt', emoji: '🧾' },
  { id: 'whatsapp_messages', label: 'WhatsApp Chat', emoji: '💬' },
  { id: 'written_contract', label: 'Contract', emoji: '📝' },
  { id: 'bank_statement', label: 'Bank Statement', emoji: '🏦' },
  { id: 'warranty_card', label: 'Warranty Card', emoji: '🔖' },
  { id: 'email_correspondence', label: 'Emails', emoji: '📧' },
  { id: 'photos', label: 'Photos / Screenshots', emoji: '📸' },
  { id: 'video', label: 'Video', emoji: '🎥' },
  { id: 'witness_verbal', label: 'Witness', emoji: '👤' },
];

const PLACEHOLDER_ROTATION = [
  'मेरे employer ने 4 महीने से salary नहीं दी...',
  'My landlord refused to return my deposit...',
  'கடையில் வாங்கிய பொருள் வேலை செய்யவில்லை...',
  'నా యజమాని జీతం ఇవ్వలేదు...',
  'ನನ್ನ ಮಾಲೀಕ ಸಂಬಳ ಕೊಡಲಿಲ್ಲ...',
];

const DEMO_INPUT = {
  text: 'Mere employer ne mujhe 4 mahine se salary nahi di. ₹32,000 baaki hai. Mere paas salary slip hai aur WhatsApp messages bhi hain jisme wo confirm karta hai employment.',
  evidence: ['salary_slip', 'whatsapp_messages'],
  amount: 32000,
};

const stepAnim = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.3, ease: "easeInOut" as const },
};

interface IntakeFormProps {
  isDemo?: boolean;
}

export default function IntakeForm({ isDemo = false }: IntakeFormProps) {
  const router = useRouter();
  const { setDisputeId, setCurrentStep, setAgentStatus, setDisputeRecord } = useDisputeStore();

  // ── State ──────────────────────────────────────────────────────
  const [step, setStep] = useState<Step>('story');
  const [inputText, setInputText] = useState('');
  const [detectedLang, setDetectedLang] = useState('en');
  const [selectedEvidence, setSelectedEvidence] = useState<string[]>([]);
  const [amount, setAmount] = useState('');
  const [incidentDate, setIncidentDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [clarifyingQuestions, setClarifyingQuestions] = useState<string[]>([]);
  const [clarifyingAnswers, setClarifyingAnswers] = useState<string[]>([]);
  const demoSubmittedRef = useRef(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // ── Placeholder rotation ───────────────────────────────────────
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((i) => (i + 1) % PLACEHOLDER_ROTATION.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  // ── Language detection ─────────────────────────────────────────
  useEffect(() => {
    if (inputText.length > 15) {
      const timer = setTimeout(() => setDetectedLang(detectLanguage(inputText)), 400);
      return () => clearTimeout(timer);
    }
  }, [inputText]);

  // ── Demo mode ──────────────────────────────────────────────────
  useEffect(() => {
    if (!isDemo) return;
    setInputText(DEMO_INPUT.text);
    setSelectedEvidence(DEMO_INPUT.evidence);
    setAmount(String(DEMO_INPUT.amount));
    const d = new Date();
    d.setMonth(d.getMonth() - 4);
    setIncidentDate(d.toISOString().split('T')[0]);
    // Auto-advance through steps
    const t1 = setTimeout(() => setStep('evidence'), 600);
    const t2 = setTimeout(() => setStep('details'), 1200);
    const t3 = setTimeout(() => setStep('review'), 1800);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [isDemo]);

  // ── Evidence toggle ────────────────────────────────────────────
  const toggleEvidence = (id: string) => {
    setSelectedEvidence((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );
  };

  // ── Submit ─────────────────────────────────────────────────────
  const handleSubmit = useCallback(async () => {
    if (!inputText.trim() || inputText.length < 20) {
      toast.error('Please describe your situation in more detail');
      return;
    }

    setIsSubmitting(true);
    setCurrentStep('intake');
    setAgentStatus(1, 'active', `Understanding your situation...`);

    try {
      const combinedInput =
        clarifyingAnswers.filter(Boolean).length > 0
          ? `${inputText}\n\nAdditional clarification: ${clarifyingAnswers.filter(Boolean).join(' ')}`
          : inputText;

      const res = await fetch('/api/fight/intake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: combinedInput,
          evidenceItems: selectedEvidence,
          amountInvolved: amount ? parseFloat(amount) : null,
          incidentDate: incidentDate || null,
        }),
      });

      const data = (await res.json()) as {
        status: string;
        clarifyingQuestions?: string[];
        disputeId?: string;
        disputeRecord?: import('@/types').DisputeRecord;
      };

      if (data.status === 'needs_clarification' && data.clarifyingQuestions) {
        setClarifyingQuestions(data.clarifyingQuestions);
        setClarifyingAnswers(data.clarifyingQuestions.map(() => ''));
        setAgentStatus(1, 'pending', 'Need a bit more information...');
        setIsSubmitting(false);
        return;
      }

      if (!res.ok || !data.disputeId) throw new Error('Intake failed');

      setAgentStatus(1, 'complete', 'Dispute understood');
      setDisputeId(data.disputeId);
      setDisputeRecord(data.disputeRecord!);
      router.push(`/fight/${data.disputeId}`);
    } catch {
      toast.error('Something went wrong. Please try again.');
      setAgentStatus(1, 'error', 'Failed to process');
    } finally {
      setIsSubmitting(false);
    }
  }, [
    amount, clarifyingAnswers, incidentDate, inputText, router,
    selectedEvidence, setAgentStatus, setCurrentStep, setDisputeId, setDisputeRecord,
  ]);

  // ── Demo auto-submit ───────────────────────────────────────────
  useEffect(() => {
    if (!isDemo || demoSubmittedRef.current || step !== 'review') return;
    const timer = setTimeout(() => {
      demoSubmittedRef.current = true;
      void handleSubmit();
    }, 1200);
    return () => clearTimeout(timer);
  }, [isDemo, step, handleSubmit]);

  // ── Step navigation ────────────────────────────────────────────
  const canAdvanceFromStory = inputText.trim().length >= 20;
  const canAdvanceFromEvidence = true; // evidence is optional

  const advanceToEvidence = () => {
    if (canAdvanceFromStory) setStep('evidence');
  };

  const advanceToDetails = () => setStep('details');
  const advanceToReview = () => setStep('review');
  const goBack = (target: Step) => setStep(target);

  // ── Render ─────────────────────────────────────────────────────
  return (
    <div style={{ maxWidth: '640px', margin: '0 auto' }}>
      {/* Step indicator */}
      <div
        style={{
          display: 'flex',
          gap: '4px',
          marginBottom: '28px',
        }}
      >
        {(['story', 'evidence', 'details', 'review'] as Step[]).map((s, i) => (
          <div
            key={s}
            style={{
              flex: 1,
              height: '2px',
              borderRadius: '1px',
              background:
                i <= ['story', 'evidence', 'details', 'review'].indexOf(step)
                  ? '#00B4D8'
                  : 'rgba(255,255,255,0.08)',
              transition: 'background 0.4s ease',
            }}
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* ── STEP 1: Tell your story ──────────────────────────── */}
        {step === 'story' && (
          <motion.div key="story" {...stepAnim}>
            <p
              style={{
                margin: '0 0 4px',
                fontFamily: 'Barlow, sans-serif',
                fontWeight: 600,
                fontSize: '11px',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: '#00B4D8',
              }}
            >
              Step 1 of 4
            </p>
            <h2
              style={{
                margin: '0 0 6px',
                fontFamily: 'Barlow, sans-serif',
                fontWeight: 700,
                fontSize: '22px',
                color: '#FFFFFF',
              }}
            >
              Tell me what happened
            </h2>
            <p
              style={{
                margin: '0 0 20px',
                fontSize: '14px',
                color: '#A0A0A0',
                lineHeight: 1.6,
              }}
            >
              Write in any language. Be as specific as you can about who wronged you, what they did, and when.
            </p>

            <div style={{ position: 'relative' }}>
              {detectedLang !== 'en' && inputText.length > 15 && (
                <div style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 10 }}>
                  <LanguageBadge locale={detectedLang} />
                </div>
              )}
              <textarea
                ref={textareaRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={PLACEHOLDER_ROTATION[placeholderIndex]}
                autoFocus
                style={{
                  width: '100%',
                  minHeight: '180px',
                  background: 'var(--bg-surface, #0E0E0E)',
                  border: '1px solid var(--border, rgba(255,255,255,0.10))',
                  borderRadius: '6px',
                  padding: '16px',
                  paddingRight: detectedLang !== 'en' && inputText.length > 15 ? '90px' : '16px',
                  color: '#FFFFFF',
                  fontFamily: 'Noto Sans, sans-serif',
                  fontSize: '16px',
                  lineHeight: '1.7',
                  resize: 'vertical',
                  outline: 'none',
                  transition: 'border-color 200ms, box-shadow 200ms',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--accent, #00B4D8)';
                  e.target.style.boxShadow = '0 0 0 1px var(--accent-glow, rgba(0,180,216,0.2))';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--border, rgba(255,255,255,0.10))';
                  e.target.style.boxShadow = 'none';
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && canAdvanceFromStory) {
                    advanceToEvidence();
                  }
                }}
              />
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: '12px',
              }}
            >
              <span
                style={{
                  fontSize: '12px',
                  fontFamily: 'JetBrains Mono, monospace',
                  color: canAdvanceFromStory ? '#444' : '#EF4444',
                  transition: 'color 0.3s',
                }}
              >
                {inputText.length < 20
                  ? `${20 - inputText.length} more characters needed`
                  : '✓ Ready'}
              </span>
              <button
                onClick={advanceToEvidence}
                disabled={!canAdvanceFromStory}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '10px 20px',
                  background: canAdvanceFromStory ? '#00B4D8' : 'rgba(0,180,216,0.2)',
                  border: 'none',
                  borderRadius: '6px',
                  color: canAdvanceFromStory ? '#000' : '#666',
                  fontFamily: 'Barlow, sans-serif',
                  fontWeight: 700,
                  fontSize: '13px',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  cursor: canAdvanceFromStory ? 'pointer' : 'not-allowed',
                  transition: 'all 200ms',
                }}
              >
                Continue <ArrowRight size={14} />
              </button>
            </div>
          </motion.div>
        )}

        {/* ── STEP 2: Evidence ─────────────────────────────────── */}
        {step === 'evidence' && (
          <motion.div key="evidence" {...stepAnim}>
            <p
              style={{
                margin: '0 0 4px',
                fontFamily: 'Barlow, sans-serif',
                fontWeight: 600,
                fontSize: '11px',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: '#00B4D8',
              }}
            >
              Step 2 of 4
            </p>
            <h2
              style={{
                margin: '0 0 6px',
                fontFamily: 'Barlow, sans-serif',
                fontWeight: 700,
                fontSize: '22px',
                color: '#FFFFFF',
              }}
            >
              What proof do you have?
            </h2>
            <p
              style={{
                margin: '0 0 20px',
                fontSize: '14px',
                color: '#A0A0A0',
                lineHeight: 1.6,
              }}
            >
              Select everything you have. Don&apos;t worry if you don&apos;t have much — we&apos;ll tell you what else to gather.
            </p>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                gap: '8px',
                marginBottom: '20px',
              }}
            >
              {EVIDENCE_PRESETS.map((ev) => {
                const selected = selectedEvidence.includes(ev.id);
                return (
                  <button
                    type="button"
                    key={ev.id}
                    onClick={() => toggleEvidence(ev.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 14px',
                      border: `1px solid ${selected ? '#00B4D8' : 'rgba(255,255,255,0.12)'}`,
                      background: selected ? 'rgba(0,180,216,0.08)' : 'var(--bg-surface, #0E0E0E)',
                      color: selected ? '#FFFFFF' : '#A0A0A0',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontFamily: 'Noto Sans, sans-serif',
                      fontWeight: 500,
                      cursor: 'pointer',
                      transition: 'all 150ms',
                      textAlign: 'left',
                    }}
                  >
                    <span style={{ fontSize: '16px' }}>{ev.emoji}</span>
                    <span>{ev.label}</span>
                    {selected && (
                      <span style={{ marginLeft: 'auto', color: '#00B4D8', fontSize: '14px' }}>✓</span>
                    )}
                  </button>
                );
              })}
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <button
                onClick={() => goBack('story')}
                style={{
                  padding: '8px 14px',
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: '6px',
                  color: '#A0A0A0',
                  fontFamily: 'Barlow, sans-serif',
                  fontWeight: 600,
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                ← Back
              </button>
              <button
                onClick={advanceToDetails}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '10px 20px',
                  background: '#00B4D8',
                  border: 'none',
                  borderRadius: '6px',
                  color: '#000',
                  fontFamily: 'Barlow, sans-serif',
                  fontWeight: 700,
                  fontSize: '13px',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                }}
              >
                {selectedEvidence.length === 0 ? 'Skip' : 'Continue'}
                {selectedEvidence.length === 0 ? <SkipForward size={14} /> : <ArrowRight size={14} />}
              </button>
            </div>
          </motion.div>
        )}

        {/* ── STEP 3: Details ──────────────────────────────────── */}
        {step === 'details' && (
          <motion.div key="details" {...stepAnim}>
            <p
              style={{
                margin: '0 0 4px',
                fontFamily: 'Barlow, sans-serif',
                fontWeight: 600,
                fontSize: '11px',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: '#00B4D8',
              }}
            >
              Step 3 of 4
            </p>
            <h2
              style={{
                margin: '0 0 6px',
                fontFamily: 'Barlow, sans-serif',
                fontWeight: 700,
                fontSize: '22px',
                color: '#FFFFFF',
              }}
            >
              A few more details
            </h2>
            <p
              style={{
                margin: '0 0 24px',
                fontSize: '14px',
                color: '#A0A0A0',
                lineHeight: 1.6,
              }}
            >
              These help us check filing deadlines and jurisdiction. Skip if you&apos;re not sure.
            </p>

            <div style={{ display: 'grid', gap: '16px', marginBottom: '24px' }}>
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '12px',
                    color: '#A0A0A0',
                    fontFamily: 'Barlow, sans-serif',
                    fontWeight: 600,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    marginBottom: '6px',
                  }}
                >
                  How much money is involved? (optional)
                </label>
                <div style={{ position: 'relative' }}>
                  <span
                    style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#666',
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: '14px',
                    }}
                  >
                    ₹
                  </span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="32,000"
                    style={{
                      width: '100%',
                      background: 'var(--bg-surface, #0E0E0E)',
                      border: '1px solid var(--border, rgba(255,255,255,0.1))',
                      borderRadius: '6px',
                      padding: '12px 12px 12px 28px',
                      color: '#FFF',
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: '16px',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '12px',
                    color: '#A0A0A0',
                    fontFamily: 'Barlow, sans-serif',
                    fontWeight: 600,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    marginBottom: '6px',
                  }}
                >
                  When did this happen? (optional)
                </label>
                <input
                  type="date"
                  value={incidentDate}
                  onChange={(e) => setIncidentDate(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'var(--bg-surface, #0E0E0E)',
                    border: '1px solid var(--border, rgba(255,255,255,0.1))',
                    borderRadius: '6px',
                    padding: '12px',
                    color: '#FFF',
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '16px',
                    outline: 'none',
                    colorScheme: 'dark',
                  }}
                />
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <button
                onClick={() => goBack('evidence')}
                style={{
                  padding: '8px 14px',
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: '6px',
                  color: '#A0A0A0',
                  fontFamily: 'Barlow, sans-serif',
                  fontWeight: 600,
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                ← Back
              </button>
              <button
                onClick={advanceToReview}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '10px 20px',
                  background: '#00B4D8',
                  border: 'none',
                  borderRadius: '6px',
                  color: '#000',
                  fontFamily: 'Barlow, sans-serif',
                  fontWeight: 700,
                  fontSize: '13px',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                }}
              >
                {!amount && !incidentDate ? 'Skip' : 'Continue'}
                {!amount && !incidentDate ? <SkipForward size={14} /> : <ArrowRight size={14} />}
              </button>
            </div>
          </motion.div>
        )}

        {/* ── STEP 4: Review & Submit ─────────────────────────── */}
        {step === 'review' && (
          <motion.div key="review" {...stepAnim}>
            <p
              style={{
                margin: '0 0 4px',
                fontFamily: 'Barlow, sans-serif',
                fontWeight: 600,
                fontSize: '11px',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: '#00B4D8',
              }}
            >
              Step 4 of 4
            </p>
            <h2
              style={{
                margin: '0 0 6px',
                fontFamily: 'Barlow, sans-serif',
                fontWeight: 700,
                fontSize: '22px',
                color: '#FFFFFF',
              }}
            >
              Review your case
            </h2>
            <p
              style={{
                margin: '0 0 20px',
                fontSize: '14px',
                color: '#A0A0A0',
                lineHeight: 1.6,
              }}
            >
              Make sure everything looks right. We&apos;ll generate your legal documents next.
            </p>

            {/* Summary card */}
            <div
              style={{
                background: 'var(--bg-surface, #0E0E0E)',
                border: '1px solid var(--border, rgba(255,255,255,0.1))',
                borderRadius: '6px',
                padding: '20px',
                marginBottom: '16px',
              }}
            >
              {/* Story */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '10px', fontFamily: 'Barlow, sans-serif', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#666' }}>
                    Your Story
                  </span>
                  <button
                    onClick={() => goBack('story')}
                    style={{ background: 'none', border: 'none', color: '#00B4D8', fontSize: '11px', fontFamily: 'Barlow, sans-serif', fontWeight: 600, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.08em' }}
                  >
                    Edit
                  </button>
                </div>
                <p style={{ margin: 0, color: '#D4D4D4', fontSize: '14px', lineHeight: 1.6 }}>
                  {inputText.length > 200 ? `${inputText.slice(0, 200)}...` : inputText}
                </p>
                {detectedLang !== 'en' && (
                  <div style={{ marginTop: '6px' }}>
                    <LanguageBadge locale={detectedLang} />
                  </div>
                )}
              </div>

              {/* Evidence */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '10px', fontFamily: 'Barlow, sans-serif', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#666' }}>
                    Evidence
                  </span>
                  <button
                    onClick={() => goBack('evidence')}
                    style={{ background: 'none', border: 'none', color: '#00B4D8', fontSize: '11px', fontFamily: 'Barlow, sans-serif', fontWeight: 600, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.08em' }}
                  >
                    Edit
                  </button>
                </div>
                {selectedEvidence.length > 0 ? (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {selectedEvidence.map((id) => {
                      const preset = EVIDENCE_PRESETS.find((e) => e.id === id);
                      return (
                        <span
                          key={id}
                          style={{
                            padding: '4px 10px',
                            background: 'rgba(0,180,216,0.08)',
                            border: '1px solid rgba(0,180,216,0.2)',
                            borderRadius: '4px',
                            fontSize: '12px',
                            color: '#00B4D8',
                          }}
                        >
                          {preset?.emoji} {preset?.label ?? id}
                        </span>
                      );
                    })}
                  </div>
                ) : (
                  <p style={{ margin: 0, color: '#666', fontSize: '13px', fontStyle: 'italic' }}>
                    No evidence selected
                  </p>
                )}
              </div>

              {/* Details */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '10px', fontFamily: 'Barlow, sans-serif', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#666' }}>
                    Details
                  </span>
                  <button
                    onClick={() => goBack('details')}
                    style={{ background: 'none', border: 'none', color: '#00B4D8', fontSize: '11px', fontFamily: 'Barlow, sans-serif', fontWeight: 600, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.08em' }}
                  >
                    Edit
                  </button>
                </div>
                <div style={{ display: 'flex', gap: '16px', fontSize: '13px' }}>
                  <span style={{ color: amount ? '#D4D4D4' : '#666' }}>
                    Amount: {amount ? `₹${parseInt(amount).toLocaleString('en-IN')}` : 'Not specified'}
                  </span>
                  <span style={{ color: incidentDate ? '#D4D4D4' : '#666' }}>
                    Date: {incidentDate || 'Not specified'}
                  </span>
                </div>
              </div>
            </div>

            {/* Clarifying questions from Agent 1 */}
            {clarifyingQuestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  marginBottom: '16px',
                  padding: '16px',
                  border: '1px solid rgba(245,158,11,0.25)',
                  borderRadius: '6px',
                  background: 'rgba(245,158,11,0.04)',
                }}
              >
                <p
                  style={{
                    margin: '0 0 12px',
                    color: '#F59E0B',
                    fontFamily: 'Barlow, sans-serif',
                    fontWeight: 600,
                    fontSize: '13px',
                  }}
                >
                  We need a bit more clarity:
                </p>
                {clarifyingQuestions.map((q, i) => (
                  <div key={i} style={{ marginBottom: '12px' }}>
                    <p style={{ color: '#FFFFFF', fontSize: '14px', marginBottom: '6px' }}>{q}</p>
                    <input
                      value={clarifyingAnswers[i] ?? ''}
                      onChange={(e) => {
                        const updated = [...clarifyingAnswers];
                        updated[i] = e.target.value;
                        setClarifyingAnswers(updated);
                      }}
                      style={{
                        width: '100%',
                        background: 'var(--bg-surface, #0E0E0E)',
                        border: '1px solid var(--border, rgba(255,255,255,0.1))',
                        borderRadius: '6px',
                        padding: '10px 12px',
                        color: '#FFF',
                        fontFamily: 'Noto Sans, sans-serif',
                        fontSize: '14px',
                        outline: 'none',
                      }}
                    />
                  </div>
                ))}
              </motion.div>
            )}

            {/* Action buttons */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <button
                onClick={() => goBack('details')}
                style={{
                  padding: '8px 14px',
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: '6px',
                  color: '#A0A0A0',
                  fontFamily: 'Barlow, sans-serif',
                  fontWeight: 600,
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                ← Back
              </button>
              <button
                onClick={() => void handleSubmit()}
                disabled={isSubmitting}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 28px',
                  background: isSubmitting ? 'rgba(0,180,216,0.3)' : '#00B4D8',
                  border: 'none',
                  borderRadius: '6px',
                  color: isSubmitting ? '#666' : '#000',
                  fontFamily: 'Barlow, sans-serif',
                  fontWeight: 700,
                  fontSize: '14px',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  transition: 'all 200ms',
                }}
              >
                {isSubmitting ? (
                  'Analysing...'
                ) : (
                  <>
                    Analyse My Case <Send size={14} />
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
