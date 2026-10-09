import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.API_URL || 'http://localhost:3001';

// Only these backend resources are reachable through the proxy.
const ALLOWED_ROOTS = new Set(['businesses', 'users']);
const SEGMENT = /^[A-Za-z0-9_-]+$/;

/**
 * Authenticated pass-through to the NestJS API. The JWT lives in an httpOnly cookie,
 * so browser code calls /api/proxy/<path> and the token is attached server-side.
 */
async function forward(req: NextRequest, { params }: { params: { path: string[] } }) {
  const token = cookies().get('token')?.value;
  if (!token) return NextResponse.json({ message: 'Non authentifié' }, { status: 401 });

  const segments = params.path;
  if (!segments.every((s) => SEGMENT.test(s)) || !ALLOWED_ROOTS.has(segments[0])) {
    return NextResponse.json({ message: 'Ressource introuvable' }, { status: 404 });
  }
  // users: only /users/me is exposed to the browser
  if (segments[0] === 'users' && !(segments.length === 2 && segments[1] === 'me')) {
    return NextResponse.json({ message: 'Ressource introuvable' }, { status: 404 });
  }

  const hasBody = !['GET', 'HEAD', 'DELETE'].includes(req.method);
  try {
    const res = await fetch(`${API_URL}/${segments.join('/')}${req.nextUrl.search}`, {
      method: req.method,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(hasBody ? { 'Content-Type': 'application/json' } : {}),
      },
      body: hasBody ? await req.text() : undefined,
      cache: 'no-store',
    });
    const text = await res.text();
    return new NextResponse(text || null, {
      status: res.status,
      headers: { 'Content-Type': res.headers.get('content-type') || 'application/json' },
    });
  } catch (e) {
    console.error('Proxy error:', e);
    return NextResponse.json({ message: "Le serveur est injoignable" }, { status: 502 });
  }
}

export { forward as GET, forward as POST, forward as PATCH, forward as DELETE };
