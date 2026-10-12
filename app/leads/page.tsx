'use client';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import LeadForm from '../../components/LeadForm';
import ScoreBadge from '../../components/ScoreBadge';
import { api, json } from '../../lib/api';
import { Lead, STATUS_LABELS } from '../../lib/types';

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState<Lead | 'new' | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q.trim()) params.set('q', q.trim());
      if (status) params.set('status', status);
      setLeads(await api<Lead[]>(`leads?${params}`));
      setError('');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [q, status]);

  useEffect(() => {
    const t = setTimeout(load, 300); // debounce the search box
    return () => clearTimeout(t);
  }, [load]);

  async function remove(l: Lead) {
    if (!confirm(`Supprimer ${l.contactName} (${l.companyName}) ? Ses interactions seront aussi supprimées.`)) return;
    try {
      await api(`leads/${l.id}`, json('DELETE'));
      load();
    } catch (e: any) {
      setError(e.message);
    }
  }

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <h1 className="mr-auto text-xl font-semibold">Prospects</h1>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher (nom, entreprise, email…)" className="w-72 rounded-md border border-slate-300 px-3 py-2 text-sm" />
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-md border border-slate-300 px-3 py-2 text-sm">
          <option value="">Tous les statuts</option>
          {Object.entries(STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <button onClick={() => setEditing('new')} className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white">Ajouter un prospect</button>
      </div>

      {error && <p className="mb-3 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
            <tr>
              <th className="p-3 font-medium">Contact</th><th className="p-3 font-medium">Secteur</th>
              <th className="p-3 font-medium">Budget</th><th className="p-3 font-medium">Statut</th>
              <th className="p-3 font-medium">Score IA</th><th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={6} className="p-6 text-center text-slate-400">Chargement…</td></tr>}
            {!loading && leads.length === 0 && (
              <tr><td colSpan={6} className="p-8 text-center text-slate-500">
                {q || status ? 'Aucun prospect ne correspond à cette recherche.' : 'Aucun prospect pour le moment. Ajoutez le premier pour commencer.'}
              </td></tr>
            )}
            {leads.map((l) => (
              <tr key={l.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                <td className="p-3">
                  <Link href={`/leads/${l.id}`} className="font-medium text-slate-900 hover:underline">{l.contactName}</Link>
                  <div className="text-xs text-slate-500">{l.companyName} · {l.email}</div>
                </td>
                <td className="p-3 text-slate-600">{l.sector ?? '—'}</td>
                <td className="p-3 text-slate-600">{l.estimatedBudget != null ? l.estimatedBudget.toLocaleString('fr-FR') : '—'}</td>
                <td className="p-3">{STATUS_LABELS[l.status]}</td>
                <td className="p-3"><ScoreBadge score={l.score} /></td>
                <td className="whitespace-nowrap p-3 text-right">
                  <button onClick={() => setEditing(l)} className="mr-3 text-slate-600 hover:text-slate-900">Modifier</button>
                  <button onClick={() => remove(l)} className="text-red-600 hover:text-red-800">Supprimer</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <LeadForm initial={editing === 'new' ? undefined : editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); load(); }} />
      )}
    </>
  );
}
