'use client';

import { FormEvent, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { Business } from '@/lib/constants';
import { btnPrimary, ConfirmDialog, ErrorBox, Field, inputClass } from '@/components/ui';

const FIELDS = ['name', 'matriculeFiscale', 'serviceDomain', 'region', 'phone', 'email', 'address', 'website', 'description'] as const;

export default function SettingsPage({ params }: { params: { id: string } }) {
  const [business, setBusiness] = useState<Business | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    api<Business>(`businesses/${params.id}`).then((b) => {
      setBusiness(b);
      setForm(Object.fromEntries(FIELDS.map((f) => [f, (b[f] as string | null) ?? ''])));
    }).catch((e) => setError(e.message));
  }, [params.id]);

  const set = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setSaved(false);
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  async function save(e: FormEvent) {
    e.preventDefault();
    setSaving(true); setError(null); setSaved(false);
    try {
      const b = await api<Business>(`businesses/${params.id}`, { method: 'PATCH', body: form });
      setBusiness(b);
      setSaved(true);
    } catch (err: any) { setError(err.message); }
    finally { setSaving(false); }
  }

  async function remove() {
    setDeleting(true); setDeleteError(null);
    try {
      await api(`businesses/${params.id}`, { method: 'DELETE' });
      window.location.href = '/';
    } catch (e: any) { setDeleteError(e.message); setDeleting(false); }
  }

  if (!business) return error ? <ErrorBox message={error} /> : <p className="text-sm text-slate-500">Chargement...</p>;
  if (business.role === 'MEMBER') return <ErrorBox message="Seuls les administrateurs peuvent modifier l'entreprise." />;

  const text = (name: string, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}, className = '') => (
    <Field label={label} className={className}>
      <input name={name} value={form[name] ?? ''} onChange={set} className={inputClass} {...props} />
    </Field>
  );

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Paramètres de l'entreprise</h2>
        <p className="mt-1 text-sm text-slate-500">Modifiez les informations de votre espace de travail.</p>
      </div>

      <form onSubmit={save} className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="grid gap-5 p-6 sm:grid-cols-2">
          {text('name', "Nom de l'entreprise *", { required: true, minLength: 2 }, 'sm:col-span-2')}
          {text('matriculeFiscale', 'Matricule fiscale *', { required: true, minLength: 3 })}
          {text('serviceDomain', 'Domaine de service *', { required: true })}
          {text('region', 'Région *', { required: true })}
          {text('phone', 'Téléphone')}
          {text('email', 'Email', { type: 'email' })}
          {text('website', 'Site web', { type: 'url' })}
          {text('address', 'Adresse', {}, 'sm:col-span-2')}
          <Field label="Description" className="sm:col-span-2">
            <textarea name="description" rows={3} value={form.description ?? ''} onChange={set} className={`${inputClass} resize-none`} />
          </Field>
          <div className="sm:col-span-2"><ErrorBox message={error} /></div>
        </div>
        <div className="flex items-center justify-end gap-4 border-t border-slate-100 bg-slate-50/50 px-6 py-4">
          {saved && <span className="text-sm font-medium text-emerald-600">Modifications enregistrées</span>}
          <button type="submit" disabled={saving} className={btnPrimary}>{saving ? 'Enregistrement...' : 'Enregistrer'}</button>
        </div>
      </form>

      {business.role === 'OWNER' && (
        <div className="rounded-2xl border border-red-200 bg-white p-6 shadow-sm">
          <h3 className="text-base font-bold text-red-700">Zone dangereuse</h3>
          <p className="mt-1 text-sm text-slate-500">Supprimer l'entreprise efface définitivement ses prospects, interactions et membres.</p>
          <button onClick={() => { setDeleteError(null); setConfirmDelete(true); }}
            className="mt-4 rounded-lg border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50">
            Supprimer l'entreprise
          </button>
        </div>
      )}

      {confirmDelete && (
        <ConfirmDialog title="Supprimer l'entreprise ?" loading={deleting} error={deleteError} onConfirm={remove} onClose={() => setConfirmDelete(false)}
          message={<>L'entreprise <strong>{business.name}</strong> et toutes ses données seront définitivement supprimées. Cette action est irréversible.</>} />
      )}
    </div>
  );
}
