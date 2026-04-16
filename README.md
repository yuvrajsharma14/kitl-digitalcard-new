# My Digital Card

A free web and mobile application to create, manage, and share digital business cards.

---

## Tech Stack

- **Next.js 14** (App Router) — Web framework
- **TypeScript** — Language
- **Tailwind CSS + shadcn/ui** — UI
- **Prisma + PostgreSQL** — Database
- **NextAuth.js v5** — Authentication
- **Redis** — Sessions & cache
- **Cloudinary** — Image storage
- **Docker** — Local development

---

## Prerequisites

- [Node.js](https://nodejs.org/) 20+
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [pnpm](https://pnpm.io/) (recommended) or npm

---

## Local Development Setup

### 1. Clone the repository

```bash
git clone <repo-url>
cd "Digital Card New"
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Set up environment variables

```bash
cp apps/web/.env.example apps/web/.env.local
```

Fill in the required values in `apps/web/.env.local`:

```env
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/mydigitalcard

# Auth
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=http://localhost:3000

# Google OAuth (optional for local dev)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Email (Resend)
RESEND_API_KEY=

# Redis
REDIS_URL=redis://localhost:6379
```

### 4. Start local services (PostgreSQL + Redis)

```bash
docker-compose up -d
```

### 5. Run database migrations

```bash
cd apps/web
pnpm prisma migrate dev
```

### 6. Seed the database (optional)

```bash
pnpm prisma db seed
```

### 7. Start the development server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Available URLs (Local)

| URL | Description |
|---|---|
| http://localhost:3000 | Public landing page |
| http://localhost:3000/login | User login |
| http://localhost:3000/signup | User sign up |
| http://localhost:3000/dashboard | User portal |
| http://localhost:3000/admin | Admin portal |
| http://localhost:3000/u/[username] | Shared card view |

---

## Project Structure

```
Digital Card New/
├── apps/
│   ├── web/               # Next.js application
│   │   ├── app/           # App Router pages
│   │   ├── components/    # UI components
│   │   ├── lib/           # Utilities, config
│   │   └── prisma/        # Schema + migrations
│   └── mobile/            # React Native + Expo (Phase 2)
├── packages/
│   └── shared/            # Shared types
├── docs/                  # Project documentation
├── docker-compose.yml
├── CLAUDE.md
└── README.md
```

---

## Documentation

| Document | Description |
|---|---|
| [BRD](docs/BRD.md) | Business Requirements |
| [PRD](docs/PRD.md) | Product Requirements & Roadmap |
| [TRD](docs/TRD.md) | Technical Requirements |
| [Architecture](docs/ARCHITECTURE.md) | System Design |
| [Database](docs/DATABASE.md) | Schema & Data Models |

---

## Docker Services

| Service | Port | Description |
|---|---|---|
| PostgreSQL | 5432 | Primary database |
| Redis | 6379 | Cache & sessions |

Stop services:
```bash
docker-compose down
```

---

## Useful Commands

```bash
# Database
pnpm prisma studio          # Open Prisma Studio (DB GUI)
pnpm prisma migrate dev     # Create & run migration
pnpm prisma migrate reset   # Reset database (dev only)
pnpm prisma generate        # Regenerate Prisma client

# Dev
pnpm dev                    # Start dev server
pnpm build                  # Build for production
pnpm lint                   # Run ESLint
pnpm type-check             # Run TypeScript checks
```

---

*My Digital Card — Built by Yuvraj Sharma*
