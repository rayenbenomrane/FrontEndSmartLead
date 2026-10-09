'use client';

import { FormEvent, useState } from 'react';
import { api } from '@/lib/api';
import { STATUS_CONFIG, STATUSES, type Prospect, type ProspectStatus } from '@/lib/constants';
import { btnPrimary, btnSecondary, ErrorBox, Field, inputClass, Modal } from '@/components/ui';

/** Create (no `prospect`) or edit a prospect. */
export default function ProspectFormModal({ businessId, prospect, onClose, onSaved }: {
  businessId: string; prospect?: Prospect; onClose: () => void; onSaved: (p: Prospect) => void;
}) {
  const [form, setForm] = useState({
    contactName: prospect?.contactName ?? '',
    companyName: prospect?.companyName ?? '',
    email: prospect?.email ?? '',
    phone: prospect?.phone ?? '',
    sector: prospect?.sector ?? '',
    source: prospect?.source ?? '',
    estimatedBudget: prospect?.estimatedBudget != null ? String(prospect.estimatedBudget) : '',
    status: (prospect?.status ?? 'NEW') as ProspectStatus,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  async function submit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const body: Record<string, unknown> = { ...form };
      body.estimatedBudget = form.estimatedBudget === '' ? (prospect ? null : undefined) : Number(form.estimatedBudget);
      // On edit, send empty optional strings so a field can be cleared.
      if (!prospect) for (const k of ['phone', 'sector', 'source']) if (body[k] === '') delete body[k];
      const saved = prospect
        ? await api<Prospect>(`businesses/${businessId}/prospects/${prospect.id}`, { method: 'PATCH', body })
        : await api<Prospect>(`businesses/${businessId}/prospects`, { method: 'POST', body });
      onSaved(saved);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal wide title={prospect ? 'Modifier le prospect' : 'Nouveau prospect'}
      subtitle="Renseignez les informations du contact et de son entreprise." onClose={onClose}>
      <form onSubmit={submit}>
        <div className="grid gap-5 px-7 py-6 sm:grid-cols-2">
          <Field label="Nom du contact *">
            <input name="contactName" required minLength={2} value={form.contactName} onChange={set} className={inputClass} placeholder="Ex : Sami Ben Ali" />
          </Field>
          <Field label="Entreprise *">
            <input name="companyName" required minLength={2} value={form.companyName} onChange={set} className={inputClass} placeholder="Ex : Délice SARL" />
          </Field>
          <Field label="Email *">
            <input type="email" name="email" required value={form.email} onChange={set} className={inputClass} placeholder="contact@delice.tn" />
          </Field>
          <Field label="Téléphone">
            <input name="phone" value={form.phone} onChange={set} className={inputClass} placeholder="+216 XX XXX XXX" />
          </Field>
          <Field label="Secteur d'activité">
            <input name="sector" value={form.sector} onChange={set} className={inputClass} placeholder="Ex : Agroalimentaire" />
          </Field>
          <Field label="Source du prospect">
            <input name="source" value={form.source} onChange={set} className={inputClass} placeholder="Ex : LinkedIn, salon, recommandation" />
          </Field>
          <Field label="Budget estimé (TND)">
            <input type="number" min={0} step="any" name="estimatedBudget" value={form.estimatedBudget} onChange={set} className={inputClass} placeholder="0" />
          </Field>
          <Field label="Statut">
            <select name="status" value={form.status} onChange={set} className={inputClass}>
              {STATUSES.map((s) => <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>)}
            </select>
          </Field>
          <div className="sm:col-span-2"><ErrorBox message={error} /></div>
        </div>
        <div className="flex justify-end gap-3 border-t border-slate-100 bg-slate-50/50 px-7 py-4">
          <button type="button" onClick={onClose} disabled={loading} className={btnSecondary}>Annuler</button>
          <button type="submit" disabled={loading} className={btnPrimary}>
            {loading ? 'Enregistrement...' : prospect ? 'Enregistrer' : 'Ajouter le prospect'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
