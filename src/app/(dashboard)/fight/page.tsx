'use client';

import { useSearchParams } from 'next/navigation';
import IntakeForm from '@/components/fight/IntakeForm';
import { useDisputeStore } from '@/store/disputeStore';
import { useEffect, Suspense } from 'react';
import { useUIStore } from '@/store/uiStore';

function FightPageInner() {
  const searchParams = useSearchParams();
  const isDemo = searchParams.get('demo') === '1';
  const { setDemoMode } = useUIStore();
  const { reset } = useDisputeStore();

  useEffect(() => {
    reset();
    setDemoMode(isDemo);
  }, [isDemo, reset, setDemoMode]);

  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', paddingTop: '24px' }}>
      <div style={{ marginBottom: '32px', textAlign: 'center' }}>
        <p
          style={{
            fontFamily: 'Barlow, sans-serif',
            fontWeight: 600,
            fontSize: '11px',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: '#00B4D8',
            marginBottom: '8px',
          }}
        >
          NYAY FIGHT
        </p>
        <h1
          style={{
            fontFamily: 'Barlow, sans-serif',
            fontWeight: 700,
            fontSize: '28px',
            color: '#FFFFFF',
            margin: '0 0 8px',
          }}
        >
          Let&apos;s build your case
        </h1>
        <p
          style={{
            fontFamily: 'Noto Sans, sans-serif',
            fontSize: '15px',
            color: '#A0A0A0',
            lineHeight: '1.6',
            margin: 0,
          }}
        >
          Hindi, Tamil, Telugu, Kannada, or English. Your legal notice will be ready in minutes.
        </p>
      </div>
      <IntakeForm isDemo={isDemo} />
    </div>
  );
}

export default function FightPage() {
  return (
    <Suspense
      fallback={
        <div style={{ color: '#A0A0A0', padding: '48px', textAlign: 'center' }}>
          Loading...
        </div>
      }
    >
      <FightPageInner />
    </Suspense>
  );
}
