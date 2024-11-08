import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token");
  const { pathname } = request.nextUrl;

  // Normalize the pathname to remove trailing slashes
  const normalizedPath = pathname.replace(/\/$/, "");

  // Define the paths that don't require authentication
  const publicPaths = ["/", "/login", "/forgot-password", "/reset-password", "/mobile-app"];

  // Function to handle dynamic reset-password route
  const isPublicPath = publicPaths.some(
    (path) => normalizedPath === path || normalizedPath.startsWith(`${path}/`)
  );

  // Check if token is missing and the route is protected
  if (!token && !isPublicPath) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (token && isPublicPath) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // If authenticated, proceed as normal
  return NextResponse.next();
}

// Specify paths for which middleware should run
export const config = {
  // Skip API routes, Next.js static assets, and all public folder assets
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|images|svg|.well-known).*)"],
};
