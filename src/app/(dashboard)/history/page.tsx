'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import LoadingSkeleton from '@/components/shared/LoadingSkeleton';
import EmptyState from '@/components/shared/EmptyState';
import { DisputeRecord } from '@/types';

interface HistoryResponse {
  rows: Array<{ id: string; createdAt: string; originalInput: string; disputeRecord: string; successProbability: number | null; status: string }>;
  page: number;
  totalPages: number;
}

const CATEGORY_COLOR: Record<string, string> = {
  consumer:     'var(--accent)',
  employment:   'var(--success)',
  tenancy:      'var(--warning)',
  property:     'var(--text-secondary)',
  family:       'var(--warning)',
  contract:     'var(--accent)',
  debt_recovery:'var(--danger)',
  harassment:   'var(--danger)',
};

const STATUS_COLOR: Record<string, string> = {
  intake:    'var(--accent)',
  analyse:   'var(--warning)',
  generated: 'var(--success)',
  reviewed:  'var(--success)',
};

export default function HistoryPage() {
  const [data, setData] = useState<HistoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/history?page=${page}`);
        const body = (await res.json()) as HistoryResponse;
        if (res.ok) setData(body);
      } finally {
        setLoading(false);
      }
    };
    void run();
  }, [page]);

  const rows = useMemo(() => (data?.rows ?? []).map(row => {
    let category = 'consumer';
    try { category = (JSON.parse(row.disputeRecord) as DisputeRecord).disputeCategory; } catch { /* */ }
    return { ...row, category };
  }), [data?.rows]);

  if (loading) return <LoadingSkeleton lines={8} />;

  if (!data || rows.length === 0) {
    return (
      <EmptyState
        title="No Cases Yet"
        description="Your dispute history will appear here after you run Nyay Fight."
        action={
          <Link href="/fight" className="btn btn-primary" style={{ textDecoration: 'none' }}>
            Start Case <ArrowRight size={13} />
          </Link>
        }
      />
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gap: 'var(--space-3)' }}>
      <h1 style={{ margin: 0, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, color: 'var(--text-primary)' }}>
        Case History
      </h1>

      {rows.map((row, i) => {
        const catColor = CATEGORY_COLOR[row.category] ?? 'var(--text-secondary)';
        const stColor  = STATUS_COLOR[row.status] ?? 'var(--text-muted)';
        return (
          <motion.article key={row.id}
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              padding: 'var(--space-4)',
              display: 'grid',
              gap: 'var(--space-2)',
            }}
          >
            {/* Top row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
              <span className="badge" style={{ background: 'transparent', border: `1px solid ${catColor}`, color: catColor }}>
                {row.category.replace('_', ' ')}
              </span>
              <span className="badge badge-ghost" style={{ color: stColor, borderColor: stColor }}>
                {row.status}
              </span>
              <span style={{ marginLeft: 'auto', color: 'var(--text-muted)', fontSize: 11, fontFamily: 'var(--font-mono)' }}>
                {new Date(row.createdAt).toLocaleDateString('en-IN')}
              </span>
            </div>

            {/* Excerpt */}
            <p style={{ margin: 0, color: 'var(--text-primary)', fontSize: 13, lineHeight: 1.6 }}>
              {row.originalInput.slice(0, 160)}{row.originalInput.length > 160 ? '…' : ''}
            </p>

            {/* Bottom row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
              <Link href={`/fight/${row.id}`} className="btn btn-ghost btn-sm" style={{ textDecoration: 'none' }}>
                View Case <ArrowRight size={11} />
              </Link>
            </div>
          </motion.article>
        );
      })}

      {/* Pagination */}
      {data.totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-3)', marginTop: 'var(--space-2)' }}>
          <button className="btn btn-ghost btn-sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}>
            <ChevronLeft size={13} /> Prev
          </button>
          <span style={{ color: 'var(--text-secondary)', fontSize: 12, fontFamily: 'var(--font-mono)' }}>
            {data.page} / {data.totalPages}
          </span>
          <button className="btn btn-ghost btn-sm" onClick={() => setPage(p => Math.min(data.totalPages, p + 1))} disabled={page >= data.totalPages}>
            Next <ChevronRight size={13} />
          </button>
        </div>
      )}
    </div>
  );
}
