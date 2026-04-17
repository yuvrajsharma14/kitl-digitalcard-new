import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { uploadImage } from "@/lib/cloudinary";
import { NextResponse } from "next/server";
import { z } from "zod";

const patchSchema = z.object({
  name:          z.string().min(2, "Name must be at least 2 characters").optional(),
  avatarBase64:  z.string().optional(), // data URI
  removeAvatar:  z.boolean().optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true, name: true, email: true, avatarUrl: true,
      emailVerified: true, createdAt: true,
      passwordHash: true,
      accounts: { select: { provider: true } },
    },
  });

  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({
    id:            user.id,
    name:          user.name,
    email:         user.email,
    avatarUrl:     user.avatarUrl,
    emailVerified: user.emailVerified,
    createdAt:     user.createdAt,
    hasPassword:   !!user.passwordHash,
    oauthProviders: user.accounts.map((a) => a.provider),
  });
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const { name, avatarBase64, removeAvatar } = parsed.data;
  const updateData: Record<string, unknown> = {};

  if (name !== undefined) updateData.name = name;

  if (removeAvatar) {
    updateData.avatarUrl = null;
  } else if (avatarBase64) {
    try {
      const url = await uploadImage(avatarBase64, "my-digital-card/avatars");
      updateData.avatarUrl = url;
    } catch {
      return NextResponse.json({ error: "Failed to upload image." }, { status: 500 });
    }
  }

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
  }

  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data: updateData,
    select: { id: true, name: true, email: true, avatarUrl: true },
  });

  return NextResponse.json(updated);
}
