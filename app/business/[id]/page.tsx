'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { formatMoney, STATUS_CONFIG, STATUSES, type ProspectStatus } from '@/lib/constants';
import { ErrorBox } from '@/components/ui';

type Stats = { total: number; byStatus: Record<ProspectStatus, { count: number; budget: number }> };

export default function OverviewPage({ params }: { params: { id: string } }) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api<Stats>(`businesses/${params.id}/prospects/stats`).then(setStats).catch((e) => setError(e.message));
  }, [params.id]);

  if (error) return <ErrorBox message={error} />;
  if (!stats) return <p className="text-sm text-slate-500">Chargement...</p>;

  const pipelineBudget = STATUSES.filter((s) => s !== 'WON' && s !== 'LOST').reduce((a, s) => a + stats.byStatus[s].budget, 0);
  const closed = stats.byStatus.WON.count + stats.byStatus.LOST.count;
  const winRate = closed ? Math.round((stats.byStatus.WON.count / closed) * 100) : null;

  const kpis = [
    { label: 'Prospects', value: String(stats.total) },
    { label: 'Budget en cours', value: formatMoney(pipelineBudget) },
    { label: 'Budget gagné', value: formatMoney(stats.byStatus.WON.budget) },
    { label: 'Taux de réussite', value: winRate === null ? '—' : `${winRate}%` },
  ];

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{k.label}</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{k.value}</p>
          </div>
        ))}
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Pipeline commercial</h2>
          <Link href={`/business/${params.id}/prospects`} className="text-sm font-semibold text-indigo-600 hover:text-indigo-700">Voir les prospects →</Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {STATUSES.map((s) => (
            <Link key={s} href={`/business/${params.id}/prospects?status=${s}`}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${STATUS_CONFIG[s].dot}`} />
                <p className="text-sm font-semibold text-slate-700">{STATUS_CONFIG[s].label}</p>
              </div>
              <p className="mt-3 text-3xl font-bold text-slate-900">{stats.byStatus[s].count}</p>
              <p className="mt-1 text-xs text-slate-500">{formatMoney(stats.byStatus[s].budget)}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
