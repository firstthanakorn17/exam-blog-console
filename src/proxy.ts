import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Next.js 16 Proxy (formerly Middleware)
 * Runs before a request completes for optimistic auth checks, redirects, and custom headers.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Redirect root '/' directly to Phase 1 Admin Console (/console)
  if (pathname === "/") {
    return NextResponse.redirect(new URL("/console", request.url));
  }

  // Optional locked simulation: if user logged out explicitly (cookie = "logged_out")
  const sessionCookie = request.cookies.get("blog_admin_session")?.value;
  if (pathname.startsWith("/console") && sessionCookie === "logged_out") {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const response = NextResponse.next();
  response.headers.set("x-app-router-proxy", "nextjs-16-proxy-active");
  return response;
}

export const config = {
  matcher: ["/", "/console/:path*"],
};
