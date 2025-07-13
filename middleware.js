import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // Check if user is trying to access admin routes
  if (pathname.startsWith('/admin/dashboard')) {
    const adminSession = request.cookies.get('admin_session');
    
    if (!adminSession) {
      // Redirect to admin login if no session
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    
    try {
      const session = JSON.parse(adminSession.value);
      if (!session.isAdmin) {
        // Redirect to admin login if invalid session
        return NextResponse.redirect(new URL('/admin/login', request.url));
      }
    } catch (error) {
      // Redirect to admin login if session parsing fails
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/dashboard']
}; 