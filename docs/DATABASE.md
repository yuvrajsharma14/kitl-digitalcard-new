# Database Design Document
# My Digital Card

**Version:** 1.1  
**Date:** 2026-04-21  
**Owner:** Yuvraj Sharma  
**Status:** Draft

---

## 1. Overview

Primary database is **PostgreSQL 15** managed via **Prisma ORM**. The schema is designed to support the core digital business card use case with room to grow into premium features.

---

## 2. Entity Relationship Diagram

```
┌──────────────────┐
│  CardTemplate    │
│──────────────────│
│ id (PK)          │  (no FK to Card — snapshot model)
│ name             │
│ description      │
│ thumbnailUrl     │
│ config (JSON)    │ ← { layout, backgroundColor, textColor, accentColor, fontFamily }
│ isActive         │
│ createdAt        │
│ updatedAt        │
└──────────────────┘

┌─────────────────┐         ┌──────────────────────┐
│      User       │         │         Card         │
│─────────────────│         │──────────────────────│
│ id (PK)         │────────<│ id (PK)              │
│ email           │  1 : N  │ userId (FK)          │
│ name            │         │ slug (unique)        │
│ passwordHash    │         │ displayName          │
│ role            │         │ jobTitle             │
│ avatarUrl       │         │ company              │
│ isActive        │         │ bio                  │
│ emailVerified   │         │ email                │
│ createdAt       │         │ phone                │
│ updatedAt       │         │ website              │
└─────────────────┘         │ avatarUrl            │
                            │ styles (JSON)        │ ← snapshot of template config at pick-time
                            │ isPublished          │
                            │ isPrimary            │ ← user's designated primary card
                            │ createdAt            │
                            │ updatedAt            │
                            └──────────┬───────────┘
                                       │
                    ┌──────────────────┼──────────────────┐
                    │                  │                  │
                    ▼ 1:N              ▼ 1:N              ▼ 1:N
          ┌──────────────┐   ┌──────────────────┐  ┌──────────────┐
          │  SocialLink  │   │  CardAnalytics   │  │  CardView    │
          │──────────────│   │──────────────────│  │──────────────│
          │ id (PK)      │   │ id (PK)          │  │ id (PK)      │
          │ cardId (FK)  │   │ cardId (FK)      │  │ cardId (FK)  │
          │ platform     │   │ totalViews       │  │ viewedAt     │
          │ url          │   │ totalClicks      │  │ ipAddress    │
          │ order        │   │ updatedAt        │  │ userAgent    │
          └──────────────┘   └──────────────────┘  └──────────────┘
```

---

## 3. Table Definitions

### 3.1 User

Stores all registered users including admins.

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | String (CUID) | PK | Unique user identifier |
| email | String | Unique, Not Null | User's email address |
| name | String | Not Null | Full display name |
| passwordHash | String | Nullable | Null for OAuth users |
| role | Enum | Not Null, Default: USER | USER or ADMIN |
| avatarUrl | String | Nullable | Profile photo URL (Cloudinary) |
| isActive | Boolean | Default: true | False = suspended account |
| emailVerified | DateTime | Nullable | When email was verified |
| createdAt | DateTime | Default: now() | Account creation time |
| updatedAt | DateTime | Auto-updated | Last update time |

**Indexes:** `email` (unique)

---

### 3.2 Card

A user's digital business card. One user can have multiple cards.

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | String (CUID) | PK | Unique card identifier |
| userId | String | FK → User.id | Card owner |
| slug | String | Unique, Not Null | URL-friendly identifier (e.g., "john-doe") |
| displayName | String | Not Null | Name shown on card |
| jobTitle | String | Nullable | e.g., "Software Engineer" |
| company | String | Nullable | e.g., "Acme Corp" |
| bio | String | Nullable | Short description |
| email | String | Nullable | Contact email on card |
| phone | String | Nullable | Contact phone number |
| website | String | Nullable | Personal/company website |
| avatarUrl | String | Nullable | Card profile photo (Cloudinary) |
| styles | JSON | Nullable | Snapshot of template config at pick-time: `{ layout, backgroundColor, textColor, accentColor, fontFamily }` |
| isPublished | Boolean | Default: false | Is card publicly accessible |
| isPrimary | Boolean | Default: false | User's designated primary card — only one card per user can be true at a time |
| createdAt | DateTime | Default: now() | Creation time |
| updatedAt | DateTime | Auto-updated | Last update time |

