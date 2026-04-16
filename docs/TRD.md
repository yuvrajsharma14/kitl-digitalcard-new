# Technical Requirements Document (TRD)
# My Digital Card

**Version:** 1.0  
**Date:** 2026-04-16  
**Owner:** Yuvraj Sharma  
**Status:** Draft

---

## 1. Overview

This document defines the technical architecture, stack decisions, infrastructure, and implementation standards for My Digital Card — a free web and hybrid mobile application for creating and sharing digital business cards.

---

## 2. Technology Stack

### 2.1 Frontend — Web

| Layer | Technology | Version | Reason |
|---|---|---|---|
| Framework | Next.js (App Router) | 14.x | Full-stack React, SSR/SSG, API routes, single repo for all web surfaces |
| Language | TypeScript | 5.x | Type safety, better DX, fewer runtime bugs |
| Styling | Tailwind CSS | 3.x | Utility-first, fast to build, consistent design |
| UI Components | shadcn/ui | Latest | Pre-built accessible components, no heavy design system needed |
| Icons | Lucide React | Latest | Clean, consistent icon set |
| Forms | React Hook Form + Zod | Latest | Performant forms with schema-based validation |
| State Management | Zustand | Latest | Lightweight global state (no Redux overhead) |
| QR Code | qrcode.react | Latest | Simple QR code generation |

### 2.2 Backend

| Layer | Technology | Reason |
|---|---|---|
| API | Next.js API Routes (App Router) | Co-located with frontend, no separate server needed |
| ORM | Prisma | Type-safe DB queries, migrations, schema management |
| Authentication | NextAuth.js v5 (Auth.js) | Session management, OAuth, credentials provider |
| File Uploads | Cloudinary | Profile photos, image optimization, free tier available |
| Email | Resend | Transactional email (verification, password reset), simple API |

### 2.3 Database & Infrastructure

| Layer | Technology | Environment |
|---|---|---|
| Primary Database | PostgreSQL 15 | Docker (local) / Railway (production) |
| Cache / Sessions | Redis | Docker (local) / Railway (production) |
| Containerization | Docker + Docker Compose | Local development |
| Deployment | Vercel | Web app (frontend + API routes) |
| Media Storage | Cloudinary | Profile photos |

### 2.4 Mobile (Phase 2)

| Layer | Technology | Reason |
|---|---|---|
| Framework | React Native + Expo | Hybrid (iOS + Android), reuses React/TypeScript knowledge |
| Navigation | Expo Router | File-based routing (same mental model as Next.js) |
| Styling | NativeWind | Tailwind CSS for React Native |
| QR Scanner | expo-camera | Scan QR codes from other cards |
| NFC | expo-nfc-manager | NFC tap-to-share (optional) |
| Share | expo-sharing | Native share sheet |

---

## 3. Project Structure

```
my-digital-card/
├── apps/
│   ├── web/                    # Next.js app
│   │   ├── app/
│   │   │   ├── (public)/       # Landing page, shared card views
│   │   │   ├── (auth)/         # Login, signup, forgot password
│   │   │   ├── (user)/         # User portal (protected)
│   │   │   ├── (admin)/        # Admin portal (protected)
│   │   │   └── api/            # API routes
│   │   ├── components/         # Shared UI components
│   │   ├── lib/                # Utilities, helpers, config
│   │   ├── prisma/             # Schema, migrations
│   │   └── public/             # Static assets
│   └── mobile/                 # React Native + Expo (Phase 2)
├── packages/
│   └── shared/                 # Shared TypeScript types, utils
├── docs/                       # All project documentation
├── docker-compose.yml          # Local dev environment
├── CLAUDE.md                   # Claude AI context file
└── README.md                   # Developer setup guide
```

---

## 4. Architecture Decisions

### 4.1 Monorepo
Using Turborepo to manage the monorepo. Enables shared types between web and mobile and unified dependency management.

