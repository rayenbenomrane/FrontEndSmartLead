'use client';

import { FormEvent, useEffect, useState } from 'react';
import { usersApi } from '@/lib/api';

const input = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none';
const btn = 'rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50';

export default function ProfilePage() {
  const [form, setForm] = useState({ name: '', email: '' });
  const [role, setRole] = useState('');
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '' });
  const [msg, setMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    usersApi.me().then((u) => { setForm({ name: u.name, email: u.email }); setRole(u.role); })
      .catch((e) => setMsg({ kind: 'err', text: e.message }));
  }, []);

  async function submit(e: FormEvent, fn: () => Promise<unknown>, okText: string, after?: () => void) {
    e.preventDefault(); setBusy(true); setMsg(null);
    try { await fn(); setMsg({ kind: 'ok', text: okText }); after?.(); }
    catch (err) { setMsg({ kind: 'err', text: (err as Error).message }); }
    setBusy(false);
  }

  return (
    <main className="mx-auto max-w-xl space-y-8 p-6">
      <h1 className="text-2xl font-bold">Mon profil</h1>
      {msg && <p className={`rounded-lg p-3 text-sm ${msg.kind === 'ok' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>{msg.text}</p>}

      <form onSubmit={(e) => submit(e, () => usersApi.updateMe(form), 'Profil mis à jour')} className="space-y-3 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <label className="block text-sm">Nom<input className={input} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required minLength={2} /></label>
        <label className="block text-sm">Email<input type="email" className={input} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></label>
        <p className="text-xs text-gray-500">Rôle : {role}</p>
        <button className={btn} disabled={busy}>Enregistrer</button>
      </form>

      <form onSubmit={(e) => submit(e, () => usersApi.changePassword(pw), 'Mot de passe modifié', () => setPw({ currentPassword: '', newPassword: '' }))} className="space-y-3 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="font-semibold">Changer le mot de passe</h2>
        <input type="password" placeholder="Mot de passe actuel" className={input} value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} required />
        <input type="password" placeholder="Nouveau mot de passe (8 caractères min.)" className={input} value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} required minLength={8} />
        <button className={btn} disabled={busy}>Modifier</button>
      </form>
    </main>
  );
}
