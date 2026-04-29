import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/landing/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow:     ["/", "/login", "/signup", "/u/"],
        disallow:  ["/api/", "/admin/", "/dashboard", "/card", "/settings", "/analytics", "/support"],
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host:    siteConfig.url,
  };
}
