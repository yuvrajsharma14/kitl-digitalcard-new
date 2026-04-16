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

  // ── Card Templates ──────────────────────────────────────────────────────────
  // Only seed if no templates exist yet (idempotent)
  const templateCount = await prisma.cardTemplate.count();
  if (templateCount === 0) {
    const templates = [
      {
        name: "Corporate Blue",
        description: "Clean and professional. Ideal for finance, consulting, and corporate roles.",
        config: {
          layout: "classic",
          backgroundColor: "#f8fafc",
          textColor: "#0f172a",
          accentColor: "#2563eb",
          fontFamily: "inter",
        },
        isActive: true,
      },
      {
        name: "Dark Executive",
        description: "Sophisticated dark card for senior leadership, tech executives, and premium brands.",
        config: {
          layout: "modern",
          backgroundColor: "#0f172a",
          textColor: "#f1f5f9",
          accentColor: "#818cf8",
          fontFamily: "inter",
        },
        isActive: true,
      },
      {
        name: "Healthcare Clean",
        description: "Calm, trustworthy tone for doctors, pharmacists, therapists, and medical professionals.",
        config: {
          layout: "classic",
          backgroundColor: "#ffffff",
          textColor: "#134e4a",
          accentColor: "#0d9488",
          fontFamily: "roboto",
        },
        isActive: true,
      },
      {
        name: "Creative Vivid",
        description: "Bold and expressive. Built for designers, artists, and creative agencies.",
        config: {
          layout: "bold",
          backgroundColor: "#7c3aed",
          textColor: "#ffffff",
          accentColor: "#fbbf24",
          fontFamily: "poppins",
        },
        isActive: true,
      },
      {
        name: "Luxury Gold",
        description: "Understated elegance for lawyers, consultants, luxury brands, and hospitality.",
        config: {
          layout: "minimal",
          backgroundColor: "#1c1917",
          textColor: "#fef3c7",
          accentColor: "#d97706",
          fontFamily: "playfair",
        },
        isActive: true,
      },
      {
        name: "Startup Green",
        description: "Fresh and modern for tech founders, SaaS teams, and product managers.",
        config: {
          layout: "modern",
          backgroundColor: "#ffffff",
          textColor: "#064e3b",
          accentColor: "#10b981",
          fontFamily: "poppins",
        },
        isActive: true,
      },
      {
        name: "Real Estate Warm",
        description: "Warm, approachable tone for real estate agents, architects, and property developers.",
        config: {
          layout: "classic",
          backgroundColor: "#fff7ed",
          textColor: "#431407",
          accentColor: "#ea580c",
          fontFamily: "montserrat",
        },
        isActive: true,
      },
      {
        name: "Academic Serif",
        description: "Scholarly and authoritative. Perfect for professors, researchers, and educators.",
        config: {
          layout: "minimal",
          backgroundColor: "#fefce8",
          textColor: "#1c1917",
          accentColor: "#a16207",
          fontFamily: "playfair",
        },
        isActive: true,
      },
      {
        name: "Fitness Energy",
        description: "High-energy design for personal trainers, coaches, gyms, and wellness brands.",
        config: {
          layout: "bold",
          backgroundColor: "#16a34a",
          textColor: "#ffffff",
          accentColor: "#fef08a",
          fontFamily: "montserrat",
        },
        isActive: true,
      },
      {
        name: "Photographer Dark",
        description: "Editorial and minimal for photographers, filmmakers, and visual storytellers.",
        config: {
          layout: "minimal",
          backgroundColor: "#0c0a09",
          textColor: "#fafaf9",
          accentColor: "#d6d3d1",
          fontFamily: "inter",
        },
        isActive: true,
      },
    ];

    await prisma.cardTemplate.createMany({ data: templates });
    console.log(`Seeded ${templates.length} card templates.`);
  } else {
    console.log(`Templates already seeded (${templateCount} found), skipping.`);
  }

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
