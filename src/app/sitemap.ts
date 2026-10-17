import type { MetadataRoute } from "next";
import { getPosts, getCategories, getSiteSettings } from "@/lib/cache";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, categories, settings] = await Promise.all([
    getPosts(),
    getCategories(),
    getSiteSettings(),
  ]);

  const baseUrl = (settings.siteUrl || "https://nextblog.example.com").replace(
    /\/$/,
    ""
  );

  const indexablePosts = posts
    .filter((post) => post.status === "published" && !post.noIndex)
    .map((post) => ({
      url: post.canonicalUrl || `${baseUrl}/blog/${post.slug}`,
      lastModified: new Date(post.updatedAt),
      changeFrequency: "weekly" as const,
      priority: post.featured ? 0.9 : 0.7,
    }));

  const categoryEntries = categories.map((cat) => ({
    url: `${baseUrl}/category/${cat.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    ...indexablePosts,
    ...categoryEntries,
  ];
}
