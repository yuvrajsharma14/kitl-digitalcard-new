// ─────────────────────────────────────────
// Enums
// ─────────────────────────────────────────

export type Role = "USER" | "ADMIN";

export type SocialPlatform =
  | "LINKEDIN"
  | "TWITTER"
  | "INSTAGRAM"
  | "FACEBOOK"
  | "GITHUB"
  | "YOUTUBE"
  | "TIKTOK"
  | "OTHER";

// ─────────────────────────────────────────
// User
// ─────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  avatarUrl: string | null;
  isActive: boolean;
  emailVerified: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PublicUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
  createdAt: Date;
  _count?: { cards: number };
}

// ─────────────────────────────────────────
// Card
// ─────────────────────────────────────────

export interface SocialLink {
  id: string;
  cardId: string;
  platform: SocialPlatform;
  url: string;
  order: number;
}

export interface CardAnalytics {
  id: string;
  cardId: string;
  totalViews: number;
  totalClicks: number;
  updatedAt: Date;
}

export interface Card {
  id: string;
  userId: string;
  slug: string;
  displayName: string;
  jobTitle: string | null;
  company: string | null;
  bio: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  avatarUrl: string | null;
  theme: string;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
  socialLinks?: SocialLink[];
  analytics?: CardAnalytics | null;
}

// ─────────────────────────────────────────
// API Response types
// ─────────────────────────────────────────

export interface ApiResponse<T> {
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export interface AdminStats {
  totalUsers: number;
  totalCards: number;
  publishedCards: number;
  totalViews: number;
}
