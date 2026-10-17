import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("th-TH", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

export function calculateReadingStats(content: string): {
  words: number;
  minutes: number;
} {
  const cleaned = content.trim();
  if (!cleaned) return { words: 0, minutes: 1 };
  // Estimate words across Thai + English text
  const spaceTokens = cleaned.split(/\s+/).filter(Boolean).length;
  const charEstimate = Math.ceil(cleaned.length / 6);
  const words = Math.max(spaceTokens, charEstimate);
  const minutes = Math.max(1, Math.ceil(words / 200));
  return { words, minutes };
}

export interface SeoAuditItem {
  id: string;
  label: string;
  passed: boolean;
  hint: string;
}

export function evaluateSeoScore(input: {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  seoTitle?: string;
  seoDescription?: string;
  focusKeyword?: string;
}): {
  score: number;
  checks: SeoAuditItem[];
} {
  const effectiveTitle = (input.seoTitle || input.title || "").trim();
  const effectiveDesc = (input.seoDescription || input.excerpt || "").trim();
  const keyword = (input.focusKeyword || "").trim().toLowerCase();
  const contentLower = (input.content || "").toLowerCase();

  const checks: SeoAuditItem[] = [
    {
      id: "title-len",
      label: "ความยาว Meta Title เหมาะสม (25–65 ตัวอักษร)",
      passed: effectiveTitle.length >= 25 && effectiveTitle.length <= 65,
      hint: `ปัจจุบัน ${effectiveTitle.length} ตัวอักษร`,
    },
    {
      id: "desc-len",
      label: "ความยาว Meta Description เหมาะสม (60–160 ตัวอักษร)",
      passed: effectiveDesc.length >= 60 && effectiveDesc.length <= 160,
      hint: `ปัจจุบัน ${effectiveDesc.length} ตัวอักษร`,
    },
    {
      id: "slug-clean",
      label: "URL Slug กระชับและอ่านเข้าใจง่าย",
      passed:
        input.slug.trim().length >= 5 &&
        input.slug.trim().length <= 75 &&
        !input.slug.includes("--"),
      hint: input.slug ? `/${input.slug}` : "ยังไม่ได้ระบุ slug",
    },
    {
      id: "keyword-presence",
      label: "มี Focus Keyword ในหัวข้อหรือเนื้อหา",
      passed:
        keyword.length >= 2 &&
        (effectiveTitle.toLowerCase().includes(keyword) ||
          contentLower.includes(keyword)),
      hint: keyword ? `คีย์เวิร์ด: "${keyword}"` : "ยังไม่ได้กำหนด Focus Keyword",
    },
    {
      id: "content-depth",
      label: "เนื้อหามีความยาวเพียงพอและมีหัวข้อย่อย (Heading)",
      passed: input.content.trim().length >= 120 && input.content.includes("#"),
      hint: `ความยาว ${input.content.trim().length} ตัวอักษร`,
    },
  ];

  const passedCount = checks.filter((c) => c.passed).length;
  const score = Math.round((passedCount / checks.length) * 100);
  return { score, checks };
}
