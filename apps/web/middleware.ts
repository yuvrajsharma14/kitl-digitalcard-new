import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const AUTH_ROUTES = ["/login", "/signup", "/forgot-password", "/reset-password"];
const USER_ROUTES = ["/dashboard", "/card", "/settings"];
const ADMIN_ROUTES = ["/admin"];

export default auth((req) => {
  const { nextUrl } = req;
  const session = req.auth;
  const pathname = nextUrl.pathname;

  const isAuthRoute = AUTH_ROUTES.some((r) => pathname.startsWith(r));
  const isUserRoute = USER_ROUTES.some((r) => pathname.startsWith(r));
  const isAdminRoute = ADMIN_ROUTES.some((r) => pathname.startsWith(r));

  // Redirect already-logged-in users away from auth pages
  if (isAuthRoute && session) {
    const role = session.user?.role;
    const destination = role === "ADMIN" ? "/admin" : "/dashboard";
    return NextResponse.redirect(new URL(destination, nextUrl));
  }

  // Protect user routes
  if (isUserRoute && !session) {
    return NextResponse.redirect(
      new URL(`/login?callbackUrl=${encodeURIComponent(pathname)}`, nextUrl)
    );
  }

  // Protect admin routes
  if (isAdminRoute) {
    if (!session) {
      return NextResponse.redirect(
        new URL(`/login?callbackUrl=${encodeURIComponent(pathname)}`, nextUrl)
      );
    }
    if (session.user?.role !== "ADMIN") {
      // Logged in but not admin — send to user dashboard
      return NextResponse.redirect(new URL("/dashboard", nextUrl));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|images|u/).*)"],
};
