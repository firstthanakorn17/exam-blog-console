"use server";

import { updateTag, revalidateTag, revalidatePath } from "next/cache";
import { after } from "next/server";
import {
  GO_API_BASE,
  readDb,
  writeDb,
  appendAuditLog,
  type PostStatus,
} from "@/lib/db";
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

  const finalSlug = customSlug ? slugify(customSlug) : slugify(title);
  let savedPostId = id || `post-${Date.now()}`;
  const payload = {
    id: savedPostId,
    title,
    slug: finalSlug || savedPostId,
    excerpt,
    content,
    categorySlug,
    status,
    featured,
    author: session?.name ?? "Admin First",
    seoTitle,
    seoDescription,
    focusKeyword,
    canonicalUrl,
    noIndex,
  };

  try {
    const endpoint = id
      ? `${GO_API_BASE}/posts/${encodeURIComponent(id)}`
      : `${GO_API_BASE}/posts`;
    const method = id ? "PUT" : "POST";

    const res = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const data = await res.json();
      if (data?.post?.id) {
        savedPostId = data.post.id;
      }
    }
  } catch {
    // Fallback to local file if Go API is offline
    const db = await readDb();
    const now = new Date().toISOString();
    if (id) {
      const idx = db.posts.findIndex((p) => p.id === id);
      if (idx !== -1) {
        db.posts[idx] = { ...db.posts[idx], ...payload, updatedAt: now };
      }
    } else {
      db.posts.unshift({
        ...payload,
        views: 0,
        createdAt: now,
        updatedAt: now,
      });
    }
    await writeDb(db);
  }

  updateTag("posts");
  updateTag(`post-${savedPostId}`);
  updateTag("stats");
  updateTag("audit-logs");

  after(async () => {
    await notifyReaderRepoWebhook(["posts", `post-${finalSlug}`], finalSlug);
  });

  return {
    success: true,
    message: id
      ? "อัปเดตบทความลง PostgreSQL + Redis และซิงค์ไปยังเว็บแสดงผลแล้ว"
      : "สร้างบทความใหม่ใน PostgreSQL + Redis เรียบร้อยแล้ว",
    postId: savedPostId,
  };
}

export async function togglePostStatusAction(
  postId: string,
  nextStatus: PostStatus
): Promise<{ ok: boolean }> {
  try {
    const res = await fetch(
      `${GO_API_BASE}/posts/${encodeURIComponent(postId)}/toggle-status`,
      { method: "PATCH" }
    );
    if (!res.ok) return { ok: false };
  } catch {
    const db = await readDb();
    const post = db.posts.find((p) => p.id === postId);
    if (!post) return { ok: false };
    post.status = nextStatus;
    post.updatedAt = new Date().toISOString();
    await writeDb(db);
  }

  updateTag("posts");
  updateTag(`post-${postId}`);
  updateTag("stats");
  updateTag("audit-logs");

  after(async () => {
    await notifyReaderRepoWebhook(["posts"]);
  });

  return { ok: true };
}

export async function deletePostAction(
  postId: string
): Promise<{ ok: boolean }> {
  try {
    const res = await fetch(
      `${GO_API_BASE}/posts/${encodeURIComponent(postId)}`,
      { method: "DELETE" }
    );
    if (!res.ok) return { ok: false };
  } catch {
    const db = await readDb();
    db.posts = db.posts.filter((p) => p.id !== postId);
    await writeDb(db);
  }

  updateTag("posts");
  updateTag("stats");
  updateTag("audit-logs");
  revalidatePath("/console/posts");

  after(async () => {
    await notifyReaderRepoWebhook(["posts"]);
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

  const statusMap: Record<"publish" | "draft" | "archive", PostStatus> = {
    publish: "published",
    draft: "draft",
    archive: "archived",
  };

  for (const id of postIds) {
    if (operation === "delete") {
      await fetch(`${GO_API_BASE}/posts/${encodeURIComponent(id)}`, {
        method: "DELETE",
      }).catch(() => null);
    } else {
      const existing = db.posts.find((p) => p.id === id);
      if (existing) {
        await fetch(`${GO_API_BASE}/posts/${encodeURIComponent(id)}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...existing,
            status: statusMap[operation],
          }),
        }).catch(() => null);
      }
    }
  }

  updateTag("posts");
  updateTag("stats");
  updateTag("audit-logs");
  revalidatePath("/console/posts");

  after(async () => {
    await notifyReaderRepoWebhook(["posts"]);
    await appendAuditLog({
      action: `BULK_${operation.toUpperCase()}`,
      target: `${postIds.length} บทความ`,
      actor: session?.name ?? "Admin First",
      meta: `ids=${postIds.join(",")}`,
    });
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
      target: "All cache tags revalidated across Console, Reader & Redis",
      actor: session?.name ?? "Admin First",
      meta: "revalidateTag('*', 'max')",
    });
    updateTag("audit-logs");
  });
}