### 4.2 App Router (Next.js)
Using Next.js App Router (not Pages Router) for:
- Server Components by default (better performance)
- Route groups for clean separation of admin / user / public areas
- Built-in layouts per section

### 4.3 Route Groups
| Group | Path | Access |
|---|---|---|
| `(public)` | `/`, `/u/[username]` | No auth required |
| `(auth)` | `/login`, `/signup`, `/reset-password` | Redirect if logged in |
| `(user)` | `/dashboard`, `/card/*` | Requires user auth |
| `(admin)` | `/admin/*` | Requires admin role |

### 4.4 Database Choice
PostgreSQL chosen over MongoDB because:
- Structured, relational data (users → cards → analytics)
- Strong ACID guarantees
- Prisma ORM has excellent PostgreSQL support

### 4.5 No Separate Backend Server
All API logic lives in Next.js API Routes to reduce infrastructure complexity for a solo developer. If the product scales significantly, API routes can be extracted into a separate service later.

---

## 5. Authentication & Authorization

| Feature | Implementation |
|---|---|
| Session strategy | JWT stored in HTTP-only cookie |
| Password hashing | bcrypt (via NextAuth) |
| Role-based access | `role` field on User model (`USER`, `ADMIN`) |
| Protected routes | Middleware checks session role |
| OAuth | Google (Phase 1), more providers in future |
| Email verification | Token-based, sent via Resend |
| Password reset | Time-limited token, sent via Resend |

---

## 6. API Design

- RESTful API conventions
- All API routes under `/api/v1/`
- JSON request/response
- Authentication via session cookie
- Zod validation on all request bodies

### Core Endpoints

```
POST   /api/v1/auth/signup
POST   /api/v1/auth/login
POST   /api/v1/auth/logout
POST   /api/v1/auth/forgot-password
POST   /api/v1/auth/reset-password

GET    /api/v1/cards                  # List user's cards
POST   /api/v1/cards                  # Create card
GET    /api/v1/cards/:id              # Get card
PUT    /api/v1/cards/:id              # Update card
DELETE /api/v1/cards/:id              # Delete card

GET    /api/v1/public/cards/:username # Public card view (no auth)

GET    /api/v1/admin/users            # Admin: list users
PUT    /api/v1/admin/users/:id        # Admin: update user status
GET    /api/v1/admin/stats            # Admin: platform statistics
```

---

## 7. Security Requirements

| Area | Requirement |
|---|---|
| HTTPS | Enforced in production via Vercel |
| Password | Minimum 8 characters, bcrypt hashed |
| API | All non-public routes require valid session |
| Admin | Separate role check on all `/admin/*` routes |
| Input | All inputs validated with Zod schemas |
| File uploads | Type and size validation, served via Cloudinary CDN |
| Rate limiting | Applied to auth endpoints to prevent brute force |
| CSRF | NextAuth handles CSRF protection |
| SQL injection | Prisma ORM prevents raw SQL injection |

---

## 8. Performance Requirements

| Metric | Target |
|---|---|
| Page load (LCP) | < 3 seconds |
| API response time | < 500ms (p95) |
| QR code generation | Client-side (no server round-trip) |
| Images | Served via Cloudinary CDN with optimization |
| Database queries | Indexed on frequently queried fields |

---

## 9. Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/mydigitalcard

# Auth
NEXTAUTH_SECRET=
NEXTAUTH_URL=

# Google OAuth
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

---

## 10. Development Environment

Local development runs entirely via Docker Compose:
- PostgreSQL on port `5432`
- Redis on port `6379`
- Next.js dev server on port `3000`

See `docker-compose.yml` and `README.md` for setup instructions.

---

## 11. Deployment

| Service | Provider | Notes |
|---|---|---|
| Web App | Vercel | Auto-deploys from main branch |
| PostgreSQL | Railway | Managed PostgreSQL |
| Redis | Railway | Managed Redis |
| Media | Cloudinary | CDN-hosted images |
| Domain | TBD | Custom domain for production |

---

*Document maintained by: Yuvraj Sharma*
