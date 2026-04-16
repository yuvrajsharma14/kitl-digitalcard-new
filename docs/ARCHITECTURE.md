# Architecture Document
# My Digital Card

**Version:** 1.0  
**Date:** 2026-04-16  
**Owner:** Yuvraj Sharma  
**Status:** Draft

---

## 1. System Overview

My Digital Card is a full-stack web and mobile application. The web application is a Next.js monolith serving three distinct surfaces: a public landing page, a user portal, and an admin portal. A hybrid mobile app (React Native + Expo) will be added in Phase 2.

---

## 2. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENTS                              │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  Web Browser │  │ Mobile App   │  │  Shared Card     │  │
│  │  (User/Admin)│  │ (Expo/RN)    │  │  Viewer (Guest)  │  │
│  └──────┬───────┘  └──────┬───────┘  └────────┬─────────┘  │
└─────────┼─────────────────┼───────────────────┼────────────┘
          │                 │                   │
          ▼                 ▼                   ▼
┌─────────────────────────────────────────────────────────────┐
│                    NEXT.JS APPLICATION                      │
│                    (Vercel Deployment)                      │
│                                                             │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                   ROUTE GROUPS                         │ │
│  │  ┌────────────┐  ┌────────────┐  ┌──────────────────┐ │ │
│  │  │  (public)  │  │   (user)   │  │     (admin)      │ │ │
│  │  │            │  │            │  │                  │ │ │
│  │  │ Landing    │  │ Dashboard  │  │ Admin Dashboard  │ │ │
│  │  │ Page       │  │ Card       │  │ User Management  │ │ │
│  │  │            │  │ Builder    │  │ Analytics        │ │ │
│  │  │ /u/:user   │  │ Settings   │  │                  │ │ │
│  │  └────────────┘  └────────────┘  └──────────────────┘ │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                   API ROUTES (/api/v1/)                │ │
│  │  auth | cards | public | admin | uploads               │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              MIDDLEWARE (Auth Guard)                   │ │
│  │  • Checks session for /dashboard, /admin routes        │ │
│  │  • Role-based access (USER vs ADMIN)                   │ │
│  └────────────────────────────────────────────────────────┘ │
└───────────────────────┬─────────────────────────────────────┘
                        │
          ┌─────────────┼──────────────┐
          ▼             ▼              ▼
┌──────────────┐ ┌─────────────┐ ┌──────────────┐
│  PostgreSQL  │ │    Redis    │ │  Cloudinary  │
│  (Primary DB)│ │  (Cache /   │ │  (Image CDN) │
│  Railway     │ │   Sessions) │ │              │
└──────────────┘ └─────────────┘ └──────────────┘
```

---

## 3. Application Layers

### 3.1 Presentation Layer (Next.js App Router)
- **Server Components** — default for all pages, data fetched server-side
- **Client Components** — used only for interactive elements (card builder, forms)
- **Route Groups** — clean separation of public / user / admin areas
- **Layouts** — shared layout per section (user layout, admin layout)

### 3.2 API Layer (Next.js API Routes)
- RESTful endpoints under `/api/v1/`
- Request validation via Zod schemas
- Auth checks via NextAuth session
- Role checks for admin routes

### 3.3 Data Layer (Prisma + PostgreSQL)
- Prisma ORM for all database interactions
- Migrations managed via `prisma migrate`
- Connection pooling via Prisma connection pool

### 3.4 Cache Layer (Redis)
- Session storage (NextAuth with Redis adapter)
- Rate limiting counters (auth endpoints)
- Future: card view analytics buffering

---

## 4. Data Flow

### 4.1 User Creates a Card
```
User fills Card Builder form
  → Client validates with Zod
  → POST /api/v1/cards
  → NextAuth session checked (middleware)
  → Zod validates request body
  → Prisma creates Card record in PostgreSQL
  → If photo uploaded → Cloudinary upload → URL saved to Card
  → Card published → unique URL generated: /u/[username]
  → Response returned to client
  → User redirected to dashboard
```

### 4.2 Guest Views a Shared Card
```
Guest opens shared URL: mydigitalcard.com/u/john-doe
  → Next.js Server Component renders page
  → Prisma queries Card by username (no auth needed)
  → Page rendered with card data
  → Analytics event recorded (view count++)
  → Guest can download vCard (.vcf) or click links
