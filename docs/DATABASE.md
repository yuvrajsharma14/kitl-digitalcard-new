# Database Design Document
# My Digital Card

**Version:** 1.0  
**Date:** 2026-04-16  
**Owner:** Yuvraj Sharma  
**Status:** Draft

---

## 1. Overview

Primary database is **PostgreSQL 15** managed via **Prisma ORM**. The schema is designed to support the core digital business card use case with room to grow into premium features.

---

## 2. Entity Relationship Diagram

```
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
                            │ theme                │
                            │ isPublished          │
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
| theme | String | Default: "default" | Card color theme |
| isPublished | Boolean | Default: false | Is card publicly accessible |
| createdAt | DateTime | Default: now() | Creation time |
| updatedAt | DateTime | Auto-updated | Last update time |

**Indexes:** `slug` (unique), `userId`

---

### 3.3 SocialLink

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

### 3.4 CardAnalytics

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

### 3.5 CardView

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

### 3.6 Account (NextAuth)

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

### 3.7 Session (NextAuth)

Active user sessions.

| Column | Type | Constraints | Description |
|---|---|---|---|
| id | String (CUID) | PK | |
| sessionToken | String | Unique | |
| userId | String | FK → User.id | |
| expires | DateTime | Not Null | Session expiry |

---

### 3.8 VerificationToken (NextAuth)

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
```

---

## 5. Relationships Summary

| Relationship | Type | Notes |
|---|---|---|
| User → Cards | One-to-Many | A user can have multiple cards |
| Card → SocialLinks | One-to-Many | A card can have multiple social links |
| Card → CardAnalytics | One-to-One | One analytics record per card |
| Card → CardViews | One-to-Many | Many view events per card |
| User → Accounts | One-to-Many | Multiple OAuth providers per user |
| User → Sessions | One-to-Many | Multiple active sessions |

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
  theme       String   @default("default")
  isPublished Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  user        User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  socialLinks SocialLink[]
  analytics   CardAnalytics?
  views       CardView[]

  @@index([userId])
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
