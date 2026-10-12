'use client';
import { useEffect, useState } from 'react';
import { api, json } from '../../lib/api';

const input = 'w-full rounded-md border border-slate-300 px-3 py-2 text-sm';
const card = 'rounded-lg border border-slate-200 bg-white p-5 space-y-3';

export default function ProfilePage() {
  const [me, setMe] = useState<any>(null);
  const [form, setForm] = useState({ name: '', email: '' });
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '' });
  const [msg, setMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  useEffect(() => {
    api('users/me').then((u) => {
      const user = u.user ?? u; // tolerate { user } or flat response
      setMe(user);
      setForm({ name: user.name ?? '', email: user.email ?? '' });
    }).catch((e) => setMsg({ kind: 'err', text: e.message }));
  }, []);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    try { setMe(await api('users/me', json('PATCH', form))); setMsg({ kind: 'ok', text: 'Profil mis à jour.' }); }
    catch (err: any) { setMsg({ kind: 'err', text: err.message }); }
  }

  async function savePassword(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api('users/me/password', json('PATCH', pw));
      setPw({ currentPassword: '', newPassword: '' });
      setMsg({ kind: 'ok', text: 'Mot de passe modifié.' });
    } catch (err: any) { setMsg({ kind: 'err', text: err.message }); }
  }

  if (!me) return <p className="text-slate-400">Chargement…</p>;

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <h1 className="text-xl font-semibold">Mon profil</h1>
      {msg && <p className={`rounded-md p-3 text-sm ${msg.kind === 'ok' ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-700'}`}>{msg.text}</p>}

      <form onSubmit={saveProfile} className={card}>
        <label className="block text-sm">Nom<input required className={input} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
        <label className="block text-sm">Email<input required type="email" className={input} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
        <p className="text-sm text-slate-500">Rôle : {me.role} · Statut : {me.status ?? 'ACTIVE'}</p>
        <button className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white">Enregistrer</button>
      </form>

      <form onSubmit={savePassword} className={card}>
        <h2 className="font-medium">Changer le mot de passe</h2>
        <label className="block text-sm">Mot de passe actuel<input required type="password" className={input} value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} /></label>
        <label className="block text-sm">Nouveau mot de passe (8 caractères min.)<input required minLength={8} type="password" className={input} value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} /></label>
        <button className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white">Modifier le mot de passe</button>
      </form>
    </div>
  );
}
