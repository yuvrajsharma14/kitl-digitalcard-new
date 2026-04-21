import { z } from "zod";

export const socialLinkSchema = z.object({
  platform: z.enum([
    "LINKEDIN",
    "TWITTER",
    "INSTAGRAM",
    "FACEBOOK",
    "GITHUB",
    "YOUTUBE",
    "TIKTOK",
    "OTHER",
  ]),
  url: z.string().url("Please enter a valid URL"),
  order: z.number().int().default(0),
});

export const cardSchema = z.object({
  displayName: z.string().min(2, "Name must be at least 2 characters").max(100),
  jobTitle:    z.string().max(100).optional(),
  company:     z.string().max(100).optional(),
  bio:         z.string().max(500).optional(),
  email:       z.string().email("Please enter a valid email").optional().or(z.literal("")),
  phone:       z.string().max(20).optional(),
  website:     z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  avatarUrl:   z.string().optional().or(z.literal("")),
  styles:      z.record(z.unknown()).optional(), // template config snapshot
  isPublished: z.boolean().default(false),
  socialLinks: z.array(socialLinkSchema).max(10).default([]),
});

export type CardInput = z.infer<typeof cardSchema>;
export type SocialLinkInput = z.infer<typeof socialLinkSchema>;
