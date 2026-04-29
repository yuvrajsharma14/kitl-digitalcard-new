import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/landing/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    {
      url:        `${siteConfig.url}/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority:        1.0,
    },
    {
      url:        `${siteConfig.url}/login`,
      lastModified: now,
      changeFrequency: "yearly",
      priority:        0.5,
    },
    {
      url:        `${siteConfig.url}/signup`,
      lastModified: now,
      changeFrequency: "yearly",
      priority:        0.7,
    },
  ];
}
