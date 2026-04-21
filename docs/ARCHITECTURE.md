# Architecture Document
# My Digital Card

**Version:** 1.3  
**Date:** 2026-04-21  
**Owner:** Yuvraj Sharma  
**Status:** In Development — Phase 1 Web nearly complete (settings, avatar upload, vCard, landing page pending)

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
User fills Card Builder form (quick or full builder)
  → Client validates with Zod + normalizes URLs (auto-prepends https://)
  → Duplicate platform check prevents same social platform twice
  → POST /api/v1/cards
  → NextAuth session checked (middleware)
  → Zod validates request body
  → Prisma creates Card + SocialLink records in PostgreSQL
  → User redirected to /card/[id]/created
  → Created page shows QR code (qrcode.react), copy link, print (front+back)
```

### 4.2 Guest Views a Shared Card
```
Guest opens shared URL: mydigitalcard.com/u/john-doe
  → Next.js Server Component at /u/[slug]/page.tsx
  → Prisma queries Card by slug (no auth needed)
  → If card not found or not published → 404
  → Page rendered with card data (layout driven by Card.styles snapshot)
  → Prisma creates CardView event + increments CardAnalytics.totalViews
  → Guest can click phone (tel:), email (mailto:), social links (new tab)
  → vCard download ⬜ pending
```

### 4.3 User Sets a Primary Card
```
User clicks "Set as primary" on a published card in My Cards
  → PATCH /api/v1/cards/:id/primary
  → Session verified
  → Card ownership verified (findFirst with userId)
  → Card must be published (400 if not)
  → Prisma $transaction:
      1. updateMany: set isPrimary=false on ALL user cards
      2. update: set isPrimary=true on target card
  → Client updates local React state (no page reload)
  → Amber star badge appears on that card
```

### 4.4 Admin Manages Users
```
Admin logs in → session has role: ADMIN
  → Navigates to /admin/users
  → Middleware verifies ADMIN role
  → Server Component fetches paginated users via Prisma
  → Admin can suspend/delete users
  → Actions call /api/v1/admin/users/:id
  → Prisma updates User record
```

### 4.5 Analytics Aggregation
```
User visits /analytics
  → Server Component fetches:
      - All user cards (with CardAnalytics for totals)
      - CardView events from last 30 days for all user cards
  → Builds date-bucket map: { "2026-03-22": 0, ..., "2026-04-21": 0 }
  → Increments bucket for each CardView.viewedAt date
  → Passes 30-entry array to ViewsChart (Client Component)
  → ViewsChart renders CSS flex bar chart — no external charting library
  → Per-card table shows views + clicks for each card
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

> Legend: ✅ Built | ⬜ Pending

```
apps/web/
├── app/
│   ├── (public)/
│   │   ├── page.tsx                              # Landing page ⬜
│   │   └── u/[slug]/
│   │       └── page.tsx                          # Public card view (Server Component) ✅
│   ├── (auth)/
│   │   ├── layout.tsx                            # Split two-panel auth layout ✅
│   │   ├── login/page.tsx                        # Email + Google OAuth login ✅
│   │   ├── signup/page.tsx                       # Email signup + verification ✅
│   │   ├── forgot-password/page.tsx              # Send reset email ✅
│   │   └── reset-password/page.tsx               # Token-based password reset ✅
│   ├── (user)/
│   │   ├── layout.tsx                            # UserSidebar + UserFooter ✅
│   │   ├── dashboard/page.tsx                    # Stats + 3 recent cards ✅
│   │   ├── card/
│   │   │   ├── page.tsx                          # My Cards (Server Component) ✅
│   │   │   ├── new/
│   │   │   │   ├── page.tsx                      # Choose flow (quick vs builder) ✅
│   │   │   │   ├── quick/page.tsx                # Quick card form ✅
│   │   │   │   └── builder/page.tsx              # Full builder with live preview ✅
│   │   │   └── [id]/
│   │   │       ├── edit/page.tsx                 # Edit card (Client Component) ✅
│   │   │       └── created/page.tsx              # Post-create: QR, copy link, print ✅
│   │   ├── analytics/page.tsx                    # 30-day chart + per-card stats ✅
│   │   ├── support/page.tsx                      # Submit & view support tickets ✅
│   │   └── settings/page.tsx                     # Profile, password, delete account ⬜
│   ├── (admin)/
│   │   ├── layout.tsx                            # Admin layout (SessionProvider) ✅
│   │   ├── admin/page.tsx                        # Admin dashboard ✅
│   │   ├── admin/users/page.tsx                  # User management ✅
│   │   ├── admin/cards/page.tsx                  # Card management ✅
│   │   ├── admin/templates/page.tsx              # Template list ✅
│   │   ├── admin/templates/new/page.tsx          # Create template ✅
│   │   ├── admin/templates/[id]/edit/page.tsx    # Edit template ✅
│   │   └── admin/support/page.tsx                # Support ticket management ✅
│   └── api/
│       ├── auth/[...nextauth]/route.ts           # NextAuth handler ✅
│       └── v1/
│           ├── cards/route.ts                    # GET, POST cards ✅
│           ├── cards/[id]/route.ts               # GET, PUT, DELETE card ✅
│           ├── cards/[id]/primary/route.ts       # PATCH — set primary card ✅
│           ├── templates/route.ts                # GET active templates (user) ✅
│           ├── support/tickets/route.ts          # GET, POST (user tickets) ✅
│           └── admin/
│               ├── stats/route.ts                # Platform stats ✅
│               ├── users/route.ts                # List users ✅
│               ├── users/[id]/route.ts           # PATCH, DELETE user ✅
│               ├── cards/[id]/route.ts           # PATCH, DELETE card ✅
│               ├── templates/route.ts            # GET, POST templates ✅
│               ├── templates/[id]/route.ts       # GET, PATCH, DELETE template ✅
│               └── support/
│                   ├── tickets/route.ts          # GET all tickets (admin) ✅
│                   └── tickets/[id]/route.ts     # GET, PATCH ticket ✅
├── components/
│   ├── ui/                                       # shadcn/ui primitives ✅
│   │                                             # button, input, badge, table, select,
│   │                                             # textarea, switch, dialog, dropdown-menu,
│   │                                             # avatar, separator, sheet, skeleton,
│   │                                             # tabs, form, label, tooltip
│   ├── admin/                                    # Admin portal components ✅
│   │   ├── AdminSidebar.tsx                      # Dark sidebar, Sheet on mobile ✅
│   │   ├── AdminHeader.tsx                       # Top bar + user dropdown ✅
│   │   ├── StatsCard.tsx                         # Reusable stat tile (icon, value, subtitle) ✅
│   │   ├── RecentUsers.tsx                       # Dashboard: recent users list ✅
│   │   ├── RecentCards.tsx                       # Dashboard: recent cards list ✅
│   │   ├── UsersTable.tsx                        # Users management table ✅
│   │   ├── CardsTable.tsx                        # Cards management table ✅
│   │   ├── TemplatesTable.tsx                    # Templates list + actions ✅
│   │   ├── TemplateForm.tsx                      # Create/edit template form ✅
│   │   ├── TemplatePreviewDialog.tsx             # Full preview modal ✅
│   │   ├── CardPreview.tsx                       # 8-layout renderer, front/back 3D flip ✅
│   │   └── SupportTicketsTable.tsx               # Ticket list + TicketDetailDialog ✅
│   ├── auth/                                     # Auth form components ✅
│   │   ├── LoginForm.tsx                         # ✅
│   │   ├── ForgotPasswordForm.tsx                # ✅
│   │   └── ResetPasswordForm.tsx                 # ✅
│   └── user/                                     # User portal components ✅
│       ├── UserSidebar.tsx                       # Light sidebar, Sheet on mobile ✅
│       ├── UserHeader.tsx                        # Page title + user dropdown (supports children) ✅
│       ├── DeleteCardButton.tsx                  # Trash icon → confirm → DELETE + router.refresh() ✅
│       ├── MyCardsGrid.tsx                       # Client grid: search/sort/filter, toggle, delete, primary ✅
│       ├── ViewsChart.tsx                        # CSS flex bar chart, hover tooltips, no lib ✅
│       ├── SupportPageClient.tsx                 # Submit ticket + view own tickets ✅
│       └── card/
│           └── SocialLinksEditor.tsx             # Add/remove social links, duplicate prevention ✅
└── lib/
    ├── auth.ts                                   # NextAuth config ✅
    ├── prisma.ts                                 # Prisma client singleton ✅
    ├── cloudinary.ts                             # Cloudinary config ✅
    ├── email.ts                                  # Resend email helpers ✅
    ├── types/template.ts                         # TemplateConfig type, layout/font options ✅
    ├── actions/auth.ts                           # Server actions (login, signup, etc.) ✅
    └── validations/                              # Zod schemas (auth, card) ✅
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

```bash
# Build and start all services
docker compose build web
docker compose up -d

# Schema changes — rebuild migrate container then restart
docker compose build migrate
docker compose up -d migrate web
```

Docker Compose services:
- `postgres` (`mdc_postgres`) — PostgreSQL 15 on port 5432
- `redis` (`mdc_redis`) — Redis 7 on port 6379
- `migrate` (`mdc_migrate`) — runs `prisma db push` + seed on startup, then exits
- `web` (`mdc_web`) — Next.js app on port 3000

Schema management uses `prisma db push` (not `prisma migrate dev`) — no migration files are tracked. The migrate container runs on every `docker compose up` and applies any schema drift.

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
