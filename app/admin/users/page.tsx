'use client';

import { useEffect, useState } from 'react';
import { usersApi } from '@/lib/api';
import type { UserRow } from '@/lib/ai-types';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    usersApi.list().then(setUsers).catch((e) => setError(e.message));
  }, []);

  async function change(id: string, fn: () => Promise<UserRow>) {
    setError(null);
    try { const u = await fn(); setUsers((list) => list?.map((x) => (x.id === id ? { ...x, ...u } : x)) ?? null); }
    catch (e) { setError((e as Error).message); }
  }

  if (error && !users) return <p className="p-6 text-red-600">{error === 'Forbidden resource' ? 'Accès réservé aux administrateurs.' : error}</p>;
  if (!users) return <p className="p-6 text-gray-500">Chargement…</p>;

  return (
    <main className="mx-auto max-w-4xl space-y-4 p-6">
      <h1 className="text-2xl font-bold">Utilisateurs</h1>
      {error && <p className="rounded-lg bg-red-50 p-2 text-sm text-red-700">{error}</p>}
      <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
            <tr><th className="p-3">Nom</th><th className="p-3">Email</th><th className="p-3">Rôle</th><th className="p-3">Statut</th></tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((u) => (
              <tr key={u.id}>
                <td className="p-3 font-medium">{u.name}</td>
                <td className="p-3 text-gray-600">{u.email}</td>
                <td className="p-3">
                  <select value={u.role} onChange={(e) => change(u.id, () => usersApi.setRole(u.id, e.target.value as UserRow['role']))} className="rounded border border-gray-300 px-2 py-1">
                    <option value="COMMERCIAL">Commercial</option><option value="ADMIN">Admin</option>
                  </select>
                </td>
                <td className="p-3">
                  <select value={u.status} onChange={(e) => change(u.id, () => usersApi.setStatus(u.id, e.target.value as UserRow['status']))} className="rounded border border-gray-300 px-2 py-1">
                    <option value="ACTIVE">Actif</option><option value="INACTIVE">Inactif</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
