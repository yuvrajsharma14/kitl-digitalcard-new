import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create admin user
  const adminPassword = await bcrypt.hash("Admin@12345", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@mydigitalcard.app" },
    update: {},
    create: {
      email: "admin@mydigitalcard.app",
      name: "Admin",
      passwordHash: adminPassword,
      role: "ADMIN",
      emailVerified: new Date(),
    },
  });
  console.log(`Admin user: ${admin.email}`);

  // Create demo user
  const userPassword = await bcrypt.hash("Demo@12345", 12);
  const demo = await prisma.user.upsert({
    where: { email: "demo@mydigitalcard.app" },
    update: {},
    create: {
      email: "demo@mydigitalcard.app",
      name: "Demo User",
      passwordHash: userPassword,
      role: "USER",
      emailVerified: new Date(),
    },
  });

  // Create demo card
  const card = await prisma.card.upsert({
    where: { slug: "demo-user" },
    update: {},
    create: {
      userId: demo.id,
      slug: "demo-user",
      displayName: "Demo User",
      jobTitle: "Software Engineer",
      company: "My Digital Card",
      bio: "This is a demo digital business card.",
      email: "demo@mydigitalcard.app",
      website: "https://mydigitalcard.app",
      isPublished: true,
      socialLinks: {
        create: [
          { platform: "LINKEDIN", url: "https://linkedin.com/in/demo", order: 0 },
          { platform: "GITHUB", url: "https://github.com/demo", order: 1 },
        ],
      },
    },
  });

  await prisma.cardAnalytics.upsert({
    where: { cardId: card.id },
    update: {},
    create: { cardId: card.id },
  });

  console.log(`Demo user: ${demo.email}`);
  console.log(`Demo card: /u/demo-user`);
  console.log("Seeding complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
