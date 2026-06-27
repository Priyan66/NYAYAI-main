'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { LayoutDashboard, Shield, Activity, Clock, Settings, X, LogOut } from 'lucide-react';
import { useUIStore } from '@/store/uiStore';

const NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/fight',     label: 'Fight',     icon: Shield },
  { href: '/score',     label: 'Score',     icon: Activity },
  { href: '/history',   label: 'History',   icon: Clock },
  { href: '/settings',  label: 'Settings',  icon: Settings },
];

function NavList({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const email = session?.user?.email ?? 'anonymous@nyay.ai';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Logo */}
      <div style={{ padding: 'var(--space-5) var(--space-4) var(--space-4)' }}>
        <Link href="/dashboard" style={{
          color: 'var(--text-primary)', textDecoration: 'none',
          fontFamily: 'var(--font-display)', fontWeight: 700,
          letterSpacing: '0.12em', fontSize: 17, textTransform: 'uppercase',
        }}>
          NYAY.AI
        </Link>
      </div>

      {/* Nav */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 2, padding: '0 var(--space-2)' }}>
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
          return (
            <Link key={href} href={href}
              onClick={onClose}
              style={{
                height: 38, padding: '0 var(--space-3)',
                display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
                borderRadius: 'var(--radius-sm)',
                borderLeft: `2px solid ${active ? 'var(--accent)' : 'transparent'}`,
                background: active ? 'var(--accent-dim)' : 'transparent',
                color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
                textDecoration: 'none',
                fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 13,
                transition: 'all var(--transition)',
              }}
            >
              <Icon size={15} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{
        marginTop: 'auto',
        padding: 'var(--space-4)',
        borderTop: '1px solid var(--border)',
      }}>
        <p style={{
          margin: '0 0 var(--space-3)',
          color: 'var(--text-muted)', fontSize: 11,
          fontFamily: 'var(--font-mono)',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }} title={email}>
          {email}
        </p>
        <button
          onClick={() => void signOut({ callbackUrl: '/login' })}
          className="btn btn-danger btn-sm"
          style={{ width: '100%' }}
        >
          <LogOut size={13} /> Sign Out
        </button>
      </div>
    </div>
  );
}

export default function Sidebar() {
  const { isSidebarOpen, setSidebarOpen } = useUIStore();

  return (
    <>
      {/* Desktop */}
      <aside
        className="hidden md:flex md:flex-col"
        style={{
          width: 220, flexShrink: 0,
          background: 'var(--bg-secondary)',
          borderRight: '1px solid var(--border)',
          minHeight: '100vh',
        }}
      >
        <NavList />
      </aside>

      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div
          className="md:hidden"
          style={{
            position: 'fixed', inset: 0, zIndex: 100,
            background: 'var(--scrim)',
          }}
          onClick={() => setSidebarOpen(false)}
        >
          <aside
            style={{
              width: 220, height: '100%',
              background: 'var(--bg-secondary)',
              borderRight: '1px solid var(--border)',
              position: 'relative',
            }}
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setSidebarOpen(false)}
              aria-label="Close sidebar"
              style={{
                position: 'absolute', right: 8, top: 8,
                width: 30, height: 30,
                border: '1px solid var(--border-strong)',
                borderRadius: 'var(--radius-sm)',
                background: 'transparent',
                color: 'var(--text-secondary)',
                display: 'grid', placeItems: 'center', cursor: 'pointer',
              }}
            >
              <X size={14} />
            </button>
            <NavList onClose={() => setSidebarOpen(false)} />
          </aside>
        </div>
      )}
    </>
  );
}
