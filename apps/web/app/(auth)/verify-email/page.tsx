import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { CheckCircle2, XCircle, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = { title: "Verify Email" };

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: { token?: string };
}) {
  const { token } = searchParams;

  if (!token) {
    return <ErrorView message="No verification token was provided. Please use the link from your email." />;
  }

  const record = await prisma.verificationToken.findUnique({
    where: { token },
  });

  if (!record) {
    return (
      <ErrorView message="This verification link is invalid or has already been used. You may already be verified — try signing in." />
    );
  }

  if (record.expires < new Date()) {
    await prisma.verificationToken.delete({ where: { token } }).catch(() => null);
    return (
      <ErrorView message="This verification link has expired (links are valid for 24 hours). Please sign up again." />
    );
  }

  // Mark the user's email as verified
  await prisma.user.update({
    where:  { email: record.identifier },
    data:   { emailVerified: new Date() },
  });

  // Consume the token
  await prisma.verificationToken.delete({ where: { token } });

  return (
    <div className="w-full">
      <div className="flex flex-col items-center mb-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 mb-4">
          <QrCode className="h-6 w-6 text-white" />
        </div>
      </div>

      <div className="rounded-xl border border-green-200 bg-green-50 p-6 text-center">
        <CheckCircle2 className="h-10 w-10 text-green-500 mx-auto mb-3" />
        <h2 className="text-base font-semibold text-gray-900 mb-1">Email verified!</h2>
        <p className="text-sm text-gray-500 mb-5">
          Your account is now active. Sign in to start creating your digital business card.
        </p>
        <Button asChild className="w-full">
          <Link href="/login">Sign In</Link>
        </Button>
      </div>
    </div>
  );
}

function ErrorView({ message }: { message: string }) {
  return (
    <div className="w-full">
      <div className="flex flex-col items-center mb-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 mb-4">
          <QrCode className="h-6 w-6 text-white" />
        </div>
      </div>

      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
        <XCircle className="h-10 w-10 text-red-400 mx-auto mb-3" />
        <h2 className="text-base font-semibold text-gray-900 mb-1">Verification failed</h2>
        <p className="text-sm text-gray-500 mb-5">{message}</p>
        <div className="space-y-2">
          <Button asChild variant="outline" className="w-full">
            <Link href="/login">Go to Sign In</Link>
          </Button>
          <Button asChild variant="ghost" className="w-full text-gray-400">
            <Link href="/signup">Create a new account</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
