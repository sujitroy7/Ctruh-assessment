import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// Routes accessible without authentication
const publicRoutes = ["/", "/cart", "/products"];

// Auth-related pages — skip protection but handle redirect-if-logged-in logic
const publicAuthPages = ["/login", "/admin/login", "/unauthorized"];

/**
 * Returns true if the given pathname should bypass auth checks.
 * Matches exact paths and all sub-paths (e.g. /products/123).
 */
function isPublic(pathname: string) {
  return (
    publicAuthPages.includes(pathname) ||
    publicRoutes.some(
      (route) => pathname === route || pathname.startsWith(route + "/"),
    )
  );
}

/**
 * Route-level middleware that enforces authentication and role-based access.
 *
 * Flow:
 *  1. Broken session (refresh token dead) → wipe cookie, redirect to /login
 *  2. Public route → allow through; redirect to home/dashboard if already logged in
 *  3. No token → send to the appropriate login page (admin vs. customer)
 *  4. Role guard → owner-only for /admin, customer-only for account routes
 */
export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;
    const role = token?.role;

    // Token exists but the refresh cycle failed — session is unrecoverable.
    // Delete both the HTTP and HTTPS variants of the session cookie so
    // NextAuth doesn't keep trying to refresh on every request.
    if (token?.error === "RefreshAccessTokenError") {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("error", "SessionExpired");

      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete("next-auth.session-token");
      response.cookies.delete("__Secure-next-auth.session-token");

      return response;
    }

    // Public routes are open to everyone.
    // Logged-in users hitting a login page get bounced to their home.
    if (isPublic(pathname)) {
      if (pathname === "/login" && token) {
        return NextResponse.redirect(new URL("/", req.url));
      }
      if (pathname === "/admin/login" && token) {
        return NextResponse.redirect(new URL("/admin/dashboard", req.url));
      }
      return NextResponse.next();
    }

    // No session — redirect to the correct login page.
    // Customer login stores callbackUrl so we can return them after sign-in.
    if (!token) {
      if (pathname.startsWith("/admin")) {
        return NextResponse.redirect(new URL("/admin/login", req.url));
      }
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Admin section is restricted to the "owner" role only
    if (pathname.startsWith("/admin") && role !== "owner") {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }

    // These routes are for customers only — block owners/other roles
    const customerOnlyRoutes = ["/my-orders", "/profile"];
    if (
      customerOnlyRoutes.some((r) => pathname.startsWith(r)) &&
      role !== "customer"
    ) {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }

    return NextResponse.next();
  },
  {
    // Always let our custom middleware handle the auth decision above
    callbacks: {
      authorized() {
        return true;
      },
    },
  },
);

// Apply middleware to all routes except static assets and NextAuth API routes
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*|api/auth).*)"],
};
