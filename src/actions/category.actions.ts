"use server";

import { updateTag } from "next/cache";
import { after } from "next/server";
import { readDb, writeDb, appendAuditLog } from "@/lib/db";
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

  db.categories.push({
    id: `cat-${Date.now()}`,
    name,
    slug: fullSlug,
    parentSlug,
    description,
  });

  await writeDb(db);
  updateTag("categories");
  updateTag("stats");

  after(async () => {
    await appendAuditLog({
      action: "CATEGORY_CREATE",
      target: `${name} (/${fullSlug})`,
      actor: session?.name ?? "Admin First",
      meta: "Optional Catch-all [[...slug]]",
    });
    updateTag("audit-logs");
  });

  return {
    success: true,
    message: `สร้างหมวดหมู่ /${fullSlug} สำเร็จ`,
  };
}

export async function deleteCategoryAction(id: string): Promise<void> {
  const session = await getSession();
  const db = await readDb();
  const cat = db.categories.find((c) => c.id === id);
  if (!cat) return;

  db.categories = db.categories.filter(
    (c) => c.id !== id && !c.slug.startsWith(`${cat.slug}/`)
  );
  await writeDb(db);
  updateTag("categories");
  updateTag("stats");

  after(async () => {
    await appendAuditLog({
      action: "CATEGORY_DELETE",
      target: cat.slug,
      actor: session?.name ?? "Admin First",
    });
    updateTag("audit-logs");
  });
}

export interface SettingsActionState {
  success?: boolean;
  message?: string;
}

export async function updateSettingsAction(
  _prevState: SettingsActionState,
  formData: FormData
): Promise<SettingsActionState> {
  const session = await getSession();
  const db = await readDb();

  db.settings = {
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

  await writeDb(db);
  updateTag("settings");

  after(async () => {
    await appendAuditLog({
      action: "SETTINGS_UPDATE",
      target: `${db.settings.siteName} (${db.settings.siteUrl})`,
      actor: session?.name ?? "Admin First",
      meta: "updateTag('settings') + sitemap/robots updated",
    });
    updateTag("audit-logs");
  });

  return {
    success: true,
    message: "บันทึกการตั้งค่าเว็บไซต์และ SEO เรียบร้อยแล้ว",
  };
}
