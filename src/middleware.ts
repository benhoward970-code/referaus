import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedRoutes = ['/dashboard'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = protectedRoutes.some(route => pathname.startsWith(route));

  if (!isProtected) return NextResponse.next();

  // If no Supabase configured (no env vars), allow access (demo mode)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) return NextResponse.next();

  // Check for Supabase auth cookie: sb-{ref}-auth-token
  // The ref from the Supabase URL is "zfhapnnlxfhxsqpqcuje"
  const authCookie = request.cookies.get('sb-zfhapnnlxfhxsqpqcuje-auth-token')?.value;

  // Also check chunked cookies (Supabase splits large tokens into .0, .1, etc.)
  const authCookieChunked = request.cookies.getAll().some(
    c => c.name.startsWith('sb-zfhapnnlxfhxsqpqcuje-auth-token') && c.value
  );

  // Fallback: check for any auth-token cookie (for different Supabase refs)
  const fallbackToken = request.cookies.getAll().find(
    c => c.name.includes('auth-token') && c.value
  )?.value;

  const hasToken = !!authCookie || authCookieChunked || !!fallbackToken;

  if (!hasToken) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
