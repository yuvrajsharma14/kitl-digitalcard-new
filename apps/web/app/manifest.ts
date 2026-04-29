import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/landing/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name:        siteConfig.name,
    short_name:  siteConfig.shortName,
    description: siteConfig.description,
    start_url:   "/",
    display:     "standalone",
    background_color: "#ffffff",
    theme_color:      "#6366f1",
    icons: [
      { src: "/favicon.ico", sizes: "any", type: "image/x-icon" },
    ],
  };
}
