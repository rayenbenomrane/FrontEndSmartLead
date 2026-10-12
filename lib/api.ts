/** Client-side helper: all calls go through the Next.js proxy route (cookie → Bearer token). */
export async function api<T = any>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`/api/proxy/${path.replace(/^\//, '')}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init.headers ?? {}) },
  });
  if (res.status === 401 && typeof window !== 'undefined') {
    window.location.href = '/login';
    throw new Error('Session expirée');
  }
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const msg = Array.isArray(data?.message) ? data.message.join(', ') : data?.message;
    throw new Error(msg ?? `Erreur ${res.status}`);
  }
  return data as T;
}

export const json = (method: string, body?: unknown): RequestInit => ({ method, body: body === undefined ? undefined : JSON.stringify(body) });
