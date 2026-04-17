# CLAUDE.md — My Digital Card

This file gives Claude (AI assistant) full context about this project so it can assist effectively across all conversations.

---

## Project Overview

**Product Name:** My Digital Card  
**Type:** Web + Hybrid Mobile Application  
**Purpose:** Free app to create, manage, and share digital business cards — replacing traditional physical business cards  
**Owner:** Yuvraj Sharma (solo developer)  
**Status:** Active development — Phase 1 (Web)

---

## Tech Stack

### Web (Phase 1 — Current)
| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Forms | React Hook Form + Zod |
| State | Zustand |
| Auth | NextAuth.js v5 |
| ORM | Prisma |
| Database | PostgreSQL 15 |
| Cache | Redis |
| File Storage | Cloudinary |
| Email | Resend |
| QR Code | qrcode.react |

### Mobile (Phase 2 — Future)
| Layer | Technology |
|---|---|
| Framework | React Native + Expo |
| Navigation | Expo Router |
| Styling | NativeWind |

### Infrastructure
| Layer | Technology |
|---|---|
| Local Dev | Docker + Docker Compose |
| Deployment | Vercel (web) |
| Database Hosting | Railway |
| Monorepo | Turborepo |

---

## Project Structure

```
Digital Card New/
├── apps/
│   ├── web/               # Next.js app (all web surfaces)
│   └── mobile/            # React Native + Expo (Phase 2)
├── packages/
│   └── shared/            # Shared types and utilities
├── docs/
│   ├── BRD.md             # Business Requirements
│   ├── PRD.md             # Product Requirements
│   ├── TRD.md             # Technical Requirements
│   ├── ARCHITECTURE.md    # System architecture
│   └── DATABASE.md        # Database schema
├── docker-compose.yml     # Local dev environment
├── CLAUDE.md              # This file
└── README.md              # Developer setup
```

---

## Application Surfaces

| Surface | Route | Auth Required |
|---|---|---|
| Public Landing Page | `/` | No |
| Shared Card View | `/u/[username]` | No (guest access) |
| Login / Signup | `/login`, `/signup` | No (redirect if logged in) |
| User Dashboard | `/dashboard` | Yes (USER role) |
| Card Builder | `/card/new`, `/card/[id]/edit` | Yes (USER role) |
| User Settings | `/settings` | Yes (USER role) |
| Admin Portal | `/admin/*` | Yes (ADMIN role) |

---

## Key Conventions

- **TypeScript everywhere** — no plain JS files
- **Server Components by default** — use `"use client"` only when needed (forms, interactivity)
- **Zod for all validation** — both client and API side
- **Prisma for all DB queries** — no raw SQL
- **shadcn/ui for components** — don't build UI from scratch
- **API routes under `/api/v1/`** — versioned from the start
- **Environment variables** — never hardcode secrets, always use `.env.local`

---

## Database Models (Summary)

| Model | Description |
|---|---|
| User | Registered users (role: USER or ADMIN) |
| Card | Digital business cards (slug = public URL). `styles Json?` stores snapshot of applied template config |
| CardTemplate | Admin-created visual templates. No FK to Card — config is copied (snapshot) when user picks a template |
| SocialLink | Social media links on a card |
| CardAnalytics | Aggregated view/click counts per card |
| CardView | Individual view events (time-series) |
| Account | OAuth accounts (NextAuth) |
| Session | Active sessions (NextAuth) |
| VerificationToken | Email/password reset tokens |

---

## User Roles

| Role | Access |
|---|---|
| Guest | Landing page, view shared cards |
| USER | Create/manage own cards, dashboard, settings |
| ADMIN | Full admin portal, user management, platform analytics |

---

## Build Progress (Phase 1)

| # | Task | Status |
|---|---|---|
| 1 | Project scaffolding (Turborepo, Docker, Next.js, Prisma) | ✅ Done |
| 2 | Database schema + Prisma setup | ✅ Done |
| 3 | Authentication (signup, login, Google OAuth, email verification) | ✅ Done |
| 4 | Admin Portal — Dashboard, User Management, Card Management | ✅ Done |
| 4a | Admin Portal — Card Template Management | ✅ Done |
| 4b | Support Tickets (user submit + admin manage) | ✅ Done |
| 5 | User Portal — Card Builder | ⬜ Pending |
| 6 | User Portal — Dashboard & Settings | ⬜ Pending |
| 7 | Public pages — Landing page, shared card view | ⬜ Pending |
| 8 | QR code generation | ⬜ Pending |
| 9 | vCard download | ⬜ Pending |
| 10 | Analytics | ⬜ Pending |

### What's been built

