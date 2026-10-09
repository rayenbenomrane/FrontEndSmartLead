import { NextRequest, NextResponse } from 'next/server';

/** Clears a stale/invalid token cookie, then sends the user to /login (avoids a middleware redirect loop). */
export async function GET(req: NextRequest) {
  const res = NextResponse.redirect(new URL('/login', req.url));
  res.cookies.set('token', '', { path: '/', maxAge: 0 });
  return res;
}
