'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { User } from '@/lib/constants';
import { btnPrimary, ErrorBox, Field, inputClass } from '@/components/ui';

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api<User>('users/me').then((u) => { setUser(u); setName(u.name); setEmail(u.email); }).catch((e) => setError(e.message));
  }, []);

  async function save(e: FormEvent) {
    e.preventDefault();
    setSaving(true); setError(null); setSaved(false);
    try {
      const body: Record<string, string> = { name: name.trim(), email: email.trim() };
      if (newPassword) { body.newPassword = newPassword; body.currentPassword = currentPassword; }
      const u = await api<User>('users/me', { method: 'PATCH', body });
      setUser(u);
      setCurrentPassword(''); setNewPassword('');
      setSaved(true);
    } catch (err: any) { setError(err.message); }
    finally { setSaving(false); }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center gap-4 px-6 py-4">
          <Link href="/" className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-sm font-bold text-white">CRM</Link>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Mon profil</h1>
        </div>
      </header>

      <div className="mx-auto max-w-3xl space-y-6 px-6 py-8">
        <Link href="/" className="text-sm font-semibold text-slate-500 hover:text-indigo-600">← Retour</Link>
        {!user ? (
          error ? <ErrorBox message={error} /> : <p className="text-sm text-slate-500">Chargement...</p>
        ) : (
          <form onSubmit={save} className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="space-y-5 p-6">
              <div className="flex gap-2">
                <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">{user.role === 'ADMIN' ? 'Administrateur' : 'Commercial'}</span>
                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">{user.status === 'ACTIVE' ? 'Actif' : 'Inactif'}</span>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Nom"><input required minLength={2} value={name} onChange={(e) => setName(e.target.value)} className={inputClass} /></Field>
                <Field label="Email"><input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} /></Field>
              </div>
              <div className="border-t border-slate-100 pt-5">
                <p className="mb-4 text-sm font-semibold text-slate-900">Changer le mot de passe</p>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Mot de passe actuel">
                    <input type="password" autoComplete="current-password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required={Boolean(newPassword)} className={inputClass} />
                  </Field>
                  <Field label="Nouveau mot de passe" hint="Minimum 8 caractères. Laissez vide pour ne pas le changer.">
                    <input type="password" autoComplete="new-password" minLength={8} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className={inputClass} />
                  </Field>
                </div>
              </div>
              <ErrorBox message={error} />
            </div>
            <div className="flex items-center justify-end gap-4 border-t border-slate-100 bg-slate-50/50 px-6 py-4">
              {saved && <span className="text-sm font-medium text-emerald-600">Profil mis à jour</span>}
              <button type="submit" disabled={saving} className={btnPrimary}>{saving ? 'Enregistrement...' : 'Enregistrer'}</button>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
