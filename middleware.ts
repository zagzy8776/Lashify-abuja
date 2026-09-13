import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ADMIN_COOKIE_NAME, verifyAdminToken } from '@/src/lib/admin-auth';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isAdminPage = path.startsWith('/admin') && path !== '/admin/login';
  const isAdminApi = path.startsWith('/api/admin') && path !== '/api/admin/login';

  if (!isAdminPage && !isAdminApi) return NextResponse.next();

  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  if (!token) {
    if (isAdminApi) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  try {
    await verifyAdminToken(token);
    return NextResponse.next();
  } catch {
    if (isAdminApi) {
      const response = NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      response.cookies.delete(ADMIN_COOKIE_NAME);
      return response;
    }

    const response = NextResponse.redirect(new URL('/admin/login', request.url));
    response.cookies.delete(ADMIN_COOKIE_NAME);
    return response;
  }
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
