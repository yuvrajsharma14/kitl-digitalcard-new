# Product Requirements Document (PRD)
# My Digital Card

**Version:** 1.0  
**Date:** 2026-04-16  
**Owner:** Yuvraj Sharma  
**Status:** Draft

---

## 1. Product Overview

My Digital Card is a free web and hybrid mobile application for creating, managing, and sharing digital business cards. Users can build a professional card, share it via QR code or link, and manage their digital identity from any device.

---

## 2. Platforms

| Platform | Technology | Phase |
|---|---|---|
| Web App (User Portal) | Next.js | Phase 1 |
| Admin Portal | Next.js | Phase 1 |
| Public Landing Page | Next.js | Phase 1 |
| Mobile App (iOS + Android) | React Native + Expo | Phase 2 |

---

## 3. User Roles

| Role | Description |
|---|---|
| **Guest** | Visits landing page, views a shared card (no login required) |
| **Registered User** | Creates and manages their own digital card(s) |
| **Admin** | Manages the platform via the Admin Portal |

---

## 4. Feature Breakdown

### 4.1 Public Landing Page

| # | Feature | Priority |
|---|---|---|
| 1 | Product description & value proposition | Must Have |
| 2 | Feature highlights section | Must Have |
| 3 | Call to action — Sign Up / Get Started | Must Have |
| 4 | How it works section | Must Have |
| 5 | Responsive design (mobile + desktop) | Must Have |
| 6 | SEO optimization | Should Have |

---

### 4.2 User Authentication

| # | Feature | Priority |
|---|---|---|
| 1 | Sign up with email + password | Must Have |
| 2 | Login with email + password | Must Have |
| 3 | Google OAuth login | Should Have |
| 4 | Forgot password / reset password | Must Have |
| 5 | Email verification on sign up | Should Have |
| 6 | Persistent session (remember me) | Should Have |

---

### 4.3 Digital Card Builder (User Portal)

| # | Feature | Priority |
|---|---|---|
| 1 | Create a new digital card | Must Have |
| 2 | Add name, job title, company, bio | Must Have |
| 3 | Add profile photo | Must Have |
| 4 | Add contact info (phone, email, website) | Must Have |
| 5 | Add social links (LinkedIn, Twitter, Instagram, etc.) | Must Have |
| 6 | Choose from card templates | Should Have |
| 7 | Customize card colors / theme | Should Have |
| 8 | Preview card before publishing | Must Have |
| 9 | Publish / unpublish card | Must Have |
| 10 | Edit existing card | Must Have |
| 11 | Multiple cards per user | Should Have |

---

### 4.4 Card Sharing

| # | Feature | Priority |
|---|---|---|
| 1 | Unique shareable URL per card (e.g., mydigitalcard.com/u/username) | Must Have |
| 2 | QR code generation for each card | Must Have |
| 3 | Download QR code as PNG | Should Have |
| 4 | Copy link to clipboard | Must Have |
| 5 | Share via native share (mobile) | Should Have |
| 6 | NFC tap-to-share (mobile Phase 2) | Nice to Have |

---

### 4.5 Public Card View (Guest Access)

| # | Feature | Priority |
|---|---|---|
| 1 | View shared card without login | Must Have |
| 2 | Save contact as vCard (.vcf) download | Must Have |
| 3 | Click-to-call / click-to-email | Must Have |
| 4 | Social links open in browser | Must Have |
| 5 | Mobile-optimized card view | Must Have |

---

### 4.6 User Dashboard

| # | Feature | Priority |
|---|---|---|
| 1 | View all created cards | Must Have |
| 2 | Card analytics — total views, link clicks | Should Have |
| 3 | Manage profile settings | Must Have |
| 4 | Change password | Must Have |
| 5 | Delete account | Must Have |

---

### 4.7 Admin Portal

| # | Feature | Priority |
|---|---|---|
| 1 | Admin login (separate from user login) | Must Have |
| 2 | Dashboard — total users, total cards, active cards | Must Have |
| 3 | User management — list, search, view, suspend, delete | Must Have |
| 4 | Card management — list, search, view, deactivate | Must Have |
| 5 | Analytics overview — signups over time, cards created | Should Have |
| 6 | Manage card templates | Should Have |

---

## 5. User Stories

### Guest
- As a guest, I can visit the landing page and understand the product.
- As a guest, I can view a shared digital card without creating an account.
- As a guest, I can save a shared card as a contact to my phone.

### Registered User
- As a user, I can sign up and create my digital business card.
- As a user, I can customize my card with my photo, contact info, and social links.
- As a user, I can share my card via a QR code or link.
- As a user, I can see how many times my card has been viewed.
- As a user, I can update my card anytime and changes are instantly live.

### Admin
- As an admin, I can log in to the admin portal.
- As an admin, I can view all registered users and their cards.
- As an admin, I can suspend or delete users who violate policies.
- As an admin, I can view platform-wide analytics.

---

## 6. Phased Roadmap

### Phase 1 — Web (Current)
- Landing page
- User authentication
- Card builder + sharing
- User dashboard
- Admin portal

### Phase 2 — Mobile
- React Native + Expo app
- All Phase 1 features on mobile
- Native share sheet integration
- NFC tap-to-share (optional)

### Phase 3 — Growth (Future)
- Premium features (custom domain, advanced analytics)
- Team / organization accounts
- CRM integrations
- Branded QR codes

---

## 7. Non-Functional Requirements

| Category | Requirement |
|---|---|
| **Performance** | Page load under 3 seconds |
| **Responsiveness** | Works on mobile, tablet, desktop |
| **Accessibility** | WCAG 2.1 AA compliant |
| **Security** | HTTPS, hashed passwords, protected API routes |
| **Privacy** | GDPR-aware, no unnecessary data collection |
| **Uptime** | 99.5% uptime target |

---

*Document maintained by: Yuvraj Sharma*
