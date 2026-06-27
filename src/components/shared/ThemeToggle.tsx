'use client';

import { useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import { useUIStore } from '@/store/uiStore';

interface Props {
  /** Compact 28px variant for the dashboard header; default 32px for the landing nav. */
  size?: 'sm' | 'md';
}

export default function ThemeToggle({ size = 'md' }: Props) {
  const { theme, toggleTheme } = useUIStore();

  // Re-sync the DOM attribute after Zustand rehydrates from localStorage.
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const dim = size === 'sm' ? 28 : 32;
  const icon = size === 'sm' ? 13 : 14;
  const isLight = theme === 'light';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isLight ? 'Switch to dark theme' : 'Switch to light theme'}
      title={isLight ? 'Switch to dark theme' : 'Switch to light theme'}
      style={{
        width: dim,
        height: dim,
        display: 'grid',
        placeItems: 'center',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-strong)',
        borderRadius: 'var(--radius-sm)',
        color: 'var(--text-secondary)',
        cursor: 'pointer',
        transition: 'all var(--transition)',
        padding: 0,
      }}
    >
      {isLight ? <Moon size={icon} /> : <Sun size={icon} />}
    </button>
  );
}
