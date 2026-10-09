import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import type { Business, User } from './constants';

export const API_URL = process.env.API_URL || 'http://localhost:3001';

export async function serverFetch(path: string) {
  const token = cookies().get('token')?.value;
  if (!token) redirect('/api/auth/expired');
  return fetch(`${API_URL}/${path}`, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' });
}

export async function requireUser(): Promise<User> {
  const res = await serverFetch('users/me');
  if (!res.ok) redirect('/api/auth/expired');
  return res.json();
}

export async function requireBusiness(id: string): Promise<Business> {
  const res = await serverFetch(`businesses/${id}`);
  if (res.status === 404 || res.status === 400) notFound();
  if (!res.ok) redirect('/api/auth/expired');
  return res.json();
}
