import { NextRequest, NextResponse } from 'next/server';

// Forwards /api/proxy/<anything> to the NestJS API, adding the JWT from the httpOnly cookie.
// The browser never sees the token (same approach as your login/register handlers).
const API = process.env.API_URL ?? 'http://localhost:3001';

type Ctx = { params: Promise<{ path: string[] }> | { path: string[] } };

async function handler(req: NextRequest, ctx: Ctx) {
  const { path } = await ctx.params; // works on Next 14 (sync) and 15 (async)
  const token = req.cookies.get('token')?.value;
  const hasBody = !['GET', 'HEAD'].includes(req.method);

  const res = await fetch(`${API}/${path.join('/')}${req.nextUrl.search}`, {
    method: req.method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: hasBody ? await req.text() : undefined,
    cache: 'no-store',
  });

  return new NextResponse(await res.text(), {
    status: res.status,
    headers: { 'Content-Type': res.headers.get('content-type') ?? 'application/json' },
  });
}

export { handler as GET, handler as POST, handler as PATCH, handler as PUT, handler as DELETE };
