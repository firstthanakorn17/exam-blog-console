import "server-only";
import fs from "node:fs/promises";
import path from "node:path";

export type PostStatus = "draft" | "published" | "archived";

export interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  categorySlug: string;
  status: PostStatus;
  featured: boolean;
  views: number;
  author: string;
  updatedAt: string;
  createdAt: string;
  // SEO & Structured Data fields
  seoTitle?: string;
  seoDescription?: string;
  focusKeyword?: string;
  canonicalUrl?: string;
  noIndex?: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  parentSlug: string | null;
  description: string;
}

export interface MediaItem {
  id: string;
  filename: string;
  url: string;
  sizeBytes: number;
  mimeType: string;
  alt: string;
  uploadedAt: string;
}

export interface AuditLog {
  id: string;
  action: string;
  target: string;
  actor: string;
  timestamp: string;
  meta?: string;
}

export interface SiteSettings {
  siteName: string;
  tagline: string;
  postsPerPage: number;
  maintenanceMode: boolean;
  allowComments: boolean;
  defaultSeoDescription: string;
  siteUrl?: string;
  twitterHandle?: string;
}

export interface DatabaseSchema {
  posts: Post[];
  categories: Category[];
  media: MediaItem[];
  auditLogs: AuditLog[];
  settings: SiteSettings;
}

const DATA_DIR = path.join(process.cwd(), ".data");
const DB_FILE = path.join(DATA_DIR, "blog-db.json");

