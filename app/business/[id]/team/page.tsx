'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { ROLE_CONFIG, type Business, type BusinessRole, type Member, type User } from '@/lib/constants';
import { btnPrimary, ConfirmDialog, ErrorBox, inputClass, StatusBadge } from '@/components/ui';

export default function TeamPage({ params }: { params: { id: string } }) {
  const base = `businesses/${params.id}/members`;
  const [members, setMembers] = useState<Member[] | null>(null);
  const [me, setMe] = useState<User | null>(null);
  const [myRole, setMyRole] = useState<BusinessRole>('MEMBER');
  const [error, setError] = useState<string | null>(null);

  const [email, setEmail] = useState('');
  const [newRole, setNewRole] = useState<'MEMBER' | 'ADMIN'>('MEMBER');
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  const [toRemove, setToRemove] = useState<Member | null>(null);
  const [removing, setRemoving] = useState(false);
  const [removeError, setRemoveError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [m, u, b] = await Promise.all([api<Member[]>(base), api<User>('users/me'), api<Business>(`businesses/${params.id}`)]);
      setMembers(m); setMe(u); setMyRole(b.role);
    } catch (e: any) { setError(e.message); }
  }, [base, params.id]);

  useEffect(() => { load(); }, [load]);

  const canManage = myRole !== 'MEMBER';

  async function add(e: FormEvent) {
    e.preventDefault();
    setAdding(true); setAddError(null);
    try {
      await api(base, { method: 'POST', body: { email: email.trim(), role: newRole } });
      setEmail(''); setNewRole('MEMBER');
      load();
    } catch (err: any) { setAddError(err.message); }
    finally { setAdding(false); }
  }

  async function changeRole(m: Member, role: 'MEMBER' | 'ADMIN') {
    try {
      await api(`${base}/${m.id}`, { method: 'PATCH', body: { role } });
      load();
    } catch (e: any) { setError(e.message); }
  }

  async function remove() {
    if (!toRemove) return;
    setRemoving(true); setRemoveError(null);
    try {
      await api(`${base}/${toRemove.id}`, { method: 'DELETE' });
      if (toRemove.userId === me?.id) { window.location.href = '/'; return; }
      setToRemove(null);
      load();
    } catch (e: any) { setRemoveError(e.message); }
    finally { setRemoving(false); }
  }

  const canRemove = (m: Member) =>
    m.role !== 'OWNER' && (m.userId === me?.id || myRole === 'OWNER' || (myRole === 'ADMIN' && m.role === 'MEMBER'));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Équipe</h2>
        <p className="mt-1 text-sm text-slate-500">Les membres de l'entreprise partagent les mêmes prospects.</p>
      </div>
      <ErrorBox message={error} />

      {canManage && (
        <form onSubmit={add} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="mb-3 text-sm font-semibold text-slate-900">Ajouter un membre</p>
          <div className="grid gap-3 sm:grid-cols-[1fr_180px_auto]">
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} placeholder="Email d'un utilisateur existant" aria-label="Email" />
            <select value={newRole} onChange={(e) => setNewRole(e.target.value as 'MEMBER' | 'ADMIN')} className={inputClass} aria-label="Rôle">
              <option value="MEMBER">Membre</option>
              <option value="ADMIN">Administrateur</option>
            </select>
            <button type="submit" disabled={adding} className={btnPrimary}>{adding ? 'Ajout...' : 'Ajouter'}</button>
          </div>
          {addError && <div className="mt-3"><ErrorBox message={addError} /></div>}
        </form>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {!members ? (
          <p className="px-6 py-12 text-center text-sm text-slate-500">Chargement...</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {members.map((m) => (
              <li key={m.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 font-semibold text-indigo-700">{m.name.charAt(0).toUpperCase()}</div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{m.name}{m.userId === me?.id && <span className="ml-2 text-xs font-medium text-slate-400">(vous)</span>}</p>
                    <p className="text-xs text-slate-500">{m.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {myRole === 'OWNER' && m.role !== 'OWNER' ? (
                    <select value={m.role} onChange={(e) => changeRole(m, e.target.value as 'MEMBER' | 'ADMIN')} aria-label="Changer le rôle"
                      className={`cursor-pointer rounded-full border-0 py-1 pl-2.5 pr-7 text-xs font-semibold ring-1 ring-inset ${ROLE_CONFIG[m.role].className}`}>
                      <option value="MEMBER">Membre</option>
                      <option value="ADMIN">Administrateur</option>
                    </select>
                  ) : (
                    <StatusBadge className={ROLE_CONFIG[m.role].className}>{ROLE_CONFIG[m.role].label}</StatusBadge>
                  )}
                  {canRemove(m) && (
                    <button onClick={() => { setRemoveError(null); setToRemove(m); }} className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50">
                      {m.userId === me?.id ? 'Quitter' : 'Retirer'}
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {toRemove && (
        <ConfirmDialog title={toRemove.userId === me?.id ? "Quitter l'entreprise ?" : 'Retirer ce membre ?'}
          confirmLabel={toRemove.userId === me?.id ? 'Quitter' : 'Retirer'} loading={removing} error={removeError} onConfirm={remove} onClose={() => setToRemove(null)}
          message={toRemove.userId === me?.id ? "Vous perdrez l'accès aux prospects de cette entreprise." : <><strong>{toRemove.name}</strong> n'aura plus accès à cette entreprise.</>} />
      )}
    </div>
  );
}
