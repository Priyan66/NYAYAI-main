'use client';

import { Menu } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useUIStore } from '@/store/uiStore';
import { useState } from 'react';
import toast from 'react-hot-toast';
import ThemeToggle from '@/components/shared/ThemeToggle';

const ROUTE_TITLE: Record<string, string> = {
  '/fight':    'Nyay Fight',
  '/score':    'Legal Health Score',
  '/history':  'Case History',
  '/settings': 'Settings',
};

function routeTitle(path: string): string {
  for (const [prefix, title] of Object.entries(ROUTE_TITLE)) {
    if (path.startsWith(prefix)) return title;
  }
  return 'Dashboard';
}

const LANGUAGES = [
  { value: 'en', label: 'EN' },
  { value: 'hi', label: 'हिं' },
  { value: 'ta', label: 'த' },
  { value: 'te', label: 'తె' },
  { value: 'kn', label: 'ಕ' },
];

export default function Header() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { setSidebarOpen, isDemoMode } = useUIStore();
  const [language, setLanguage] = useState('en');

  const initials = (session?.user?.name ?? 'U')
    .split(' ').map(s => s[0]?.toUpperCase() ?? '').slice(0, 2).join('');

  const saveLanguage = async (lang: string) => {
    setLanguage(lang);
    try {
      const res = await fetch('/api/settings/language', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language: lang }),
      });
      if (!res.ok) throw new Error();
      toast.success('Language updated');
    } catch {
      toast.error('Failed to save language');
    }
  };

  return (
    <header style={{
      height: 52,
      borderBottom: '1px solid var(--border)',
      position: 'sticky', top: 0, zIndex: 40,
      background: 'var(--header-bg)',
      backdropFilter: 'blur(8px)',
    }}>
      <div style={{
        height: '100%',
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr',
        alignItems: 'center',
        padding: '0 var(--space-4)',
      }}>
        {/* Left */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <button
            className="md:hidden btn btn-ghost btn-sm"
            onClick={() => setSidebarOpen(true)}
            style={{ width: 32, height: 32, padding: 0 }}
            aria-label="Open sidebar"
          >
            <Menu size={15} />
          </button>
        </div>

        {/* Centre — route title */}
        <p style={{
          margin: 0,
          fontFamily: 'var(--font-display)',
          fontWeight: 700, fontSize: 12,
          letterSpacing: '0.18em', textTransform: 'uppercase',
          color: 'var(--text-primary)',
          justifySelf: 'center', whiteSpace: 'nowrap',
        }}>
          {routeTitle(pathname)}
        </p>

        {/* Right */}
        <div style={{ display: 'flex', justifySelf: 'end', alignItems: 'center', gap: 'var(--space-2)' }}>
          {isDemoMode && (
            <span className="badge badge-danger">Demo</span>
          )}

          <ThemeToggle size="sm" />

          <select
            value={language}
            onChange={e => void saveLanguage(e.target.value)}
            aria-label="Language"
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-strong)',
              color: 'var(--text-primary)',
              borderRadius: 'var(--radius-sm)',
              height: 28, padding: '0 6px',
              fontFamily: 'var(--font-display)',
              fontSize: 11, cursor: 'pointer',
            }}
          >
            {LANGUAGES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
          </select>

          <div
            title={session?.user?.name ?? 'User'}
            style={{
              width: 30, height: 30, borderRadius: '50%',
              border: '1px solid var(--border-hover)',
              background: 'var(--accent-dim)',
              color: 'var(--accent)',
              fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 11,
              display: 'grid', placeItems: 'center',
            }}
          >
            {initials || 'U'}
          </div>
        </div>
      </div>
    </header>
  );
}
