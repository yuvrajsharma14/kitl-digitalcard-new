export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { UserHeader } from "@/components/user/UserHeader";
import { ProfileSection } from "@/components/user/ProfileSection";
import { PasswordSection } from "@/components/user/PasswordSection";
import { KeyRound, User } from "lucide-react";

export const metadata: Metadata = { title: "Settings" };

async function getProfileData(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      avatarUrl: true,
      emailVerified: true,
      createdAt: true,
      passwordHash: true,
      accounts: { select: { provider: true } },
    },
  });
}

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await getProfileData(session.user.id);
  if (!user) redirect("/login");

  const hasPassword    = !!user.passwordHash;
  const oauthProviders = user.accounts.map((a) => a.provider);

  return (
    <div className="flex flex-col overflow-hidden h-full">
      <UserHeader title="Settings" subtitle="Manage your account and preferences" />

      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl space-y-6">

          {/* Profile section */}
          <section className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-gray-50/50">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50">
                <User className="h-4 w-4 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">Profile</p>
                <p className="text-xs text-gray-400">Your name and profile photo</p>
              </div>
            </div>
            <div className="px-6 py-6">
              <ProfileSection
                initialName={user.name}
                initialEmail={user.email}
                initialAvatarUrl={user.avatarUrl ?? null}
                emailVerified={user.emailVerified?.toISOString() ?? null}
                createdAt={user.createdAt.toISOString()}
                oauthProviders={oauthProviders}
              />
            </div>
          </section>

          {/* Password section — only for credential users */}
          {hasPassword && (
            <section className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
              <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50">
                  <KeyRound className="h-4 w-4 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">Password</p>
                  <p className="text-xs text-gray-400">Change your account password</p>
                </div>
              </div>
              <div className="px-6 py-6">
                <PasswordSection />
              </div>
            </section>
          )}

          {/* OAuth-only hint */}
          {!hasPassword && oauthProviders.length > 0 && (
            <section className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
              <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50">
                  <KeyRound className="h-4 w-4 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">Password</p>
                  <p className="text-xs text-gray-400">Change your account password</p>
                </div>
              </div>
              <div className="px-6 py-6">
                <p className="text-sm text-gray-500">
                  Your account is linked via{" "}
                  <span className="capitalize font-medium text-gray-700">
                    {oauthProviders.join(", ")}
                  </span>
                  . Password management is handled by your provider.
                </p>
              </div>
            </section>
          )}

        </div>
      </main>
    </div>
  );
}
