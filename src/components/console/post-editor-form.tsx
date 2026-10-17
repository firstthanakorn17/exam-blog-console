"use client";

import { useState, useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { savePostAction, type ActionState } from "@/actions/post.actions";
import type { Post, Category } from "@/lib/db";
import {
  slugify,
  calculateReadingStats,
  evaluateSeoScore,
  cn,
} from "@/lib/utils";
import {
  Save,
  Eye,
  Columns2,
  PenLine,
  Maximize2,
  Minimize2,
  CheckCircle2,
  AlertCircle,
  Globe,
  Share2,
  Code2,
  Sparkles,
} from "lucide-react";

const initialState: ActionState = {};

export function PostEditorForm({
  post,
  categories,
  isModal = false,
}: {
  post?: Post;
  categories: Category[];
  isModal?: boolean;
}) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(
    savePostAction,
    initialState
  );

  // Live controlled states for real-time UX & SEO intelligence
  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(post?.slug));
  const [categorySlug, setCategorySlug] = useState(
    post?.categorySlug ?? categories[0]?.slug ?? "engineering"
  );
  const [status, setStatus] = useState(post?.status ?? "draft");
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [content, setContent] = useState(post?.content ?? "");
  const [featured, setFeatured] = useState(post?.featured ?? false);

  // SEO states
  const [seoTitle, setSeoTitle] = useState(post?.seoTitle ?? "");
  const [seoDescription, setSeoDescription] = useState(
    post?.seoDescription ?? ""
  );
  const [focusKeyword, setFocusKeyword] = useState(post?.focusKeyword ?? "");
  const [canonicalUrl, setCanonicalUrl] = useState(post?.canonicalUrl ?? "");
  const [noIndex, setNoIndex] = useState(post?.noIndex ?? false);

  // Workspace view states
  const [editorView, setEditorView] = useState<"write" | "split" | "preview">(
    "write"
  );
  const [zenMode, setZenMode] = useState(false);
  const [seoTab, setSeoTab] = useState<"google" | "social" | "jsonld">(
    "google"
  );

  // Handle auto-slug generation when typing title
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!slugTouched) {
      setSlug(slugify(val));
    }
  };

  useEffect(() => {
    if (state.success && state.message) {
      toast.success(state.message);
      if (isModal) {
        router.back();
      } else {
        router.push("/console/posts");
      }
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state, isModal, router]);

  // Calculated stats & SEO audit
  const effectiveSlug = slug || slugify(title) || "untitled-post";
  const effectiveSeoTitle = (seoTitle || title || "หัวข้อบทความตัวอย่าง").trim();
  const effectiveSeoDesc = (
    seoDescription ||
    excerpt ||
    "คำอธิบายบทความสำหรับแสดงผลบนหน้าค้นหา Google Search และการ์ดแชร์โซเชียลมีเดีย..."
  ).trim();

  const readingStats = calculateReadingStats(content);
  const seoAudit = evaluateSeoScore({
    title,
    slug: effectiveSlug,
    excerpt,
    content,
    seoTitle,
    seoDescription,
    focusKeyword,
  });

  const ogImageUrl = `/api/og?title=${encodeURIComponent(
    effectiveSeoTitle
  )}&category=${encodeURIComponent(categorySlug)}&author=${encodeURIComponent(
    post?.author ?? "Admin First"
  )}`;

  const jsonLdPreview = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: effectiveSeoTitle,
    description: effectiveSeoDesc,
    author: {
      "@type": "Person",
      name: post?.author ?? "Admin First",
    },
    datePublished: post?.createdAt ?? new Date().toISOString(),
    dateModified: new Date().toISOString(),
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id":
        canonicalUrl || `https://nextblog.example.com/blog/${effectiveSlug}`,
    },
    image: `https://nextblog.example.com${ogImageUrl}`,
  };

  return (
    <form
      action={formAction}
      className={cn(
        "space-y-6 transition-all",
        zenMode &&
          !isModal &&
          "fixed inset-0 z-50 bg-[#f8f9fa] overflow-y-auto p-6 md:p-10"
      )}
    >
      {post && <input type="hidden" name="id" value={post.id} />}
      {isModal && <input type="hidden" name="content" value={content} />}

      {/* Top Sticky Bar in Zen Mode */}
      {zenMode && !isModal && (
        <div className="max-w-6xl mx-auto flex items-center justify-between pb-4 border-b border-zinc-200">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-md bg-zinc-900 px-2 py-0.5 text-[11px] font-medium text-white">
              Zen Writing Mode
            </span>
            <span className="text-[12px] text-zinc-500">
              {readingStats.words} คำ · อ่านประมาณ {readingStats.minutes} นาที
            </span>
          </div>
          <button
            type="button"
            onClick={() => setZenMode(false)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-[12px] font-medium text-zinc-700 hover:bg-zinc-50 shadow-2xs cursor-pointer"
          >
            <Minimize2 className="w-3.5 h-3.5" />
            ออกจากโหมดเต็มจอ
          </button>
        </div>
      )}

      <div className={cn(zenMode && !isModal && "max-w-6xl mx-auto space-y-6")}>
        {state.error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
            {state.error}
          </div>
        )}

        {/* Core Metadata Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label
              className="text-[12px] font-medium text-zinc-700"
              htmlFor="title"
            >
              หัวข้อบทความ (H1 Title) *
            </label>
            <input
              id="title"
              name="title"
              type="text"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              required
              placeholder="ระบุชื่อบทความ..."
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-[13px] text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none shadow-2xs"
            />
          </div>

          <div className="space-y-1.5">
            <label
              className="text-[12px] font-medium text-zinc-700"
              htmlFor="slug"
            >
              URL Slug (SEO Friendly URL)
            </label>
            <input
              id="slug"
              name="slug"
              type="text"
              value={slug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(e.target.value);
              }}
              placeholder="สร้างอัตโนมัติจากชื่อบทความ"
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-[13px] font-mono text-zinc-700 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none shadow-2xs"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label
              className="text-[12px] font-medium text-zinc-700"
              htmlFor="categorySlug"
            >
              หมวดหมู่บทความ
            </label>
            <select
              id="categorySlug"
              name="categorySlug"
              value={categorySlug}
              onChange={(e) => setCategorySlug(e.target.value)}
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-[13px] text-zinc-900 focus:border-zinc-900 focus:outline-none shadow-2xs"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.slug}>
                  {cat.name} (/{cat.slug})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label
              className="text-[12px] font-medium text-zinc-700"
              htmlFor="status"
            >
              สถานะการเผยแพร่
            </label>
            <select
              id="status"
              name="status"
              value={status}
              onChange={(e) =>
                setStatus(e.target.value as "draft" | "published" | "archived")
              }
              className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-[13px] text-zinc-900 focus:border-zinc-900 focus:outline-none shadow-2xs"
            >
              <option value="draft">ฉบับร่าง (Draft)</option>
              <option value="published">เผยแพร่ทันที (Published)</option>
              <option value="archived">เก็บเข้าคลัง (Archived)</option>
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label
            className="text-[12px] font-medium text-zinc-700"
            htmlFor="excerpt"
          >
            คำโปรยย่อ (Excerpt / Lead Paragraph)
          </label>
          <textarea
            id="excerpt"
            name="excerpt"
            rows={2}
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="สรุปใจความสำคัญสั้นๆ ของบทความ..."
            className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-[13px] text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none shadow-2xs"
          />
        </div>

        {/* Full Editor Content + Split Screen Preview */}
        {!isModal && (
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <label
                  className="text-[12px] font-medium text-zinc-700"
                  htmlFor="content"
                >
                  เนื้อหาบทความ (Markdown)
                </label>
                <span className="text-[11px] font-mono text-zinc-400">
                  {readingStats.words} คำ · อ่าน ~{readingStats.minutes} นาที
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <div className="inline-flex rounded-lg border border-zinc-200 bg-zinc-100/70 p-0.5">
                  <button
                    type="button"
                    onClick={() => setEditorView("write")}
                    className={cn(
                      "inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-[11px] font-medium transition cursor-pointer",
                      editorView === "write"
                        ? "bg-white text-zinc-900 shadow-2xs"
                        : "text-zinc-500 hover:text-zinc-900"
                    )}
                  >
                    <PenLine className="w-3 h-3" />
                    เขียน
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditorView("split")}
                    className={cn(
                      "inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-[11px] font-medium transition cursor-pointer",
                      editorView === "split"
                        ? "bg-white text-zinc-900 shadow-2xs"
                        : "text-zinc-500 hover:text-zinc-900"
                    )}
                  >
                    <Columns2 className="w-3 h-3" />
                    เปรียบเทียบสด
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditorView("preview")}
                    className={cn(
                      "inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-[11px] font-medium transition cursor-pointer",
                      editorView === "preview"
                        ? "bg-white text-zinc-900 shadow-2xs"
                        : "text-zinc-500 hover:text-zinc-900"
                    )}
                  >
                    <Eye className="w-3 h-3" />
                    ดูตัวอย่าง
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setZenMode(!zenMode)}
                  title="โหมดเขียนเต็มจอ (Zen Mode)"
                  className="inline-flex items-center gap-1 rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-[11px] font-medium text-zinc-600 hover:text-zinc-900 shadow-2xs transition cursor-pointer"
                >
                  {zenMode ? (
                    <Minimize2 className="w-3.5 h-3.5" />
                  ) : (
                    <Maximize2 className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            <div
              className={cn(
                "grid gap-4",
                editorView === "split" ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"
              )}
            >
              {/* Write Pane */}
              <div className={cn(editorView === "preview" && "hidden")}>
                <textarea
                  id="content"
                  name="content"
                  rows={zenMode ? 18 : 11}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="# เขียนเนื้อหาบทความด้วย Markdown..."
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50/40 px-4 py-3 text-[13px] font-mono leading-relaxed text-zinc-800 placeholder:text-zinc-400 focus:bg-white focus:border-zinc-900 focus:outline-none shadow-2xs"
                />
              </div>

              {/* Live Preview Pane */}
              {editorView !== "write" && (
                <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-2xs overflow-y-auto max-h-[420px] space-y-3">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 border-b border-zinc-100 pb-2">
                    Reader Typography Preview
                  </div>
                  <article className="space-y-3 text-[14px] leading-relaxed text-zinc-700">
                    <h1 className="text-xl font-bold text-zinc-900 tracking-tight">
                      {title || "ยังไม่ได้ระบุชื่อบทความ"}
                    </h1>
                    {excerpt && (
                      <p className="text-[13px] text-zinc-500 italic border-l-2 border-zinc-200 pl-3">
                        {excerpt}
                      </p>
                    )}
                    <div className="space-y-2 whitespace-pre-wrap font-sans">
                      {content || "เริ่มพิมพ์เนื้อหาเพื่อดูตัวอย่างการแสดงผล..."}
                    </div>
                  </article>
                </div>
              )}
            </div>
          </div>
        )}

        {/* SEO Intelligence & SERP / Social Preview Panel */}
        <div className="rounded-xl border border-zinc-200/90 bg-zinc-50/50 p-5 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-200/80 pb-4">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-zinc-700" />
                <h3 className="text-[14px] font-semibold text-zinc-900">
                  SEO Intelligence & Social Card Studio
                </h3>
              </div>
              <p className="text-[12px] text-zinc-500">
                วิเคราะห์คะแนน SEO แบบเรียลไทม์ พร้อมจำลองผลลัพธ์ Google SERP, OpenGraph Card และ Schema.org JSON-LD
              </p>
            </div>

            {/* Live SEO Score Badge */}
            <div className="flex items-center gap-2.5 self-start sm:self-auto bg-white px-3.5 py-2 rounded-xl border border-zinc-200/90 shadow-2xs">
              <div className="text-right">
                <div className="text-[10px] font-medium uppercase tracking-wider text-zinc-400">
                  SEO Score
                </div>
                <div className="text-[11px] font-medium text-zinc-600">
                  {seoAudit.score >= 80
                    ? "พร้อมติดอันดับดีเยี่ยม"
                    : seoAudit.score >= 60
                    ? "ปานกลาง (ปรับปรุงเพิ่มได้)"
                    : "ควรเพิ่มข้อมูล SEO"}
                </div>
              </div>
              <div
                className={cn(
                  "w-10 h-10 rounded-lg font-mono text-sm font-bold flex items-center justify-center",
                  seoAudit.score >= 80
                    ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20"
                    : seoAudit.score >= 60
                    ? "bg-amber-50 text-amber-700 ring-1 ring-amber-600/20"
                    : "bg-zinc-100 text-zinc-700 ring-1 ring-zinc-300"
                )}
              >
                {seoAudit.score}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: SEO Meta Inputs & Checklist */}
            <div className="lg:col-span-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label
                    className="text-[12px] font-medium text-zinc-700"
                    htmlFor="focusKeyword"
                  >
                    คีย์เวิร์ดหลัก (Focus Keyword)
                  </label>
                  <input
                    id="focusKeyword"
                    name="focusKeyword"
                    type="text"
                    value={focusKeyword}
                    onChange={(e) => setFocusKeyword(e.target.value)}
                    placeholder="เช่น next.js 16, app router"
                    className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-[12px] text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none shadow-2xs"
                  />
                </div>

                <div className="space-y-1">
                  <label
                    className="text-[12px] font-medium text-zinc-700"
                    htmlFor="canonicalUrl"
                  >
                    Canonical URL (ถ้ามีต้นฉบับอื่น)
                  </label>
                  <input
                    id="canonicalUrl"
                    name="canonicalUrl"
                    type="url"
                    value={canonicalUrl}
                    onChange={(e) => setCanonicalUrl(e.target.value)}
                    placeholder="https://nextblog.example.com/blog/..."
                    className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-[12px] font-mono text-zinc-700 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none shadow-2xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label
                    className="text-[12px] font-medium text-zinc-700"
                    htmlFor="seoTitle"
                  >
                    Meta Title (ชื่อที่จะแสดงบน Google)
                  </label>
                  <span className="text-[11px] font-mono text-zinc-400">
                    {effectiveSeoTitle.length}/65
                  </span>
                </div>
                <input
                  id="seoTitle"
                  name="seoTitle"
                  type="text"
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  placeholder={title || "เว้นว่างเพื่อใช้ชื่อบทความหลัก"}
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-[12px] text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none shadow-2xs"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label
                    className="text-[12px] font-medium text-zinc-700"
                    htmlFor="seoDescription"
                  >
                    Meta Description (คำอธิบายบนหน้าผลการค้นหา)
                  </label>
                  <span className="text-[11px] font-mono text-zinc-400">
                    {effectiveSeoDesc.length}/160
                  </span>
                </div>
                <textarea
                  id="seoDescription"
                  name="seoDescription"
                  rows={2}
                  value={seoDescription}
                  onChange={(e) => setSeoDescription(e.target.value)}
                  placeholder={excerpt || "เว้นว่างเพื่อใช้คำโปรยย่อ (Excerpt)"}
                  className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-[12px] text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none shadow-2xs"
                />
              </div>

              {/* Real-time SEO Checklist */}
              <div className="rounded-lg border border-zinc-200/80 bg-white p-3.5 space-y-2">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                  รายการตรวจสอบ SEO อัตโนมัติ
                </div>
                <div className="space-y-1.5">
                  {seoAudit.checks.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-2 text-[12px]"
                    >
                      <span className="flex items-center gap-2 text-zinc-700">
                        {item.passed ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        ) : (
                          <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        )}
                        <span>{item.label}</span>
                      </span>
                      <span className="text-[11px] font-mono text-zinc-400 shrink-0">
                        {item.hint}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Live SERP / OpenGraph / JSON-LD Preview */}
            <div className="lg:col-span-6 space-y-3">
              <div className="inline-flex rounded-lg border border-zinc-200 bg-white p-0.5 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setSeoTab("google")}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[11px] font-medium transition cursor-pointer",
                    seoTab === "google"
                      ? "bg-zinc-900 text-white"
                      : "text-zinc-600 hover:text-zinc-900"
                  )}
                >
                  <Globe className="w-3 h-3" />
                  Google Search
                </button>
                <button
                  type="button"
                  onClick={() => setSeoTab("social")}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[11px] font-medium transition cursor-pointer",
                    seoTab === "social"
                      ? "bg-zinc-900 text-white"
                      : "text-zinc-600 hover:text-zinc-900"
                  )}
                >
                  <Share2 className="w-3 h-3" />
                  Social OG Card
                </button>
                <button
                  type="button"
                  onClick={() => setSeoTab("jsonld")}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[11px] font-medium transition cursor-pointer",
                    seoTab === "jsonld"
                      ? "bg-zinc-900 text-white"
                      : "text-zinc-600 hover:text-zinc-900"
                  )}
                >
                  <Code2 className="w-3 h-3" />
                  JSON-LD Schema
                </button>
              </div>

              {seoTab === "google" && (
                <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-2xs space-y-2">
                  <div className="flex items-center gap-2 text-[12px] text-zinc-600">
                    <div className="w-6 h-6 rounded-full bg-zinc-900 text-white text-[11px] font-bold flex items-center justify-center">
                      N
                    </div>
                    <div>
                      <div className="font-medium text-zinc-900 leading-none">
                        NextBlog
                      </div>
                      <div className="text-[11px] text-zinc-500">
                        https://nextblog.example.com › blog › {effectiveSlug}
                      </div>
                    </div>
                  </div>
                  <div className="text-[18px] font-medium text-[#1a0dab] hover:underline leading-snug line-clamp-1 cursor-pointer">
                    {effectiveSeoTitle}
                  </div>
                  <p className="text-[13px] text-zinc-600 leading-relaxed line-clamp-2">
                    {effectiveSeoDesc}
                  </p>
                  {noIndex && (
                    <div className="pt-1">
                      <span className="inline-flex items-center rounded bg-amber-50 px-2 py-0.5 text-[10px] font-mono text-amber-700 ring-1 ring-amber-600/20">
                        robots: noindex, nofollow (ซ่อนจาก Google)
                      </span>
                    </div>
                  )}
                </div>
              )}

              {seoTab === "social" && (
                <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden shadow-2xs">
                  {/* Dynamic OG Image Preview from /api/og */}
                  <div className="aspect-[1200/630] w-full bg-zinc-950 relative overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={ogImageUrl}
                      alt={effectiveSeoTitle}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-3.5 bg-zinc-50/70 border-t border-zinc-200 space-y-0.5">
                    <div className="text-[11px] font-mono uppercase text-zinc-400">
                      NEXTBLOG.EXAMPLE.COM
                    </div>
                    <div className="text-[13px] font-semibold text-zinc-900 line-clamp-1">
                      {effectiveSeoTitle}
                    </div>
                    <div className="text-[12px] text-zinc-500 line-clamp-1">
                      {effectiveSeoDesc}
                    </div>
                  </div>
                </div>
              )}

              {seoTab === "jsonld" && (
                <div className="rounded-xl border border-zinc-200 bg-zinc-900 text-zinc-100 p-4 shadow-2xs overflow-x-auto">
                  <div className="text-[10px] font-mono text-zinc-400 pb-2">
                    &lt;script type=&quot;application/ld+json&quot;&gt;
                  </div>
                  <pre className="text-[11px] font-mono leading-relaxed text-emerald-300">
                    {JSON.stringify(jsonLdPreview, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer toggles & Submit */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-zinc-200/80">
          <div className="flex flex-wrap items-center gap-5">
            <label className="inline-flex items-center gap-2 text-[12px] font-medium text-zinc-700 cursor-pointer">
              <input
                type="checkbox"
                name="featured"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
              />
              <span>ปักหมุดเป็นบทความแนะนำ (Featured)</span>
            </label>

            <label className="inline-flex items-center gap-2 text-[12px] font-medium text-zinc-600 cursor-pointer">
              <input
                type="checkbox"
                name="noIndex"
                checked={noIndex}
                onChange={(e) => setNoIndex(e.target.checked)}
                className="rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900"
              />
              <span>ซ่อนจาก Search Engine (noindex)</span>
            </label>
          </div>

          <div className="flex items-center gap-2">
            {isModal && (
              <button
                type="button"
                onClick={() => router.back()}
                className="rounded-lg border border-zinc-200 bg-white px-3.5 py-2 text-[12px] font-medium text-zinc-700 hover:bg-zinc-50 transition cursor-pointer"
              >
                ยกเลิก
              </button>
            )}
            <a
              href={`http://localhost:3002/api/draft?slug=${encodeURIComponent(
                effectiveSlug
              )}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3.5 py-2 text-[12px] font-medium text-zinc-700 hover:bg-zinc-50 shadow-2xs transition"
              title="เปิดดูบทความนี้บนเว็บแสดงผล (:3002) ในโหมด Next.js Draft Mode"
            >
              <Eye className="w-3.5 h-3.5 text-zinc-500" />
              ดูหน้าเว็บจริง (Draft Preview)
            </a>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-4 py-2 text-[12px] font-medium text-white hover:bg-zinc-800 disabled:opacity-50 shadow-2xs transition cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              {isPending ? "กำลังบันทึก..." : "บันทึกบทความและ SEO"}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
