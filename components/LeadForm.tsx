'use client';
import { useState } from 'react';
import { api, json } from '../lib/api';
import { Lead, LeadStatus, STATUS_LABELS } from '../lib/types';

const input = 'w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none';

export default function LeadForm({ initial, onSaved, onClose }: { initial?: Lead; onSaved: () => void; onClose: () => void }) {
  const [f, setF] = useState({
    contactName: initial?.contactName ?? '',
    companyName: initial?.companyName ?? '',
    email: initial?.email ?? '',
    phone: initial?.phone ?? '',
    sector: initial?.sector ?? '',
    source: initial?.source ?? '',
    estimatedBudget: initial?.estimatedBudget?.toString() ?? '',
    status: (initial?.status ?? 'NOUVEAU') as LeadStatus,
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setF({ ...f, [k]: e.target.value });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    const empty = initial ? null : undefined; // on edit, a cleared field must be sent as null
    const body = {
      contactName: f.contactName,
      companyName: f.companyName,
      email: f.email,
      phone: f.phone || empty,
      sector: f.sector || empty,
      source: f.source || empty,
      estimatedBudget: f.estimatedBudget === '' ? empty : Number(f.estimatedBudget),
      status: f.status,
    };
    try {
      await api(initial ? `leads/${initial.id}` : 'leads', json(initial ? 'PATCH' : 'POST', body));
      onSaved();
    } catch (err: any) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <form onSubmit={submit} onClick={(e) => e.stopPropagation()} className="w-full max-w-lg space-y-3 rounded-lg bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold">{initial ? 'Modifier le prospect' : 'Nouveau prospect'}</h2>
        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm">Nom du contact *<input required className={input} value={f.contactName} onChange={set('contactName')} /></label>
          <label className="text-sm">Entreprise *<input required className={input} value={f.companyName} onChange={set('companyName')} /></label>
          <label className="text-sm">Email *<input required type="email" className={input} value={f.email} onChange={set('email')} /></label>
          <label className="text-sm">Téléphone<input className={input} value={f.phone} onChange={set('phone')} /></label>
          <label className="text-sm">Secteur d'activité<input className={input} value={f.sector} onChange={set('sector')} /></label>
          <label className="text-sm">Source<input className={input} placeholder="LinkedIn, salon, recommandation…" value={f.source} onChange={set('source')} /></label>
          <label className="text-sm">Budget estimé<input type="number" min={0} className={input} value={f.estimatedBudget} onChange={set('estimatedBudget')} /></label>
          <label className="text-sm">Statut
            <select className={input} value={f.status} onChange={set('status')}>
              {Object.entries(STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </label>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="rounded-md px-4 py-2 text-sm text-slate-600 hover:bg-slate-100">Annuler</button>
          <button disabled={busy} className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white disabled:opacity-50">{busy ? 'Enregistrement…' : 'Enregistrer'}</button>
        </div>
      </form>
    </div>
  );
}
