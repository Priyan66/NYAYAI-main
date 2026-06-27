'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global error:', error);
  }, [error]);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#000',
        display: 'grid',
        placeItems: 'center',
        padding: '24px',
      }}
    >
      <div
        style={{
          maxWidth: '480px',
          textAlign: 'center',
          padding: '40px',
          background: '#080808',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          borderRadius: '8px',
        }}
      >
        <div
          style={{
            width: '56px',
            height: '56px',
            margin: '0 auto 20px',
            borderRadius: '14px',
            background: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            display: 'grid',
            placeItems: 'center',
            fontSize: '24px',
          }}
        >
          ⚠
        </div>
        <h1
          style={{
            margin: '0 0 8px',
            fontFamily: 'Barlow, sans-serif',
            fontWeight: 700,
            fontSize: '22px',
            color: '#FFFFFF',
          }}
        >
          Something went wrong
        </h1>
        <p
          style={{
            margin: '0 0 24px',
            color: '#A0A0A0',
            fontSize: '15px',
            lineHeight: 1.6,
          }}
        >
          An unexpected error occurred. Your case data is safe and no information was lost.
        </p>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <button
            onClick={reset}
            style={{
              padding: '12px 24px',
              background: '#00B4D8',
              border: 'none',
              borderRadius: '6px',
              color: '#000',
              fontFamily: 'Barlow, sans-serif',
              fontWeight: 700,
              fontSize: '14px',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              cursor: 'pointer',
            }}
          >
            Try Again
          </button>
          <button
            onClick={() => (window.location.href = '/')}
            style={{
              padding: '12px 24px',
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '6px',
              color: '#A0A0A0',
              fontFamily: 'Barlow, sans-serif',
              fontWeight: 600,
              fontSize: '14px',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              cursor: 'pointer',
            }}
          >
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
}
