import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import {
  readDb,
  type Post,
  type Category,
  type MediaItem,
  type AuditLog,
  type SiteSettings,
} from "./db";

export async function getPosts(): Promise<Post[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("posts");

  const db = await readDb();
  return db.posts.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

export async function getPostById(id: string): Promise<Post | null> {
  "use cache";
  cacheLife("hours");
  cacheTag("posts", `post-${id}`);

  const db = await readDb();
  return db.posts.find((p) => p.id === id) ?? null;
}

export async function getDashboardStats() {
  "use cache";
  cacheLife("minutes");
  cacheTag("posts", "categories", "media", "stats");

  const db = await readDb();
  const totalPosts = db.posts.length;
  const publishedPosts = db.posts.filter((p) => p.status === "published").length;
  const draftPosts = db.posts.filter((p) => p.status === "draft").length;
  const totalViews = db.posts.reduce((acc, p) => acc + p.views, 0);
  const totalCategories = db.categories.length;
  const totalMedia = db.media.length;

  return {
    totalPosts,
    publishedPosts,
    draftPosts,
    totalViews,
    totalCategories,
    totalMedia,
    cachedAt: new Date().toISOString(),
  };
}

export async function getCategories(): Promise<Category[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("categories");

  const db = await readDb();
  return db.categories;
}

export async function getMediaItems(): Promise<MediaItem[]> {
  "use cache";
  cacheLife("hours");
  cacheTag("media");

  const db = await readDb();
  return db.media;
}

export async function getAuditLogs(): Promise<AuditLog[]> {
  "use cache";
  cacheLife("seconds");
  cacheTag("audit-logs");

  const db = await readDb();
  return db.auditLogs.slice(0, 12);
}

export async function getSiteSettings(): Promise<SiteSettings> {
  "use cache";
  cacheLife("hours");
  cacheTag("settings");

  const db = await readDb();
  return db.settings;
}