```

### 4.3 Admin Manages Users
```
Admin logs in → session has role: ADMIN
  → Navigates to /admin/users
  → Middleware verifies ADMIN role
  → Server Component fetches paginated users via Prisma
  → Admin can suspend/delete users
  → Actions call /api/v1/admin/users/:id
  → Prisma updates User record
```

---

## 5. Authentication Flow

```
User visits /login
  → Enters email + password
  → POST to NextAuth /api/auth/signin
  → NextAuth verifies credentials against DB (bcrypt compare)
  → Session created, JWT stored in HTTP-only cookie
  → User redirected to /dashboard

  OR

  → Clicks "Sign in with Google"
  → OAuth flow with Google
  → User record created/found in DB
  → Session created
  → User redirected to /dashboard
```

---

## 6. Component Architecture (Web)

```
apps/web/
├── app/
│   ├── (public)/
│   │   ├── page.tsx                 # Landing page
│   │   └── u/[username]/
│   │       └── page.tsx             # Public card view
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   └── reset-password/page.tsx
│   ├── (user)/
│   │   ├── layout.tsx               # User portal layout (sidebar/nav)
│   │   ├── dashboard/page.tsx       # User's cards overview
│   │   ├── card/
│   │   │   ├── new/page.tsx         # Card builder (new)
│   │   │   └── [id]/edit/page.tsx   # Card builder (edit)
│   │   └── settings/page.tsx        # Account settings
│   ├── (admin)/
│   │   ├── layout.tsx               # Admin portal layout
│   │   ├── admin/page.tsx           # Admin dashboard
│   │   ├── admin/users/page.tsx     # User management
│   │   └── admin/cards/page.tsx     # Card management
│   └── api/
│       └── v1/
│           ├── auth/[...nextauth]/route.ts
│           ├── cards/route.ts
│           ├── cards/[id]/route.ts
│           ├── public/cards/[username]/route.ts
│           └── admin/
│               ├── users/route.ts
│               └── stats/route.ts
├── components/
│   ├── ui/                          # shadcn/ui base components
│   ├── card/                        # Card-specific components
│   │   ├── CardBuilder.tsx
│   │   ├── CardPreview.tsx
│   │   └── CardQRCode.tsx
│   ├── admin/                       # Admin-specific components
│   └── shared/                      # Shared across portals
└── lib/
    ├── auth.ts                      # NextAuth config
    ├── prisma.ts                    # Prisma client singleton
    ├── cloudinary.ts                # Cloudinary config
    └── validations/                 # Zod schemas
```

---

## 7. Mobile Architecture (Phase 2)

```
apps/mobile/
├── app/
│   ├── (public)/
│   │   └── card/[username].tsx      # View shared card
│   ├── (auth)/
│   │   ├── login.tsx
│   │   └── signup.tsx
│   └── (tabs)/
│       ├── index.tsx                # My cards
│       ├── create.tsx               # Card builder
│       ├── scan.tsx                 # QR code scanner
│       └── settings.tsx
├── components/
└── lib/
    └── api.ts                       # Shared API calls to web backend
```

Mobile calls the **same API** as the web app — no separate backend needed.

---

## 8. Local Development Setup

```
docker-compose up -d     # Start PostgreSQL + Redis
npm run dev              # Start Next.js dev server
```

Docker Compose services:
- `postgres` — PostgreSQL 15 on port 5432
- `redis` — Redis 7 on port 6379

---

## 9. Deployment Architecture

```
┌────────────────────┐
│      Vercel        │  ← Next.js App (web + API)
│  mydigitalcard.com │
└────────┬───────────┘
         │
         ├──────────────────────────┐
         ▼                          ▼
┌─────────────────┐       ┌──────────────────┐
│    Railway      │       │   Cloudinary     │
│  ┌───────────┐  │       │  (Image CDN)     │
│  │PostgreSQL │  │       └──────────────────┘
│  └───────────┘  │
│  ┌───────────┐  │
│  │  Redis    │  │
│  └───────────┘  │
└─────────────────┘
```

---

*Document maintained by: Yuvraj Sharma*
