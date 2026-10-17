"use server";

import { updateTag, revalidateTag, revalidatePath } from "next/cache";
import { after } from "next/server";
import { readDb, writeDb, appendAuditLog, type PostStatus } from "@/lib/db";
import { slugify } from "@/lib/utils";
import { getSession } from "@/lib/dal";

export interface ActionState {
  success?: boolean;
  message?: string;
  error?: string;
  postId?: string;
}

async function notifyReaderRepoWebhook(tags: string[], slug?: string) {
  try {
    await fetch("http://localhost:3002/api/revalidate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-revalidate-secret": "nextblog-shared-secret",
      },
      body: JSON.stringify({ tags, slug }),
    });
  } catch {
    // Reader server might not be running yet; ignore network error gracefully
  }
}

export async function savePostAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await getSession();
  const id = (formData.get("id") as string | null)?.trim() || "";
  const title = (formData.get("title") as string | null)?.trim() || "";
  const customSlug = (formData.get("slug") as string | null)?.trim() || "";
  const excerpt = (formData.get("excerpt") as string | null)?.trim() || "";
  const content = (formData.get("content") as string | null)?.trim() || "";
  const categorySlug =
    (formData.get("categorySlug") as string | null)?.trim() || "engineering";
  const status = (formData.get("status") as PostStatus | null) || "draft";
  const featured = formData.get("featured") === "on";

  const seoTitle = (formData.get("seoTitle") as string | null)?.trim() || "";
  const seoDescription =
    (formData.get("seoDescription") as string | null)?.trim() || "";
  const focusKeyword =
    (formData.get("focusKeyword") as string | null)?.trim() || "";
  const canonicalUrl =
    (formData.get("canonicalUrl") as string | null)?.trim() || "";
  const noIndex = formData.get("noIndex") === "on";

  if (!title || title.length < 3) {
    return { error: "กรุณาระบุหัวข้อบทความอย่างน้อย 3 ตัวอักษร" };
  }

  const db = await readDb();
  const now = new Date().toISOString();
  const finalSlug = customSlug ? slugify(customSlug) : slugify(title);

  let savedPostId = id;
  let actionType = "POST_CREATE";

  if (id) {
    const idx = db.posts.findIndex((p) => p.id === id);
    if (idx === -1) {
      return { error: "ไม่พบบทความที่ต้องการแก้ไข" };
    }
    actionType = "POST_UPDATE";
    db.posts[idx] = {
      ...db.posts[idx],
      title,
      slug: finalSlug || db.posts[idx].slug,
      excerpt,
      content,
      categorySlug,
      status,
      featured,
      seoTitle,
      seoDescription,
      focusKeyword,
      canonicalUrl,
      noIndex,
      updatedAt: now,
    };
  } else {
    savedPostId = `post-${Date.now()}`;
    db.posts.unshift({
      id: savedPostId,
      title,
      slug: finalSlug || savedPostId,
      excerpt,
      content,
      categorySlug,
      status,
      featured,
      views: 0,
      author: session?.name ?? "Admin First",
      seoTitle,
      seoDescription,
      focusKeyword,
      canonicalUrl,
      noIndex,
      createdAt: now,
      updatedAt: now,
    });
  }

  await writeDb(db);

  updateTag("posts");
  updateTag(`post-${savedPostId}`);
  updateTag("stats");

  after(async () => {
    await notifyReaderRepoWebhook(["posts", `post-${finalSlug}`], finalSlug);
    await appendAuditLog({
      action: actionType,
      target: title,
      actor: session?.name ?? "Admin First",
      meta: `status=${status}, webhook -> :3002/api/revalidate`,
    });
    updateTag("audit-logs");
  });

  return {
    success: true,
    message: id
      ? "อัปเดตบทความและซิงค์ไปยังเว็บฝั่งแสดงผลเรียบร้อยแล้ว"
      : "สร้างบทความใหม่เรียบร้อยแล้ว",
    postId: savedPostId,
  };
}

export async function togglePostStatusAction(
  postId: string,
  nextStatus: PostStatus
): Promise<{ ok: boolean }> {
  const session = await getSession();
  const db = await readDb();
  const post = db.posts.find((p) => p.id === postId);
  if (!post) return { ok: false };

  post.status = nextStatus;
  post.updatedAt = new Date().toISOString();
  await writeDb(db);

  updateTag("posts");
  updateTag(`post-${postId}`);
  updateTag("stats");

  after(async () => {
    await notifyReaderRepoWebhook(["posts", `post-${post.slug}`], post.slug);
    await appendAuditLog({
      action: "STATUS_TOGGLE",
      target: `${post.title} → ${nextStatus.toUpperCase()}`,
      actor: session?.name ?? "Admin First",
      meta: "useOptimistic + webhook -> :3002",
    });
    updateTag("audit-logs");
  });

  return { ok: true };
}

export async function deletePostAction(
  postId: string
): Promise<{ ok: boolean }> {
  const session = await getSession();
  const db = await readDb();
  const target = db.posts.find((p) => p.id === postId);
  if (!target) return { ok: false };

  db.posts = db.posts.filter((p) => p.id !== postId);
  await writeDb(db);

  updateTag("posts");
  updateTag("stats");
  revalidatePath("/console/posts");

  after(async () => {
    await notifyReaderRepoWebhook(["posts"], target.slug);
    await appendAuditLog({
      action: "POST_DELETE",
      target: target.title,
      actor: session?.name ?? "Admin First",
      meta: "revalidatePath + webhook -> :3002",
    });
    updateTag("audit-logs");
  });

  return { ok: true };
}

export async function bulkUpdatePostsAction(
  postIds: string[],
  operation: "publish" | "draft" | "archive" | "delete"
): Promise<{ ok: boolean; count: number }> {
  if (!postIds.length) return { ok: false, count: 0 };
  const session = await getSession();
  const db = await readDb();
  const idSet = new Set(postIds);
  const now = new Date().toISOString();

  if (operation === "delete") {
    db.posts = db.posts.filter((p) => !idSet.has(p.id));
  } else {
    const statusMap: Record<"publish" | "draft" | "archive", PostStatus> = {
      publish: "published",
      draft: "draft",
      archive: "archived",
    };
    const nextStatus = statusMap[operation];
    for (const post of db.posts) {
      if (idSet.has(post.id)) {
        post.status = nextStatus;
        post.updatedAt = now;
      }
    }
  }

  await writeDb(db);
  updateTag("posts");
  updateTag("stats");
  revalidatePath("/console/posts");

  after(async () => {
    await notifyReaderRepoWebhook(["posts"]);
    await appendAuditLog({
      action: `BULK_${operation.toUpperCase()}`,
      target: `${postIds.length} บทความ`,
      actor: session?.name ?? "Admin First",
      meta: `ids=${postIds.join(",")}`,
    });
    updateTag("audit-logs");
  });

  return { ok: true, count: postIds.length };
}

export async function revalidateAllCacheAction(): Promise<void> {
  const session = await getSession();
  revalidateTag("posts", "max");
  revalidateTag("categories", "max");
  revalidateTag("media", "max");
  revalidateTag("stats", "max");
  revalidatePath("/console", "layout");

  after(async () => {
    await notifyReaderRepoWebhook(["posts", "categories", "settings"]);
    await appendAuditLog({
      action: "CACHE_PURGE",
      target: "All cache tags revalidated across Console & Reader repos",
      actor: session?.name ?? "Admin First",
      meta: "revalidateTag('*', 'max')",
    });
    updateTag("audit-logs");
  });
}
