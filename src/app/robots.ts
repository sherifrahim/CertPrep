import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Signed-in and single-use areas have nothing useful to index.
        disallow: ["/dashboard", "/api/", "/reset-password", "/forgot-password"],
      },
    ],
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}
