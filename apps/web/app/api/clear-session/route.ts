import { NextResponse } from "next/server";
import { cookies } from "next/headers";

// Dev helper — clears all NextAuth cookies so stale accumulated
// cookies don't cause HTTP 431 errors.
export async function GET() {
  const jar = await cookies();

  const names = [
    "authjs.session-token",
    "authjs.csrf-token",
    "authjs.callback-url",
    "__Secure-authjs.session-token",
    "__Secure-authjs.csrf-token",
    "__Secure-authjs.callback-url",
    "__Host-authjs.csrf-token",
    ...Array.from({ length: 10 }, (_, i) => `authjs.session-token.${i}`),
    ...Array.from({ length: 10 }, (_, i) => `__Secure-authjs.session-token.${i}`),
  ];

  for (const name of names) {
    try { jar.delete(name); } catch { /* ignore */ }
  }

  // Return HTML that clears cookies via JS as a belt-and-suspenders approach,
  // then redirects to login
  return new NextResponse(
    `<!DOCTYPE html><html><head>
    <script>
      // Clear every cookie the browser has for this origin
      document.cookie.split(';').forEach(function(c) {
        document.cookie = c.trim().split('=')[0] + '=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/';
      });
      window.location.replace('/login');
    </script>
    </head><body>Clearing session...</body></html>`,
    {
      status: 200,
      headers: { "Content-Type": "text/html" },
    }
  );
}
