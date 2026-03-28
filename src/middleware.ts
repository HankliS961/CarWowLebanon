import createMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { routing } from "@/i18n/routing";
import { decode } from "next-auth/jwt";

/** Routes that require authentication. */
const PROTECTED_PATHS = ["/dashboard", "/dealer", "/admin", "/get-offers/dashboard"];

/** Routes that require specific roles. */
const ROLE_PATHS: Record<string, string[]> = {
  "/admin": ["ADMIN"],
  "/dealer": ["DEALER", "ADMIN"],
};

// Create the next-intl middleware
const intlMiddleware = createMiddleware(routing);

/**
 * Get the session token from cookies.
 * NextAuth v5 beta uses "authjs.session-token" for JWT strategy.
 */
function getSessionToken(request: NextRequest): string | undefined {
  return (
    request.cookies.get("authjs.session-token")?.value ??
    request.cookies.get("__Secure-authjs.session-token")?.value ??
    request.cookies.get("next-auth.session-token")?.value ??
    request.cookies.get("__Secure-next-auth.session-token")?.value
  );
}

/**
 * Combined middleware for CarSouk.
 * Handles locale routing (next-intl), auth protection, and role-based access.
 */
export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for API routes and static files
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Extract the locale-stripped path for auth checks
  const pathWithoutLocale = pathname.replace(/^\/(ar|en)/, "") || "/";
  const locale = pathname.match(/^\/(ar|en)/)?.[1] || "ar";

  // Check if the path requires authentication
  const isProtectedPath = PROTECTED_PATHS.some((p) =>
    pathWithoutLocale.startsWith(p)
  );

  if (isProtectedPath) {
    const token = getSessionToken(request);

    if (!token) {
      const loginUrl = new URL(`/${locale}/auth/login`, request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Decode JWT to check role for role-restricted paths
    const secret = process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET;
    if (secret) {
      try {
        const decoded = await decode({
          token,
          secret,
          salt: "authjs.session-token",
        });

        if (decoded) {
          const userRole = decoded.role as string | undefined;

          // Check role-based access
          for (const [rolePath, allowedRoles] of Object.entries(ROLE_PATHS)) {
            if (pathWithoutLocale.startsWith(rolePath)) {
              if (!userRole || !allowedRoles.includes(userRole)) {
                // Redirect to homepage — user doesn't have the required role
                const homeUrl = new URL(`/${locale}`, request.url);
                homeUrl.searchParams.set("error", "unauthorized");
                return NextResponse.redirect(homeUrl);
              }
              break;
            }
          }
        }
      } catch {
        // JWT decode failed — treat as unauthenticated
        const loginUrl = new URL(`/${locale}/auth/login`, request.url);
        loginUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(loginUrl);
      }
    }
  }

  // Apply next-intl middleware for locale routing
  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
