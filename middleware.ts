import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Các route công khai không cần auth
  const publicRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];

  // Kiểm tra nếu là route công khai
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Kiểm tra token trong cookie
  const token = request.cookies.get('accessToken')?.value;

  // Log để debug
  console.log('Middleware check:', {
    pathname,
    hasToken: !!token,
    cookies: request.cookies.getAll().map(c => c.name),
  });

  // Nếu không có token và truy cập route bảo vệ (admin, ...)
  if (!token && pathname.startsWith('/admin')) {
    // Redirect đến login với returnUrl
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('returnUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Bảo vệ /admin routes
    '/admin/:path*',
  ],
};

