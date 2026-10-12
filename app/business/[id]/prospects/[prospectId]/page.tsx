'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import {
  formatDate, formatMoney, INTERACTION_CONFIG, STATUS_CONFIG, STATUSES,
  type Interaction, type InteractionType, type Prospect, type ProspectStatus,
} from '@/lib/constants';
import { btnPrimary, btnSecondary, ConfirmDialog, ErrorBox, Field, inputClass, Modal, StatusBadge } from '@/components/ui';
import ProspectFormModal from '../prospect-form-modal';
import AiPanel from '@/components/AiPanel';

const toLocalInput = (iso?: string) => {
  const d = iso ? new Date(iso) : new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
};

function InteractionModal({ base, interaction, onClose, onSaved }: {
  base: string; interaction?: Interaction; onClose: () => void; onSaved: () => void;
}) {
  const [type, setType] = useState<InteractionType>(interaction?.type ?? 'NOTE');
  const [date, setDate] = useState(toLocalInput(interaction?.date));
  const [description, setDescription] = useState(interaction?.description ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const body = { type: type.toUpperCase(), description: description.trim(), date: new Date(date).toISOString() };
      if (interaction) await api(`${base}/${interaction.id}`, { method: 'PATCH', body: JSON.stringify(body), });
      else await api(base, { method: 'POST', body: JSON.stringify(body), });
      onSaved();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (

    <Modal title={interaction ? "Modifier l'interaction" : 'Nouvelle interaction'} onClose={onClose}>

      <form onSubmit={submit}>
        <div className="space-y-5 px-7 py-6">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Type *">
              <select value={type} onChange={(e) => setType(e.target.value as InteractionType)} className={inputClass}>
                {(Object.keys(INTERACTION_CONFIG) as InteractionType[]).map((t) => <option key={t} value={t}>{INTERACTION_CONFIG[t].label}</option>)}
              </select>
            </Field>
            <Field label="Date *">
              <input type="datetime-local" required value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} />
            </Field>
          </div>
          <Field label="Description *">
            <textarea required rows={5} value={description} onChange={(e) => setDescription(e.target.value)} className={`${inputClass} resize-none`}
              placeholder="Résumé de l'échange, points clés, prochaines étapes…" />
          </Field>
          <ErrorBox message={error} />
        </div>
        <div className="flex justify-end gap-3 border-t border-slate-100 bg-slate-50/50 px-7 py-4">
          <button type="button" onClick={onClose} disabled={loading} className={btnSecondary}>Annuler</button>
          <button type="submit" disabled={loading} className={btnPrimary}>{loading ? 'Enregistrement...' : 'Enregistrer'}</button>
        </div>
      </form>
    </Modal>
  );
}