**Project Structure**
- Turborepo monorepo with `apps/web`, `apps/mobile` (placeholder), `packages/shared`
- Docker Compose with PostgreSQL 15 + Redis 7
- Next.js 14 App Router with all route groups: `(public)`, `(auth)`, `(user)`, `(admin)`
- Prisma schema with full migration-ready schema
- NextAuth.js v5 wired (credentials + Google), middleware protecting all routes
- Zod validation schemas for auth and card
- Shared TypeScript types + constants in `packages/shared`

**Authentication** (`/login`, `/signup`, `/forgot-password`, `/reset-password`)
- `LoginForm` — email/password + Google OAuth, role-based redirect (ADMIN → /admin, USER → /dashboard)
- `ForgotPasswordForm` — sends reset email via Resend, success state UI
- `ResetPasswordForm` — token validation, password update with rules hint, auto-redirect
- Server actions in `lib/actions/auth.ts` — loginAction, signupAction, forgotPasswordAction, resetPasswordAction
- Auth layout — split two-panel (branding left, form right)
- Middleware updated — protects /admin, /dashboard, /card, /settings; redirects logged-in users away from auth pages

**Admin Portal** (`/admin/*`)
- `AdminSidebar` — dark sidebar, responsive (Sheet drawer on mobile)
- `AdminHeader` — page title + user avatar dropdown
- `StatsCard` — reusable stat card component
- Dashboard page — 4 live stats (users, cards, published, views) + recent users/cards tables
- Users page — searchable paginated table, suspend/activate/delete actions
- Cards page — searchable paginated table, publish/unpublish/delete actions
- API routes: `GET/PATCH/DELETE /api/v1/admin/users/[id]`, `PATCH/DELETE /api/v1/admin/cards/[id]`

**Admin Card Template Management** (`/admin/templates/*`)
- `TemplatesTable` — lists all templates with layout, colors, font, status (active/inactive); inline preview, edit, activate/deactivate, delete actions
- `TemplateForm` — create/edit template form (name, description, layout, colors, font, field toggles); live `CardPreview` on the right panel
- `TemplatePreviewDialog` — full-screen preview modal launched from the templates table
- `CardPreview` — 8 layout renderers (Classic, Modern, Minimal, Bold, Elegant, Sharp, Profile, Side Panel); Front/Back flip toggle with CSS 3D animation; front shows full card with sample data, back shows QR code + name + title + company
- API routes: `GET/POST /api/v1/admin/templates`, `GET/PATCH/DELETE /api/v1/admin/templates/[id]`
- Template config: layout, backgroundColor, textColor, accentColor, fontFamily, fields (14 toggleable fields)
- Template snapshot pattern: config is copied into Card.styles when user picks a template — no live FK

**Seeded test accounts**
- Admin: `admin@mydigitalcard.app` / `Admin@12345`
- Demo user: `demo@mydigitalcard.app` / `Demo@12345`

---

## Important Notes for Claude

- This is a **solo developer project** — keep solutions simple and maintainable
- **Do not over-engineer** — no microservices, no separate backend, keep it in Next.js
- **Do not add features** beyond what is in the PRD without asking
- Always check `docs/PRD.md` for feature scope before implementing
- Always check `docs/DATABASE.md` before modifying the Prisma schema
- Always check `docs/TRD.md` for tech decisions before suggesting alternatives
- **Mobile is Phase 2** — do not build mobile code until Phase 1 web is complete
- The project lives at: `/Users/yuvrajsharma/Documents/GitHub/Digital Card New/`

---

## Documentation Files

| File | Purpose |
|---|---|
| `docs/BRD.md` | Business goals, target users, success metrics |
| `docs/PRD.md` | Features, user stories, roadmap, priorities |
| `docs/TRD.md` | Tech stack, API design, security, env vars |
| `docs/ARCHITECTURE.md` | System design, component structure, data flow |
| `docs/DATABASE.md` | Full Prisma schema, ERD, table definitions |
| `CLAUDE.md` | This file — Claude's project context |
| `README.md` | Local setup instructions |

---

**Support Tickets** (`/admin/support`, `/support`)
- `SupportTicketsTable` — lists all tickets; search by subject/user; filter by status + category; sort by subject/category/status/date; row-click or "View" button opens detail
- `TicketDetailDialog` — shows full message, user info, category; admin can update status + write a response note
- User page at `/support` — submit new ticket (subject, category, message) + view own tickets with admin responses
- API: `POST/GET /api/v1/support/tickets` (user), `GET /api/v1/admin/support/tickets`, `GET/PATCH /api/v1/admin/support/tickets/[id]`
- Ticket categories: GENERAL, SUGGESTION, COMPLAINT, BUG, BILLING, OTHER
- Ticket statuses: OPEN, IN_PROGRESS, RESOLVED, CLOSED

*Last updated: 2026-04-17 — Support Tickets complete*
