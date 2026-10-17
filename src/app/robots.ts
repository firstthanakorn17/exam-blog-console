import type { MetadataRoute } from "next";
import { getSiteSettings } from "@/lib/cache";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const settings = await getSiteSettings();
  const baseUrl = (settings.siteUrl || "https://nextblog.example.com").replace(
    /\/$/,
    ""
  );

  if (settings.maintenanceMode) {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
      sitemap: `${baseUrl}/sitemap.xml`,
    };
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/blog/", "/category/"],
        disallow: ["/console/", "/api/", "/login"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
