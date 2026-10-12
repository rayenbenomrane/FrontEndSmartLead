'use client';

import Link from 'next/link';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { aiApi, dashboardApi } from '@/lib/api';
import { DashboardStats, PriorityItem, STATUS_LABEL } from '@/lib/ai-types';
import ScoreBadge from '@/components/ai/ScoreBadge';

const fmt = (n: number) => new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(n);

function Card({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
      {hint && <p className="text-xs text-gray-400">{hint}</p>}
    </div>
  );
}

function Dashboard() {
  // ?businessId=... pour filtrer sur une entreprise (et afficher les priorités IA)
  const businessId = useSearchParams().get('businessId') ?? undefined;
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [prio, setPrio] = useState<PriorityItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [rescoring, setRescoring] = useState(false);

  const load = async () => {
    try {
      setStats(await dashboardApi.stats(businessId));
      if (businessId) setPrio(await aiApi.priorities(businessId, 10));
    } catch (e) { setError((e as Error).message); }
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [businessId]);

  async function rescore() {
    if (!businessId) return;
    setRescoring(true);
    try { await aiApi.scoreAll(businessId); await load(); } catch (e) { setError((e as Error).message); }
    setRescoring(false);
  }

  if (error) return <p className="p-6 text-red-600">{error}</p>;
  if (!stats) return <p className="p-6 text-gray-500">Chargement…</p>;
  const max = Math.max(1, ...stats.byStatus.map((s) => s.count));

  return (
    <main className="mx-auto max-w-6xl space-y-6 p-6">
      <h1 className="text-2xl font-bold">Tableau de bord</h1>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card label="Prospects" value={stats.total} />
        <Card label="Pipeline" value={`${fmt(stats.pipelineValue)}`} hint="valeur des prospects actifs" />
        <Card label="Taux de conversion" value={stats.conversionRate === null ? '—' : `${stats.conversionRate}%`} hint="gagnés / (gagnés + perdus)" />
        <Card label="Score moyen" value={stats.averageScore ?? '—'} />
        <Card label="Prospects chauds" value={stats.hotProspects} hint="score ≥ 70" />
        <Card label="Relances à faire" value={stats.followUpsDue} hint="sans contact depuis 7 jours" />
        <Card label="CA gagné" value={fmt(stats.wonValue)} />
      </div>

      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 font-semibold">Répartition par statut</h2>
        <div className="space-y-2">
          {stats.byStatus.map((s) => (
            <div key={s.status} className="flex items-center gap-3 text-sm">
              <span className="w-40 text-gray-600">{STATUS_LABEL[s.status] ?? s.status}</span>
              <div className="h-3 flex-1 rounded bg-gray-100"><div className="h-3 rounded bg-indigo-500" style={{ width: `${(s.count / max) * 100}%` }} /></div>
              <span className="w-8 text-right font-medium">{s.count}</span>
            </div>
          ))}
        </div>
      </section>

      {businessId ? (
        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold">Prospects à traiter en priorité</h2>
            <button onClick={rescore} disabled={rescoring} className="text-sm text-indigo-600 hover:underline disabled:opacity-50">
              {rescoring ? 'Recalcul…' : 'Recalculer les scores'}
            </button>
          </div>
          {prio.length === 0 ? (
            <p className="text-sm text-gray-500">Aucun prospect évalué. Cliquez sur « Recalculer les scores ».</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {prio.map((p) => (
                <li key={p.id} className="flex items-center justify-between py-2 text-sm">
                  {/* adaptez l'URL à votre route de détail prospect */}
                  <Link href={`/prospects/${p.id}`} className="hover:underline">
                    <span className="font-medium">{p.firstName} {p.lastName}</span>
                    <span className="text-gray-500"> · {p.company} · {STATUS_LABEL[p.status] ?? p.status}</span>
                  </Link>
                  <ScoreBadge score={p.score} />
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : (
        <p className="text-sm text-gray-500">Ajoutez <code>?businessId=…</code> à l'URL pour filtrer par entreprise et voir les priorités IA.</p>
      )}
    </main>
  );
}

export default function DashboardPage() {
  return <Suspense fallback={<p className="p-6 text-gray-500">Chargement…</p>}><Dashboard /></Suspense>;
}