> **Note:** `styles` is a snapshot — no FK to `CardTemplate`. Changing or deleting a template never affects cards.

**Indexes:** `slug` (unique), `userId`

---

### 3.3 CardTemplate

Admin-created visual templates that users can apply when building a card.

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | String (CUID) | PK | Unique template identifier |
| name | String | Not Null | e.g., "Professional Dark" |
| description | String | Nullable | Short description shown to users |
| thumbnailUrl | String | Nullable | Preview image URL (Cloudinary) |
| config | JSON | Not Null | `{ layout, backgroundColor, textColor, accentColor, fontFamily }` |
| isActive | Boolean | Default: true | Visible to users when true |
| createdAt | DateTime | Default: now() | Creation time |
| updatedAt | DateTime | Auto-updated | Last update time |

**Config shape:**
```json
{
  "layout": "classic | modern | minimal | bold",
  "backgroundColor": "#ffffff",
  "textColor": "#1a1a2e",
  "accentColor": "#6366f1",
  "fontFamily": "inter | poppins | roboto | playfair | montserrat"
}
```

---

### 3.4 SocialLink

Social media / contact links attached to a card.

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | String (CUID) | PK | Unique link identifier |
| cardId | String | FK → Card.id | Parent card |
| platform | Enum | Not Null | LINKEDIN, TWITTER, INSTAGRAM, FACEBOOK, GITHUB, YOUTUBE, TIKTOK, OTHER |
| url | String | Not Null | Full URL |
| order | Int | Default: 0 | Display order on card |

**Indexes:** `cardId`

---

### 3.5 CardAnalytics

Aggregated analytics per card (running totals).

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | String (CUID) | PK | Unique record |
| cardId | String | FK → Card.id, Unique | One record per card |
| totalViews | Int | Default: 0 | Total page views |
| totalClicks | Int | Default: 0 | Total link/contact clicks |
| updatedAt | DateTime | Auto-updated | Last updated |

**Indexes:** `cardId` (unique)

---

### 3.6 CardView

Individual view events (for time-series analytics).

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | String (CUID) | PK | Unique view event |
| cardId | String | FK → Card.id | Card that was viewed |
| viewedAt | DateTime | Default: now() | Timestamp of view |
| ipAddress | String | Nullable | Viewer's IP (anonymized) |
| userAgent | String | Nullable | Browser/device info |

**Indexes:** `cardId`, `viewedAt`

---

### 3.7 Account (NextAuth)

OAuth account connections for users (managed by NextAuth.js).

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | String (CUID) | PK | |
| userId | String | FK → User.id | |
| type | String | Not Null | oauth, email, etc. |
| provider | String | Not Null | google, github, etc. |
| providerAccountId | String | Not Null | ID from OAuth provider |
| refresh_token | String | Nullable | |
| access_token | String | Nullable | |
| expires_at | Int | Nullable | |

**Indexes:** `provider + providerAccountId` (unique)

---

### 3.8 Session (NextAuth)

Active user sessions.

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | String (CUID) | PK | |
| sessionToken | String | Unique | |
| userId | String | FK → User.id | |
| expires | DateTime | Not Null | Session expiry |

---

### 3.9 VerificationToken (NextAuth)

Email verification and password reset tokens.

| Column | Type | Constraints | Description |
|---|---|---|---|
| identifier | String | Not Null | Email address |
| token | String | Unique | Verification token |
| expires | DateTime | Not Null | Token expiry |

---

## 4. Enums

```prisma
enum Role {
  USER
  ADMIN
}

enum SocialPlatform {
  LINKEDIN
  TWITTER
  INSTAGRAM
  FACEBOOK
  GITHUB
  YOUTUBE
  TIKTOK
  OTHER
}

enum TicketCategory {
  GENERAL
  SUGGESTION
  COMPLAINT
  BUG
  BILLING
  OTHER
}

enum TicketStatus {
  OPEN
  IN_PROGRESS
  RESOLVED
  CLOSED
}
```

