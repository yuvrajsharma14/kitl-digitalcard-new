import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const PUBLIC_ROUTES = ["/", "/login", "/signup", "/forgot-password", "/reset-password"];
const AUTH_ROUTES = ["/login", "/signup"];
const USER_ROUTES = ["/dashboard", "/card", "/settings"];
const ADMIN_ROUTES = ["/admin"];

export default auth((req) => {
  const { nextUrl, auth: session } = req;
  const pathname = nextUrl.pathname;

  const isPublicRoute =
    PUBLIC_ROUTES.includes(pathname) || pathname.startsWith("/u/");
  const isAuthRoute = AUTH_ROUTES.some((r) => pathname.startsWith(r));
  const isUserRoute = USER_ROUTES.some((r) => pathname.startsWith(r));
  const isAdminRoute = ADMIN_ROUTES.some((r) => pathname.startsWith(r));

  // Redirect logged-in users away from auth pages
  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  // Protect user routes
  if (isUserRoute && !session) {
    return NextResponse.redirect(new URL(`/login?callbackUrl=${pathname}`, nextUrl));
  }

  // Protect admin routes
  if (isAdminRoute) {
    if (!session) {
      return NextResponse.redirect(new URL(`/login?callbackUrl=${pathname}`, nextUrl));
    }
    if ((session.user as any)?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", nextUrl));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|images).*)"],
};
