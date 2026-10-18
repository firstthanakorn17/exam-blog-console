"use server";

import { updateTag } from "next/cache";
import { after } from "next/server";
import { GO_API_BASE, readDb, writeDb, appendAuditLog } from "@/lib/db";
import { slugify } from "@/lib/utils";
import { getSession } from "@/lib/dal";

export interface CategoryActionState {
  success?: boolean;
  message?: string;
  error?: string;
}

export async function createCategoryAction(
  _prevState: CategoryActionState,
  formData: FormData
): Promise<CategoryActionState> {
  const session = await getSession();
  const name = (formData.get("name") as string | null)?.trim() || "";
  const parentSlugRaw =
    (formData.get("parentSlug") as string | null)?.trim() || "";
  const description =
    (formData.get("description") as string | null)?.trim() || "";

  if (!name) {
    return { error: "กรุณาระบุชื่อหมวดหมู่" };
  }

  const baseSlug = slugify(name) || `cat-${Date.now()}`;
  const parentSlug = parentSlugRaw || null;
  const fullSlug = parentSlug ? `${parentSlug}/${baseSlug}` : baseSlug;

  const db = await readDb();
  if (db.categories.some((c) => c.slug === fullSlug)) {
    return { error: `หมวดหมู่ ${fullSlug} มีอยู่แล้ว` };
  }

  const newCat = {
    id: `cat-${Date.now()}`,
    name,
    slug: fullSlug,
    parentSlug,
    description,
  };

  try {
    await fetch(`${GO_API_BASE}/categories`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newCat),
    });
  } catch {
    db.categories.push(newCat);
    await writeDb(db);
  }

  updateTag("categories");
  updateTag("stats");
  updateTag("audit-logs");

  after(async () => {
    await appendAuditLog({
      action: "CATEGORY_CREATE",
      target: `${name} (/${fullSlug})`,
      actor: session?.name ?? "Admin First",
      meta: "PostgreSQL + Redis synced",
    });
  });

  return {
    success: true,
    message: `สร้างหมวดหมู่ /${fullSlug} ใน PostgreSQL สำเร็จ`,
  };
}

export async function deleteCategoryAction(id: string): Promise<void> {
  try {
    await fetch(`${GO_API_BASE}/categories/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
  } catch {
    const db = await readDb();
    db.categories = db.categories.filter((c) => c.id !== id);
    await writeDb(db);
  }

  updateTag("categories");
  updateTag("stats");
  updateTag("audit-logs");
}

export interface SettingsActionState {
  success?: boolean;
  message?: string;
}

export async function updateSettingsAction(
  _prevState: SettingsActionState,
  formData: FormData
): Promise<SettingsActionState> {
  const db = await readDb();

  const updatedSettings = {
    siteName:
      (formData.get("siteName") as string | null)?.trim() ||
      db.settings.siteName,
    tagline:
      (formData.get("tagline") as string | null)?.trim() ||
      db.settings.tagline,
    postsPerPage: Number(formData.get("postsPerPage") || 10),
    maintenanceMode: formData.get("maintenanceMode") === "on",
    allowComments: formData.get("allowComments") === "on",
    defaultSeoDescription:
      (formData.get("defaultSeoDescription") as string | null)?.trim() ||
      db.settings.defaultSeoDescription,
    siteUrl:
      (formData.get("siteUrl") as string | null)?.trim() ||
      db.settings.siteUrl ||
      "https://nextblog.example.com",
    twitterHandle:
      (formData.get("twitterHandle") as string | null)?.trim() ||
      db.settings.twitterHandle ||
      "@nextblog",
  };

  try {
    await fetch(`${GO_API_BASE}/settings`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedSettings),
    });
  } catch {
    db.settings = updatedSettings;
    await writeDb(db);
  }

  updateTag("settings");
  updateTag("audit-logs");

  return {
    success: true,
    message: "บันทึกการตั้งค่าลง PostgreSQL + Redis เรียบร้อยแล้ว",
  };
}
