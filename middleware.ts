import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token'); // Replace with your actual auth logic

  // if (!token) {
  //   // If the user is not authenticated, redirect to login
  //   return NextResponse.redirect(new URL('/login', request.url));
  // }

  // If authenticated, proceed as normal
  return NextResponse.next();
}

// Specify which routes the middleware should run on (optional)
export const config = {
  matcher: ['/', '/patients', '/exercises', '/workouts', '/pf-plans', '/education'],
};
