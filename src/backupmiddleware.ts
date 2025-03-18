import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const token = req.cookies.get('accessToken')?.value;

  console.log('Token in Middleware:', token); // ✅ Debugging token presence

  const isAuthPage =
    req.nextUrl.pathname.startsWith('/auth') &&
    !req.nextUrl.pathname.startsWith('/auth/email-confirmation');

  if (token && isAuthPage) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  return NextResponse.next();
}

// ✅ Keep middleware only for authentication pages
export const config = {
  matcher: ['/auth/:path*'],
};
