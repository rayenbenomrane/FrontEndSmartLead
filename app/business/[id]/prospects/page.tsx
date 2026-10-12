'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { formatMoney, STATUS_CONFIG, STATUSES, type Prospect, type ProspectStatus } from '@/lib/constants';
import { btnPrimary, ConfirmDialog, ErrorBox, inputClass, StatusBadge } from '@/components/ui';
import ProspectFormModal from './prospect-form-modal';

type Page = { data: Prospect[]; total: number; page: number; limit: number; totalPages: number };
const LIMIT = 10;

export default function ProspectsPage({ params, searchParams }: { params: { id: string }; searchParams: { status?: string } }) {
  const businessId = params.id;
  const [q, setQ] = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');
  const initialStatus = STATUSES.includes(searchParams.status as ProspectStatus) ? (searchParams.status as ProspectStatus) : '';
  const [status, setStatus] = useState<ProspectStatus | ''>(initialStatus);
  const [sort, setSort] = useState('createdAt:DESC');
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formFor, setFormFor] = useState<Prospect | 'new' | null>(null);
  const [toDelete, setToDelete] = useState<Prospect | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => { setDebouncedQ(q); setPage(1); }, 300);
    return () => clearTimeout(t);
  }, [q]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const [sortBy, order] = sort.split(':');
    const qs = new URLSearchParams({ page: String(page), limit: String(LIMIT), sortBy, order });
    if (debouncedQ.trim()) qs.set('q', debouncedQ.trim());
    if (status) qs.set('status', status);
    try {
      const r = await api<Page>(`businesses/${businessId}/prospects?${qs}`);
      // If the last item of the last page was removed, step back one page.
      if (r.data.length === 0 && r.page > 1) setPage(r.totalPages);
      else setResult(r);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [businessId, page, debouncedQ, status, sort]);

  useEffect(() => { load(); }, [load]);

  async function changeStatus(p: Prospect, next: ProspectStatus) {
    const prev = result;
    setResult((r) => r && { ...r, data: r.data.map((x) => (x.id === p.id ? { ...x, status: next } : x)) });
    try {
      await api(`businesses/${businessId}/prospects/${p.id}`, { method: 'PATCH', body: JSON.stringify({ status }) });
      if (status && status !== next) load();
    } catch (e: any) {
      setResult(prev);
      setError(e.message);
    }
  }

  async function confirmDelete() {
    if (!toDelete) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await api(`businesses/${businessId}/prospects/${toDelete.id}`, { method: 'DELETE' });
      setToDelete(null);
      load();
    } catch (e: any) {
      setDeleteError(e.message);
    } finally {
      setDeleting(false);
    }
  }

  const filtered = Boolean(debouncedQ.trim() || status);

  return (
    <div>
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Prospects</h2>
          <p className="mt-1 text-sm text-slate-500">
            {result ? `${result.total} prospect${result.total > 1 ? 's' : ''}${filtered ? ' correspondant aux filtres' : ''}` : ' '}
          </p>
        </div>
        <button onClick={() => setFormFor('new')} className={btnPrimary}><span className="text-lg leading-none">+</span> Nouveau prospect</button>
      </div>

      <div className="mb-4 grid gap-3 sm:grid-cols-[1fr_200px_200px]">
        <input value={q} onChange={(e) => setQ(e.target.value)} className={inputClass} placeholder="Rechercher (nom, entreprise, email, téléphone, secteur…)" aria-label="Rechercher" />
        <select value={status} onChange={(e) => { setStatus(e.target.value as ProspectStatus | ''); setPage(1); }} className={inputClass} aria-label="Filtrer par statut">
          <option value="">Tous les statuts</option>
          {STATUSES.map((s) => <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>)}
        </select>
        <select value={sort} onChange={(e) => { setSort(e.target.value); setPage(1); }} className={inputClass} aria-label="Trier">
          <option value="createdAt:DESC">Plus récents</option>
          <option value="createdAt:ASC">Plus anciens</option>
          <option value="contactName:ASC">Contact (A→Z)</option>
          <option value="companyName:ASC">Entreprise (A→Z)</option>
          <option value="estimatedBudget:DESC">Budget (décroissant)</option>
        </select>
      </div>

      <div className="mb-4"><ErrorBox message={error} /></div>

      <div className={`overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-opacity ${loading && result ? 'opacity-60' : ''}`}>
        {!result ? (
          <p className="px-6 py-16 text-center text-sm text-slate-500">Chargement...</p>
        ) : result.data.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <h3 className="text-lg font-semibold text-slate-900">{filtered ? 'Aucun résultat' : 'Aucun prospect'}</h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
              {filtered ? 'Aucun prospect ne correspond à votre recherche.' : 'Ajoutez votre premier prospect pour démarrer le suivi commercial.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="border-b border-slate-100 bg-slate-50/60 text-xs uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-5 py-3 font-semibold">Contact</th>
                  <th className="px-5 py-3 font-semibold">Entreprise</th>
                  <th className="px-5 py-3 font-semibold">Secteur</th>
                  <th className="px-5 py-3 font-semibold">Budget</th>
                  <th className="px-5 py-3 font-semibold">Statut</th>
                  <th className="px-5 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {result.data.map((p) => (
                  <tr key={p.id} className="transition hover:bg-slate-50/60">
                    <td className="px-5 py-3.5">
                      <Link href={`/business/${businessId}/prospects/${p.id}`} className="font-semibold text-slate-900 hover:text-indigo-600">{p.company}</Link>
                      <p className="text-xs text-slate-500">{p.email}</p>
                    </td>
                    <td className="px-5 py-3.5 text-slate-700">{p.company}</td>
                    <td className="px-5 py-3.5 text-slate-500">{p.region || '—'}</td>
                    <td className="px-5 py-3.5 text-slate-700">{formatMoney(p.estimatedValue)}</td>
                    <td className="px-5 py-3.5">
                      <select value={p.status} onChange={(e) => changeStatus(p, e.target.value as ProspectStatus)} aria-label="Changer le statut"
                        className={`cursor-pointer rounded-full border-0 py-1 pl-2.5 pr-7 text-xs font-semibold ring-1 ring-inset focus:ring-2 ${STATUS_CONFIG[p.status].badge}`}>
                        {STATUSES.map((s) => <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>)}
                      </select>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="inline-flex gap-1">
                        <Link href={`/business/${businessId}/prospects/${p.id}`} className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100">Voir</Link>
                        <button onClick={() => setFormFor(p)} className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-indigo-600 hover:bg-indigo-50">Modifier</button>
                        <button onClick={() => { setDeleteError(null); setToDelete(p); }} className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50">Supprimer</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {result && result.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3 text-sm text-slate-500">
            <span>Page {result.page} sur {result.totalPages}</span>
            <div className="flex gap-2">
              <button disabled={result.page <= 1} onClick={() => setPage(result.page - 1)} className="rounded-lg border border-slate-200 px-3 py-1.5 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40">Précédent</button>
              <button disabled={result.page >= result.totalPages} onClick={() => setPage(result.page + 1)} className="rounded-lg border border-slate-200 px-3 py-1.5 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40">Suivant</button>
            </div>
          </div>
        )}
      </div>

      {formFor && (
        <ProspectFormModal businessId={businessId} prospect={formFor === 'new' ? undefined : formFor}
          onClose={() => setFormFor(null)} onSaved={() => { setFormFor(null); load(); }} />
      )}
      {toDelete && (
        <ConfirmDialog title="Supprimer ce prospect ?" loading={deleting} error={deleteError} onConfirm={confirmDelete} onClose={() => setToDelete(null)}
          message={<>Le prospect <strong>{toDelete.company}</strong> ({toDelete.company}) et toutes ses interactions seront définitivement supprimés.</>} />
      )}
    </div>
  );
}
