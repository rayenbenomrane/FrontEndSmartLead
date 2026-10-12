import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.API_URL ?? 'http://localhost:3001';

/**
 * Relaie /api/proxy/<chemin> vers le backend NestJS en ajoutant le JWT
 * stocké dans le cookie httpOnly "token". Le navigateur n'a jamais accès au token.
 */
async function handler(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  const { path } = await ctx.params;
  const token = (await cookies()).get('token')?.value;
  if (!token) return NextResponse.json({ message: 'Non authentifié' }, { status: 401 });

  const url = `${API_URL}/${path.join('/')}${req.nextUrl.search}`;
  const hasBody = !['GET', 'HEAD'].includes(req.method);
  const res = await fetch(url, {
    method: req.method,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: hasBody ? await req.text() : undefined,
    cache: 'no-store',
  });
  return new NextResponse(await res.text(), {
    status: res.status,
    headers: { 'Content-Type': res.headers.get('content-type') ?? 'application/json' },
  });
}

export { handler as GET, handler as POST, handler as PATCH, handler as PUT, handler as DELETE };