const INITIAL_DB: DatabaseSchema = {
  posts: [
    {
      id: "post-1",
      title: "เจาะลึก Next.js 16 Cache Components และ use cache Directive",
      slug: "nextjs-16-cache-components-use-cache",
      excerpt:
        "ทำความเข้าใจโมเดลการทำ Caching ใหม่ด้วย 'use cache', cacheLife(), cacheTag() และ updateTag() สำหรับ Read-your-own-writes",
      content:
        "# Next.js 16 Cache Components\n\nใน Next.js 16 ระบบ Caching ถูกยกระดับด้วย `'use cache'` directive ที่กำหนดได้ทั้งระดับ Data, Component และ File พร้อมกับ `cacheTag` และ `updateTag` ใน Server Actions เพื่อให้รองรับทั้งความเร็วระดับ Static และความสดใหม่ของข้อมูลแบบ Read-your-own-writes",
      categorySlug: "engineering/nextjs",
      status: "published",
      featured: true,
      views: 1840,
      author: "Admin First",
      createdAt: "2026-10-10T08:00:00.000Z",
      updatedAt: "2026-10-15T14:20:00.000Z",
      seoTitle: "เจาะลึก Next.js 16 Cache Components และ use cache ฉบับสมบูรณ์",
      seoDescription:
        "คู่มือการใช้งาน Next.js 16 Cache Components, use cache directive, cacheLife และ updateTag เพื่อเพิ่มความเร็วเว็บและคะแนน Core Web Vitals",
      focusKeyword: "next.js 16",
      canonicalUrl: "",
      noIndex: false,
    },
    {
      id: "post-2",
      title: "การใช้ Parallel Routes (@slot) ร่วมกับ Intercepting Routes ((.))",
      slug: "parallel-and-intercepting-routes-pattern",
      excerpt:
        "ออกแบบ Admin Dashboard ที่โหลดแต่ละ Widget แยกกันอย่างอิสระ และเปิด Quick Edit Modal โดยเปลี่ยน URL จริง",
      content:
        "# Parallel & Intercepting Routes\n\nการใช้ `@stats`, `@recent`, `@activity` ช่วยให้แต่ละส่วนของ Dashboard มี `loading.tsx` และ `error.tsx` แยกกันโดยไม่บล็อกทั้งหน้า และสามารถสกัดกั้น Route เพื่อเปิด Modal แก้ไขด่วนได้อย่างลื่นไหล",
      categorySlug: "engineering/architecture",
      status: "published",
      featured: true,
      views: 920,
      author: "Admin First",
      createdAt: "2026-10-12T10:30:00.000Z",
      updatedAt: "2026-10-14T09:15:00.000Z",
      seoTitle: "เทคนิค Parallel Routes และ Intercepting Routes ใน Next.js App Router",
      seoDescription:
        "เรียนรู้การออกแบบ UX ระดับสูงด้วย Parallel Routes (@slot) และ Intercepting Routes ((.)) สำหรับทำ Modal และ Dashboard ที่โหลดแยกส่วนกัน",
      focusKeyword: "parallel routes",
      canonicalUrl: "",
      noIndex: false,
    },
    {
      id: "post-3",
      title: "React 19 Server Actions: useActionState, useOptimistic และ next/after",
      slug: "react-19-server-actions-optimistic-after",
      excerpt:
        "จัดการ Form Mutation แบบ Progressive Enhancement พร้อมอัปเดต UI ทันทีด้วย useOptimistic และบันทึก Audit Log เบื้องหลังด้วย after()",
      content:
        "# Server Actions & after()\n\nเมื่อผู้ใช้กดเปลี่ยนสถานะโพสต์ `useOptimistic` จะสลับสถานะบนหน้าจอทันที ขณะที่ `after()` จะทำงานหลังจากส่ง Response เสร็จแล้ว",
      categorySlug: "engineering/react",
      status: "draft",
      featured: false,
      views: 145,
      author: "Admin First",
      createdAt: "2026-10-15T11:00:00.000Z",
      updatedAt: "2026-10-15T16:45:00.000Z",
      seoTitle: "การใช้งาน React 19 useActionState, useOptimistic ร่วมกับ next/after",
      seoDescription:
        "ยกระดับประสบการณ์ผู้ใช้ด้วย Optimistic UI ใน React 19 และการประมวลผลเบื้องหลังแบบไม่บล็อก Response ด้วยฟังก์ชัน after() ของ Next.js",
      focusKeyword: "useoptimistic",
      canonicalUrl: "",
      noIndex: false,
    },
    {
      id: "post-4",
      title: "การเปลี่ยนผ่านจาก Middleware สู่ Proxy (proxy.ts) ใน Next.js 16",
      slug: "migrating-middleware-to-proxy-nextjs-16",
      excerpt:
        "ทำไม Next.js 16 จึงเปลี่ยนชื่อ Middleware เป็น Proxy และการวางโครงสร้าง Auth Guard ร่วมกับ Data Access Layer (DAL)",
      content:
        "# Proxy in Next.js 16\n\nไฟล์ `src/proxy.ts` ทำหน้าที่ตรวจสอบ Request เบื้องต้น (Optimistic Check) ก่อนส่งต่อไปยัง Server Components",
      categorySlug: "design/ui-ux",
      status: "draft",
      featured: false,
      views: 64,
      author: "Admin First",
      createdAt: "2026-10-16T01:00:00.000Z",
      updatedAt: "2026-10-16T02:00:00.000Z",
      seoTitle: "สรุปการย้ายจาก Middleware ไปใช้ proxy.ts ใน Next.js 16",
      seoDescription:
        "แนวทางการจัดการ Request Routing, Redirects และ Authentication Guard ด้วยไฟล์ proxy.ts รูปแบบใหม่ใน Next.js 16",
      focusKeyword: "proxy.ts",
      canonicalUrl: "",
      noIndex: false,
    },
  ],
  categories: [
    {
      id: "cat-1",
      name: "Engineering",
      slug: "engineering",
      parentSlug: null,
      description: "บทความด้านวิศวกรรมซอฟต์แวร์และสถาปัตยกรรมระบบ",
    },
    {
      id: "cat-2",
      name: "Next.js",
      slug: "engineering/nextjs",
      parentSlug: "engineering",
      description: "เจาะลึก App Router, RSC, Caching และ Turbopack",
    },
    {
      id: "cat-3",
      name: "React 19",
      slug: "engineering/react",
      parentSlug: "engineering",
      description: "Actions, Compiler, Hooks และ Concurrent Rendering",
    },
    {
      id: "cat-4",
      name: "Architecture",
      slug: "engineering/architecture",
      parentSlug: "engineering",
      description: "การออกแบบโครงสร้างระบบขนาดใหญ่",
    },
    {
      id: "cat-5",
      name: "Design & UI",
      slug: "design",
      parentSlug: null,
      description: "ระบบ Design System, Tailwind CSS v4 และ shadcn/ui",
    },
    {
      id: "cat-6",
      name: "UI / UX",
      slug: "design/ui-ux",
      parentSlug: "design",
      description: "ประสบการณ์ผู้ใช้และ Accessibility",
    },
  ],
  media: [
    {
      id: "med-1",
      filename: "nextjs-16-architecture.svg",
      url: "/next.svg",
      sizeBytes: 14200,
      mimeType: "image/svg+xml",
      alt: "Next.js Architecture Diagram",
      uploadedAt: "2026-10-12T08:30:00.000Z",
    },
    {
      id: "med-2",
      filename: "globe-network.svg",
      url: "/globe.svg",
      sizeBytes: 8420,
      mimeType: "image/svg+xml",
      alt: "Edge Network Globe",
      uploadedAt: "2026-10-14T12:15:00.000Z",
    },
    {
      id: "med-3",
      filename: "window-console.svg",
      url: "/window.svg",
      sizeBytes: 6150,
      mimeType: "image/svg+xml",
      alt: "Admin Console Preview",
      uploadedAt: "2026-10-15T09:00:00.000Z",
    },
  ],
  auditLogs: [
    {
      id: "log-1",
      action: "SYSTEM_INIT",
      target: "Database seeded with App Router & SEO showcase data",
      actor: "system",
      timestamp: "2026-10-16T02:00:00.000Z",
      meta: "Next.js 16.4.2",
    },
    {
      id: "log-2",
      action: "POST_PUBLISH",
      target: "เจาะลึก Next.js 16 Cache Components และ use cache Directive",
      actor: "Admin First",
      timestamp: "2026-10-15T14:20:00.000Z",
      meta: "updateTag('posts')",
    },
  ],
  settings: {
    siteName: "NextBlog",
    tagline: "Editorial & Technical Publishing Platform",
    postsPerPage: 10,
    maintenanceMode: false,
    allowComments: true,
    defaultSeoDescription:
      "ระบบจัดการบทความและฐานความรู้ทางเทคนิคด้วยสถาปัตยกรรม Next.js 16 App Router และมาตรฐาน SEO สมัยใหม่",
    siteUrl: "https://nextblog.example.com",
    twitterHandle: "@nextblog",
  },
};