export default function ProspectDetailPage({ params }: { params: { id: string; prospectId: string } }) {
  const router = useRouter();
  const { id: businessId, prospectId } = params;
  const pBase = `businesses/${businessId}/prospects/${prospectId}`;
  const iBase = `${pBase}/interactions`;

  const [prospect, setProspect] = useState<Prospect | null>(null);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [iForm, setIForm] = useState<Interaction | 'new' | null>(null);
  const [iDelete, setIDelete] = useState<Interaction | null>(null);
  const [iDeleteBusy, setIDeleteBusy] = useState(false);
  const [iDeleteError, setIDeleteError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [p, i] = await Promise.all([api<Prospect>(pBase), api<Interaction[]>(iBase)]);
      setProspect(p);
      setInteractions(i);
    } catch (e: any) {
      setError(e.message);
    }
  }, [pBase, iBase]);

  useEffect(() => { load(); }, [load]);

  async function changeStatus(status: ProspectStatus) {
    try {
      setError(null);

      const updated = await api<Prospect>(pBase, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      setProspect(updated);
    } catch (e: unknown) {
      setError(
        e instanceof Error ? e.message : 'Impossible de modifier le statut.',
      );
    }
  }

  async function removeProspect() {
    setDeleteBusy(true);
    setDeleteError(null);
    try {
      await api(pBase, { method: 'DELETE' });
      router.push(`/business/${businessId}/prospects`);
    } catch (e: any) {
      setDeleteError(e.message);
      setDeleteBusy(false);
    }
  }

  async function removeInteraction() {
    if (!iDelete) return;
    setIDeleteBusy(true);
    setIDeleteError(null);
    try {
      await api(`${iBase}/${iDelete.id}`, { method: 'DELETE' });
      setIDelete(null);
      load();
    } catch (e: any) {
      setIDeleteError(e.message);
    } finally {
      setIDeleteBusy(false);
    }
  }

  if (error && !prospect) {
    return (
      <div className="space-y-4">
        <ErrorBox message={error} />
        <Link href={`/business/${businessId}/prospects`} className="text-sm font-semibold text-indigo-600">← Retour aux prospects</Link>
      </div>
    );
  }
  if (!prospect) return <p className="text-sm text-slate-500">Chargement...</p>;

  const info: [string, string][] = [
    ['Email', prospect.email!],
    ['Téléphone', prospect.phone || '—'],
    ['Secteur', prospect.region || '—'],
    ['Source', prospect.source || '—'],
    ['Budget estimé', formatMoney(prospect.estimatedValue)],
    ['Créé le', formatDate(prospect.createdAt)],
  ];
  const firstName =
    prospect.company ||
    [prospect.firstName, prospect.lastName].filter(Boolean).join(' ') ||
    'Sans nom';
  return (

    <div className="space-y-6">
      <Link href={`/business/${businessId}/prospects`} className="text-sm font-semibold text-slate-500 hover:text-indigo-600">← Tous les prospects</Link>
      <ErrorBox message={error} />
      <AiPanel prospectId={prospect.id} />
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-xl font-bold text-indigo-600">
              {prospect.firstName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">{prospect.firstName}</h2>
              <p className="text-sm text-slate-500">{prospect.firstName}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select value={prospect.status} onChange={(e) => changeStatus(e.target.value as ProspectStatus)} aria-label="Statut"
              className={`cursor-pointer rounded-full border-0 py-1.5 pl-3 pr-8 text-sm font-semibold ring-1 ring-inset ${STATUS_CONFIG[prospect.status].badge}`}>
              {STATUSES.map((s) => <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>)}
            </select>
            <button onClick={() => setEditing(true)} className={btnSecondary}>Modifier</button>
            <button onClick={() => { setDeleteError(null); setDeleting(true); }} className="rounded-lg border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50">Supprimer</button>
          </div>
        </div>
        <dl className="mt-6 grid gap-5 border-t border-slate-100 pt-6 sm:grid-cols-2 lg:grid-cols-3">
          {info.map(([k, v]) => (
            <div key={k}>
              <dt className="text-xs font-semibold uppercase tracking-wider text-slate-400">{k}</dt>
              <dd className="mt-1 break-words text-sm font-medium text-slate-800">{v}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Interactions</h3>
            <p className="text-sm text-slate-500">Emails, réunions et notes commerciales.</p>
          </div>
          <button onClick={() => setIForm('new')} className={btnPrimary}><span className="text-lg leading-none">+</span> Ajouter</button>
        </div>

        {interactions.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-300 px-6 py-10 text-center text-sm text-slate-500">
            Aucune interaction enregistrée pour ce prospect.
          </p>
        ) : (
          <ul className="space-y-3">
            {interactions.map((i) => (
              <li key={i.id} className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <StatusBadge className={`${INTERACTION_CONFIG[i.type].badge} ring-transparent`}>
                      {INTERACTION_CONFIG[i.type].icon} {INTERACTION_CONFIG[i.type].label}
                    </StatusBadge>
                    <time className="text-xs font-medium text-slate-500">
                      {new Date(i.date).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' })}
                    </time>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => setIForm(i)} className="rounded-lg px-2.5 py-1 text-xs font-semibold text-indigo-600 hover:bg-indigo-50">Modifier</button>
                    <button onClick={() => { setIDeleteError(null); setIDelete(i); }} className="rounded-lg px-2.5 py-1 text-xs font-semibold text-red-600 hover:bg-red-50">Supprimer</button>
                  </div>
                </div>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">{i.description}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {editing && <ProspectFormModal businessId={businessId} prospect={prospect} onClose={() => setEditing(false)} onSaved={(p) => { setProspect(p); setEditing(false); }} />}
      {iForm && <InteractionModal base={iBase} interaction={iForm === 'new' ? undefined : iForm} onClose={() => setIForm(null)} onSaved={() => { setIForm(null); load(); }} />}
      {deleting && (
        <ConfirmDialog title="Supprimer ce prospect ?" loading={deleteBusy} error={deleteError} onConfirm={removeProspect} onClose={() => setDeleting(false)}
          message={<>Le prospect <strong>{prospect.firstName}</strong> et ses {interactions.length} interaction(s) seront définitivement supprimés.</>} />
      )}
      {iDelete && (
        <ConfirmDialog title="Supprimer cette interaction ?" loading={iDeleteBusy} error={iDeleteError} onConfirm={removeInteraction} onClose={() => setIDelete(null)}
          message="Cette interaction sera définitivement supprimée." />
      )}
    </div>
  );
}
