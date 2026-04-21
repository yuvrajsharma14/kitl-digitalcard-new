import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SessionProvider } from "next-auth/react";
import { UserSidebar } from "@/components/user/UserSidebar";

function UserFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="shrink-0 border-t border-gray-200 bg-white px-6 py-3 flex items-center justify-between">
      <p className="text-xs text-gray-400">
        &copy; {year}{" "}
        <span className="font-medium text-gray-500">My Digital Card</span>
        {" "}— All rights reserved
      </p>
      <div className="flex items-center gap-4">
        <span className="text-xs text-gray-300">v1.0.0</span>
        <span className="h-3 w-px bg-gray-200" />
        <span className="text-xs text-gray-400">User Portal</span>
      </div>
    </footer>
  );
}

export default async function UserLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = {
    name:  session.user.name  ?? null,
    email: session.user.email ?? null,
    image: session.user.image ?? null,
  };

  // Pass the pre-fetched session into SessionProvider so useSession() reads
  // from context instead of making a client-side /api/auth/session request.
  // This prevents HTTP 431 from large cookie headers.
  return (
    <SessionProvider session={session}>
      <div className="flex h-full overflow-hidden bg-gray-50">
        <UserSidebar user={user} />
        <div className="flex flex-1 flex-col overflow-hidden">
          {children}
          <UserFooter />
        </div>
      </div>
    </SessionProvider>
  );
}