---

### 3.10 SupportTicket

User-submitted support requests.

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | String (CUID) | PK | Unique ticket identifier |
| userId | String | FK → User.id | Submitting user |
| subject | String | Not Null | Short summary (max 120 chars) |
| message | String (Text) | Not Null | Full message body (max 2000 chars) |
| category | TicketCategory | Not Null | GENERAL, SUGGESTION, COMPLAINT, BUG, BILLING, OTHER |
| status | TicketStatus | Default: OPEN | OPEN, IN_PROGRESS, RESOLVED, CLOSED |
| adminNote | String (Text) | Nullable | Admin response visible to user |
| createdAt | DateTime | Default: now() | Submission time |
| updatedAt | DateTime | Auto-updated | Last update time |

**Indexes:** `userId`, `status`, `createdAt`

---

## 5. Relationships Summary

| Relationship | Type | Notes |
|---|---|---|
| User → Cards | One-to-Many | A user can have multiple cards |
| User → SupportTickets | One-to-Many | A user can submit multiple tickets |
| Card → SocialLinks | One-to-Many | A card can have multiple social links |
| Card → CardAnalytics | One-to-One | One analytics record per card |
| Card → CardViews | One-to-Many | Many view events per card |
| User → Accounts | One-to-Many | Multiple OAuth providers per user |
| User → Sessions | One-to-Many | Multiple active sessions |
| CardTemplate → Card | None (snapshot) | No FK — template config is copied into Card.styles at pick-time |

---

## 6. Prisma Schema (Draft)

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role {
  USER
  ADMIN
}

enum SocialPlatform {
  LINKEDIN
  TWITTER
  INSTAGRAM
  FACEBOOK
  GITHUB
  YOUTUBE
  TIKTOK
  OTHER
}

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String
  passwordHash  String?
  role          Role      @default(USER)
  avatarUrl     String?
  isActive      Boolean   @default(true)
  emailVerified DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  cards    Card[]
  accounts Account[]
  sessions Session[]
}

model Card {
  id          String   @id @default(cuid())
  userId      String
  slug        String   @unique
  displayName String
  jobTitle    String?
  company     String?
  bio         String?
  email       String?
  phone       String?
  website     String?
  avatarUrl   String?
  styles      Json?    // snapshot of template config: { layout, backgroundColor, textColor, accentColor, fontFamily }
  isPublished Boolean  @default(false)
  isPrimary   Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  user        User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  socialLinks SocialLink[]
  analytics   CardAnalytics?
  views       CardView[]

  @@index([userId])
}

model CardTemplate {
  id           String   @id @default(cuid())
  name         String
  description  String?
  thumbnailUrl String?
  config       Json     // { layout, backgroundColor, textColor, accentColor, fontFamily }
  isActive     Boolean  @default(true)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

model SocialLink {
  id       String         @id @default(cuid())
  cardId   String
  platform SocialPlatform
  url      String
  order    Int            @default(0)

  card Card @relation(fields: [cardId], references: [id], onDelete: Cascade)

  @@index([cardId])
}

model CardAnalytics {
  id          String   @id @default(cuid())
  cardId      String   @unique
  totalViews  Int      @default(0)
  totalClicks Int      @default(0)
  updatedAt   DateTime @updatedAt

  card Card @relation(fields: [cardId], references: [id], onDelete: Cascade)
}

model CardView {
  id        String   @id @default(cuid())
  cardId    String
  viewedAt  DateTime @default(now())
  ipAddress String?
  userAgent String?

  card Card @relation(fields: [cardId], references: [id], onDelete: Cascade)

  @@index([cardId])
  @@index([viewedAt])
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}
```

---

## 7. Migration Strategy

- All schema changes via `prisma migrate dev` (development)
- Production migrations via `prisma migrate deploy`
- Never edit the database directly — always go through Prisma migrations
- Migration files committed to version control

---

*Document maintained by: Yuvraj Sharma*
