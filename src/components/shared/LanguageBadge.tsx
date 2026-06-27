'use client';

import { getLanguageLabel, getLanguageFlag } from '@/lib/language';

export default function LanguageBadge({ locale }: { locale: string }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '2px 8px',
        border: '1px solid rgba(0,180,216,0.4)',
        borderRadius: '2px',
        fontSize: '10px',
        fontFamily: 'Barlow, sans-serif',
        fontWeight: 600,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        color: '#00B4D8',
      }}
    >
      {getLanguageFlag(locale)} {getLanguageLabel(locale)}
    </span>
  );
}
