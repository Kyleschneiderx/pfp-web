import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token");

  // Define the paths that don't require authentication
  const publicPaths = ["/", "/login", "/forgot-password", "/reset-password"];

  // Check if the request is to a protected route
  if (!token && !publicPaths.includes(request.nextUrl.pathname)) {
    // Redirect to login if token is not present and the path is protected
    return NextResponse.redirect(new URL("/login", request.url));
  }
  // If authenticated, proceed as normal
  return NextResponse.next();
}

// Specify paths for which middleware should run
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|images|svg).*)'],// Skip API routes, Next.js static assets, and all public folder assets
};
