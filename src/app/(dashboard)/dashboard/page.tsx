'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Shield, Activity, Clock, ArrowRight, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import LoadingSkeleton from '@/components/shared/LoadingSkeleton';

interface DashboardSummary {
  totalDisputes: number;
  activeCases: number;
  recentDisputes: Array<{ id: string; status: string; originalInput: string; createdAt: string }>;
  latestScore: { totalScore: number; createdAt: string } | null;
  user: { name: string | null; email: string | null; language: string };
}

const STATUS_COLOR: Record<string, string> = {
  intake:    'var(--accent)',
  analyse:   'var(--warning)',
  generated: 'var(--success)',
  reviewed:  'var(--success)',
};

function StatusDot({ status }: { status: string }) {
  const color = STATUS_COLOR[status] ?? 'var(--text-muted)';
  return (
    <span style={{
      display: 'inline-block', width: 6, height: 6,
      borderRadius: '50%', background: color, flexShrink: 0,
    }} />
  );
}

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch('/api/dashboard/summary');
        const data = (await res.json()) as DashboardSummary;
        if (res.ok) setSummary(data);
      } finally {
        setLoading(false);
      }
    };
    void run();
  }, []);

  if (loading) return <div style={{ maxWidth: 1000, margin: '0 auto' }}><LoadingSkeleton lines={8} /></div>;

  const name = summary?.user.name ?? 'there';
  const lang = summary?.user.language ?? 'en';
  const greeting = lang === 'hi' ? `नमस्ते, ${name}` : `Hello, ${name}`;

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', display: 'grid', gap: 'var(--space-5)' }}>

      {/* Greeting */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <h1 style={{
          margin: 0, fontFamily: 'var(--font-display)', fontWeight: 700,
          fontSize: 28, color: 'var(--text-primary)',
        }}>
          {greeting}
        </h1>
        <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)', fontSize: 14 }}>
          Your legal command centre.
        </p>
      </motion.div>

      {/* Stat row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 'var(--space-3)' }}>
        {[
          { label: 'Total Cases',   value: summary?.totalDisputes ?? 0, color: 'var(--accent)' },
          { label: 'Active Cases',  value: summary?.activeCases ?? 0,   color: 'var(--warning)' },
          { label: 'Nyay Score',    value: summary?.latestScore?.totalScore ?? '—', color: 'var(--success)' },
        ].map((stat, i) => (
          <motion.div key={stat.label}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i, duration: 0.3 }}
            className="card"
          >
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: 11, fontFamily: 'var(--font-display)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              {stat.label}
            </p>
            <p style={{ margin: '8px 0 0', color: stat.color, fontSize: 32, fontFamily: 'var(--font-mono)', fontWeight: 500, lineHeight: 1 }}>
              {stat.value}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Action cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'var(--space-4)' }}>
        {/* Fight card */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.35 }}
          style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            padding: 'var(--space-5)',
            display: 'flex', flexDirection: 'column', gap: 'var(--space-3)',
            transition: 'border-color var(--transition)',
          }}
          whileHover={{ borderColor: 'var(--border-hover)' } as never}
        >
          <div style={{
            width: 38, height: 38, borderRadius: 'var(--radius-sm)',
            background: 'var(--accent-dim)', border: '1px solid rgba(0,180,216,0.2)',
            display: 'grid', placeItems: 'center',
          }}>
            <Shield size={18} color="var(--accent)" />
          </div>
          <div>
            <p className="eyebrow" style={{ margin: '0 0 4px' }}>Court Pipeline</p>
            <h2 style={{ margin: 0, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, color: 'var(--text-primary)' }}>
              Nyay Fight
            </h2>
            <p style={{ margin: '6px 0 0', color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.6 }}>
              Turn your story into a court-ready case file in under 8 minutes.
            </p>
          </div>
          <Link href="/fight" className="btn btn-primary" style={{ marginTop: 'auto', textDecoration: 'none', width: 'fit-content' }}>
            Start Case <ArrowRight size={13} />
          </Link>
        </motion.div>

        {/* Score card */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.35 }}
          style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            padding: 'var(--space-5)',
            display: 'flex', flexDirection: 'column', gap: 'var(--space-3)',
            transition: 'border-color var(--transition)',
          }}
          whileHover={{ borderColor: 'var(--border-hover)' } as never}
        >
          <div style={{
            width: 38, height: 38, borderRadius: 'var(--radius-sm)',
            background: 'var(--success-dim)', border: '1px solid var(--success-border)',
            display: 'grid', placeItems: 'center',
          }}>
            <Activity size={18} color="var(--success)" />
          </div>
          <div>
            <p className="eyebrow" style={{ margin: '0 0 4px', color: 'var(--success)' }}>Preventive Layer</p>
            <h2 style={{ margin: 0, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, color: 'var(--text-primary)' }}>
              Nyay Score
            </h2>
            <p style={{ margin: '6px 0 0', color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.6 }}>
              {summary?.latestScore
                ? `Last score: ${summary.latestScore.totalScore} · ${new Date(summary.latestScore.createdAt).toLocaleDateString('en-IN')}`
                : 'Map your legal vulnerability before a dispute becomes expensive.'}
            </p>
          </div>
          <Link href="/score" className="btn btn-ghost" style={{ marginTop: 'auto', textDecoration: 'none', width: 'fit-content' }}>
            {summary?.latestScore ? 'View Score' : 'Check Score'} <ArrowRight size={13} />
          </Link>
        </motion.div>
      </div>

      {/* Recent activity */}
      <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2, duration: 0.4 }}
        className="card"
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <Clock size={14} color="var(--text-secondary)" />
            <h3 style={{ margin: 0, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Recent Activity
            </h3>
          </div>
          <Link href="/history" style={{ color: 'var(--accent)', fontSize: 11, fontFamily: 'var(--font-display)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', textDecoration: 'none' }}>
            View All
          </Link>
        </div>

        <div style={{ display: 'grid', gap: 'var(--space-2)' }}>
          {(summary?.recentDisputes ?? []).length === 0 ? (
            <div style={{ textAlign: 'center', padding: 'var(--space-8) 0' }}>
              <Zap size={24} color="var(--text-ghost)" style={{ margin: '0 auto var(--space-3)' }} />
              <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: 13 }}>No cases yet. Start your first dispute above.</p>
            </div>
          ) : (
            (summary?.recentDisputes ?? []).map(d => (
              <Link key={d.id} href={`/fight/${d.id}`} style={{
                textDecoration: 'none',
                display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
                padding: 'var(--space-3) var(--space-3)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border)',
                background: 'var(--bg-surface)',
                transition: 'border-color var(--transition)',
              }}>
                <StatusDot status={d.status} />
                <p style={{ margin: 0, flex: 1, fontSize: 13, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {d.originalInput.slice(0, 100)}
                </p>
                <span style={{ color: 'var(--text-muted)', fontSize: 11, fontFamily: 'var(--font-mono)', flexShrink: 0 }}>
                  {new Date(d.createdAt).toLocaleDateString('en-IN')}
                </span>
                <ArrowRight size={12} color="var(--text-muted)" />
              </Link>
            ))
          )}
        </div>
      </motion.section>
    </div>
  );
}
