"use server";

import { signIn } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail, sendVerificationEmail } from "@/lib/email";
import { signupSchema, forgotPasswordSchema, resetPasswordSchema } from "@/lib/validations/auth";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { AuthError } from "next-auth";

// ─────────────────────────────────────────
// Sign In
// ─────────────────────────────────────────

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  try {
    await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid email or password." };
        default:
          return { error: "Something went wrong. Please try again." };
      }
    }
    return { error: "Something went wrong. Please try again." };
  }
}

// ─────────────────────────────────────────
// Sign Up
// ─────────────────────────────────────────

export async function signupAction(data: {
  name: string;
  email: string;
  password: string;
}) {
  const parsed = signupSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  const existing = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  });
  if (existing) {
    return { error: "An account with this email already exists." };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);

  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash,
      role: "USER",
    },
  });

  // Send verification email
  const token = crypto.randomBytes(32).toString("hex");
  await prisma.verificationToken.create({
    data: {
      identifier: user.email,
      token,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    },
  });

  try {
    await sendVerificationEmail(user.email, user.name, token);
  } catch {
    // Don't block signup if email fails
  }

  return { success: true };
}

// ─────────────────────────────────────────
// Forgot Password
// ─────────────────────────────────────────

export async function forgotPasswordAction(data: { email: string }) {
  const parsed = forgotPasswordSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  });

  // Always return success — don't reveal if email exists
  if (!user) return { success: true };

  // Delete any existing tokens for this email
  await prisma.verificationToken.deleteMany({
    where: { identifier: parsed.data.email },
  });

  const token = crypto.randomBytes(32).toString("hex");
  await prisma.verificationToken.create({
    data: {
      identifier: parsed.data.email,
      token,
      expires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    },
  });

  try {
    await sendPasswordResetEmail(user.email, user.name, token);
  } catch {
    return { error: "Failed to send reset email. Please try again." };
  }

  return { success: true };
}

// ─────────────────────────────────────────
// Reset Password
// ─────────────────────────────────────────

export async function resetPasswordAction(data: {
  token: string;
  password: string;
  confirmPassword: string;
}) {
  const parsed = resetPasswordSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message };
  }

  const record = await prisma.verificationToken.findUnique({
    where: { token: parsed.data.token },
  });

  if (!record || record.expires < new Date()) {
    return { error: "This reset link is invalid or has expired." };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);

  await prisma.user.update({
    where: { email: record.identifier },
    data: { passwordHash },
  });

  await prisma.verificationToken.delete({
    where: { token: parsed.data.token },
  });

  return { success: true };
}