export const GO_API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

export async function readDb(): Promise<DatabaseSchema> {
  try {
    const res = await fetch(`${GO_API_BASE}/content?all=1`, {
      cache: "no-store",
      signal: AbortSignal.timeout(2000),
    });
    if (res.ok) {
      return (await res.json()) as DatabaseSchema;
    }
  } catch {
    // Fallback to local file if Go API is offline
  }

  try {
    const raw = await fs.readFile(DB_FILE, "utf-8");
    return JSON.parse(raw) as DatabaseSchema;
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(DB_FILE, JSON.stringify(INITIAL_DB, null, 2), "utf-8");
    return INITIAL_DB;
  }
}

export async function writeDb(data: DatabaseSchema): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
}

export async function appendAuditLog(
  entry: Omit<AuditLog, "id" | "timestamp">
): Promise<void> {
  try {
    const res = await fetch(`${GO_API_BASE}/audit-logs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(entry),
      signal: AbortSignal.timeout(2000),
    });
    if (res.ok) return;
  } catch {
    // Fallback to local file
  }

  const db = await readDb();
  const newLog: AuditLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: new Date().toISOString(),
    ...entry,
  };
  db.auditLogs.unshift(newLog);
  db.auditLogs = db.auditLogs.slice(0, 50);
  await writeDb(db);
}
