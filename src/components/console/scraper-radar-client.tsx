"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  triggerScraperRunAction,
  simulateIncomingFBWebhookAction,
  approveScrapedItemAction,
  rejectScrapedItemAction,
  addScrapeSourceAction,
  deleteScrapeSourceAction,
} from "@/actions/scraper.actions";
import {
  Radar,
  RefreshCw,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  ExternalLink,
  Plus,
  Trash2,
  Sparkles,
  Building2,
  GraduationCap,
  Calendar,
  Banknote,
  Webhook,
} from "lucide-react";

export interface ScrapeSource {
  id: string;
  name: string;
  pageUrl: string;
  categorySlug: string;
  includeKeywords: string;
  excludeKeywords: string;
  enabled: boolean;
  lastScrapedAt: string;
}

export interface ExamMeta {
  organization: string;
  positions: string;
  educationLevel: string;
  salaryRange: string;
  applyPeriod: string;
  applicationStatus: string;
  officialLink: string;
}

export interface ScrapedItem {
  id: string;
  sourceId: string;
  sourceName: string;
  fbPostId: string;
  fbPostUrl: string;
  rawText: string;
  postedAt: string;
  scrapedAt: string;
  status: "pending" | "approved" | "rejected" | "filtered_spam";
  filterReason: string;
  matchedKeywords: string[];
  confidenceScore: number;
  examMeta: ExamMeta;
  generatedTitle: string;
  generatedSlug: string;
  generatedExcerpt: string;
  generatedContent: string;
  generatedFocusKeyword: string;
  publishedPostId?: string;
}

export function ScraperRadarClient({
  initialSources,
  initialItems,
}: {
  initialSources: ScrapeSource[];
  initialItems: ScrapedItem[];
}) {
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [showAddSource, setShowAddSource] = useState(false);
  const [isPending, startTransition] = useTransition();

  const pendingCount = initialItems.filter((i) => i.status === "pending").length;
  const approvedCount = initialItems.filter(
    (i) => i.status === "approved"
  ).length;
  const spamCount = initialItems.filter(
    (i) => i.status === "filtered_spam"
  ).length;

  const filteredItems = initialItems.filter((item) =>
    filterStatus === "all" ? true : item.status === filterStatus
  );

  const handleRunScraper = () => {
    startTransition(async () => {
      const res = await triggerScraperRunAction();
      toast.success(
        `ดึงข้อมูลจาก Facebook Pages สำเร็จ (พบรายการใหม่ ${res?.newlyAdded ?? 0} รายการ)`
      );
    });
  };

  const handleSimulateWebhook = () => {
    startTransition(async () => {
      await simulateIncomingFBWebhookAction();
      toast.success(
        "จำลองรับโพสต์ประกาศสอบใหม่ผ่าน Apify Webhook สำเร็จ! (กรมสรรพากร 450 อัตรา)"
      );
    });
  };

  const handleApprove = (item: ScrapedItem) => {
    startTransition(async () => {
      const res = await approveScrapedItemAction(item.id);
      if (res?.ok) {
        toast.success(
          `อนุมัติและเผยแพร่บทความ "${item.generatedTitle}" ขึ้นเว็บแสดงผล (:3002) เรียบร้อยแล้ว!`
        );
      } else {
        toast.error(res?.error || "เกิดข้อผิดพลาดในการอนุมัติ");
      }
    });
  };

  const handleReject = (id: string) => {
    startTransition(async () => {
      await rejectScrapedItemAction(id);
      toast("ปฏิเสธข่าวที่ดึงมาแล้ว");
    });
  };

  const handleAddSource = (formData: FormData) => {
    startTransition(async () => {
      await addScrapeSourceAction(formData);
      setShowAddSource(false);
      toast.success("เพิ่มเพจ Facebook เป้าหมายเรียบร้อยแล้ว");
    });
  };

  const handleDeleteSource = (id: string) => {
    startTransition(async () => {
      await deleteScrapeSourceAction(id);
      toast("ลบเพจต้นทางแล้ว");
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Action Header */}
      <div className="rounded-2xl border border-zinc-200/90 bg-white p-6 shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 text-indigo-700 px-3 py-1 text-[11px] font-semibold">
            <Radar className="w-3.5 h-3.5" />
            <span>Method 1: Apify Facebook Scraper API + Webhook Pipeline</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900">
            ระบบดักจับโพสต์ประกาศสอบจาก Facebook (Exam Scraper Radar)
          </h1>
          <p className="text-[13px] text-zinc-500">
            ดึงโพสต์จากเพจราชการ/รัฐวิสาหกิจ คัดกรองโพสต์ขายคอร์สทิ้งอัตโนมัติ สกัดตารางข้อมูลสอบ และแปลงเป็นบทความ SEO พร้อมขึ้นเว็บในคลิกเดียว
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleSimulateWebhook}
            disabled={isPending}
            className="inline-flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 px-4 py-2.5 text-[12.5px] font-semibold text-indigo-700 transition cursor-pointer disabled:opacity-50"
          >
            <Webhook className="w-4 h-4" />
            <span>จำลองรับโพสต์ใหม่ (Webhook Demo)</span>
          </button>

          <button
            type="button"
            onClick={handleRunScraper}
            disabled={isPending}
            className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 px-4 py-2.5 text-[12.5px] font-semibold text-white shadow-xs transition cursor-pointer disabled:opacity-50"
          >
            <RefreshCw
              className={`w-4 h-4 ${isPending ? "animate-spin" : ""}`}
            />
            <span>ดึงโพสต์จาก Facebook ทันที</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-zinc-200/90 bg-white p-4 shadow-2xs">
          <div className="text-[11px] font-medium text-zinc-400">
            เพจ Facebook ที่เฝ้าดู
          </div>
          <div className="text-2xl font-bold text-zinc-900 mt-1">
            {initialSources.length} เพจ
          </div>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-4 shadow-2xs">
          <div className="text-[11px] font-medium text-amber-700">
            ข่าวสอบรอตรวจอนุมัติ (Pending)
          </div>
          <div className="text-2xl font-bold text-amber-900 mt-1">
            {pendingCount} รายการ
          </div>
        </div>
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4 shadow-2xs">
          <div className="text-[11px] font-medium text-emerald-700">
            อนุมัติขึ้นเว็บแล้ว (Published)
          </div>
          <div className="text-2xl font-bold text-emerald-900 mt-1">
            {approvedCount} บทความ
          </div>
        </div>
        <div className="rounded-xl border border-rose-200 bg-rose-50/40 p-4 shadow-2xs">
          <div className="text-[11px] font-medium text-rose-700">
            บล็อกโพสต์ขายคอร์ส/โฆษณาอัตโนมัติ
          </div>
          <div className="text-2xl font-bold text-rose-900 mt-1">
            {spamCount} โพสต์
          </div>
        </div>
      </div>

      {/* Watched Facebook Pages Manager */}
      <div className="rounded-2xl border border-zinc-200/90 bg-white p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[14px] font-bold text-zinc-900">
              เพจ Facebook ต้นทางและกฎการกรองคำ (Source Watchlist & Keyword Rules)
            </h2>
            <p className="text-[12px] text-zinc-500">
              กำหนดเพจเป้าหมาย คำค้นที่ต้องการดักจับ (Include) และคำโฆษณาที่ต้องการบล็อกทิ้ง (Exclude)
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowAddSource((v) => !v)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 px-3 py-1.5 text-[12px] font-medium text-zinc-800 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>เพิ่มเพจ Facebook</span>
          </button>
        </div>

        {showAddSource && (
          <form
            action={handleAddSource}
            className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-[12.5px]"
          >
            <input
              name="name"
              required
              placeholder="ชื่อเพจ (เช่น เพจสำนักงาน ก.พ.)"
              className="rounded-lg border border-zinc-200 bg-white px-3 py-2"
            />
            <input
              name="pageUrl"
              required
              placeholder="URL เพจ Facebook (เช่น https://www.facebook.com/OCSC.go.th)"
              className="rounded-lg border border-zinc-200 bg-white px-3 py-2"
            />
            <input
              name="includeKeywords"
              defaultValue="รับสมัครสอบ,เปิดสอบ,ภาค ก,พนักงานราชการ"
              placeholder="คำค้นที่ต้องการดึง (คั่นด้วยจุลภาค)"
              className="rounded-lg border border-zinc-200 bg-white px-3 py-2"
            />
            <input
              name="excludeKeywords"
              defaultValue="คอร์สติว,โปรโมชั่น,ลดราคา,ทักแชท"
              placeholder="คำต้องห้าม/โฆษณา (คั่นด้วยจุลภาค)"
              className="rounded-lg border border-zinc-200 bg-white px-3 py-2"
            />
            <div className="md:col-span-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddSource(false)}
                className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-zinc-600 cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="rounded-lg bg-zinc-900 text-white px-4 py-1.5 font-medium cursor-pointer"
              >
                บันทึกเพจต้นทาง
              </button>
            </div>
          </form>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {initialSources.map((src) => (
            <div
              key={src.id}
              className="rounded-xl border border-zinc-200/80 bg-zinc-50/50 p-3.5 space-y-2 flex flex-col justify-between"
            >
              <div className="space-y-1.5">
                <div className="flex items-start justify-between gap-2">
                  <a
                    href={src.pageUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[13px] font-bold text-zinc-900 hover:text-indigo-600 inline-flex items-center gap-1"
                  >
                    <span>{src.name}</span>
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                  <button
                    type="button"
                    onClick={() => handleDeleteSource(src.id)}
                    className="text-zinc-400 hover:text-rose-600 p-0.5 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="text-[11px] text-zinc-500">
                  <strong className="text-emerald-700">ดักจับคำว่า:</strong>{" "}
                  {src.includeKeywords}
                </div>
                <div className="text-[11px] text-zinc-500">
                  <strong className="text-rose-700">บล็อกคำว่า:</strong>{" "}
                  {src.excludeKeywords}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filter Tabs for Scraped Inbox */}
      <div className="flex items-center gap-2 border-b border-zinc-200 pb-3 text-[12.5px]">
        {[
          { key: "all", label: `ทั้งหมด (${initialItems.length})` },
          { key: "pending", label: `รอตรวจสอบ (${pendingCount})` },
          { key: "approved", label: `เผยแพร่แล้ว (${approvedCount})` },
          {
            key: "filtered_spam",
            label: `ถูกบล็อกเพราะเป็นโฆษณา (${spamCount})`,
          },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setFilterStatus(tab.key)}
            className={`rounded-full px-3.5 py-1.5 font-semibold transition cursor-pointer ${
              filterStatus === tab.key
                ? "bg-zinc-900 text-white"
                : "bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-100"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Scraped Items Side-by-Side Comparison List */}
      <div className="space-y-4">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className={`rounded-2xl border bg-white p-5 shadow-2xs grid grid-cols-1 lg:grid-cols-12 gap-6 ${
              item.status === "filtered_spam"
                ? "border-rose-200 bg-rose-50/15"
                : item.status === "approved"
                ? "border-emerald-200"
                : "border-zinc-200/90"
            }`}
          >
            {/* Left Column: Raw Facebook Post */}
            <div className="lg:col-span-5 space-y-3 border-b lg:border-b-0 lg:border-r border-zinc-100 pb-4 lg:pb-0 lg:pr-5 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[12px] font-bold text-zinc-900">
                    {item.sourceName}
                  </span>
                  {item.status === "pending" && (
                    <span className="rounded-full bg-amber-100 text-amber-800 px-2.5 py-0.5 text-[11px] font-semibold">
                      รอตรวจสอบ (Confidence {item.confidenceScore}%)
                    </span>
                  )}
                  {item.status === "approved" && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-800 px-2.5 py-0.5 text-[11px] font-semibold">
                      <CheckCircle2 className="w-3 h-3" />
                      เผยแพร่ขึ้นเว็บแล้ว
                    </span>
                  )}
                  {item.status === "filtered_spam" && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 text-rose-800 px-2.5 py-0.5 text-[11px] font-semibold">
                      <ShieldAlert className="w-3 h-3" />
                      คัดกรองโฆษณาทิ้งอัตโนมัติ
                    </span>
                  )}
                  {item.status === "rejected" && (
                    <span className="rounded-full bg-zinc-200 text-zinc-600 px-2.5 py-0.5 text-[11px] font-semibold">
                      ปฏิเสธแล้ว
                    </span>
                  )}
                </div>

                <div className="rounded-xl border border-zinc-200/80 bg-zinc-50 p-3.5 text-[12.5px] text-zinc-700 whitespace-pre-wrap leading-relaxed font-sans">
                  {item.rawText}
                </div>

                <div className="text-[11.5px] text-zinc-500">
                  <strong>ผลการกรอง:</strong> {item.filterReason}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-[11.5px] text-zinc-400">
                <span>FB ID: {item.fbPostId}</span>
                <a
                  href={item.fbPostUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-indigo-600 hover:underline font-medium"
                >
                  <span>เปิดดูโพสต์ Facebook ต้นฉบับ</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Right Column: Extracted Exam Meta + SEO Article Preview + 1-Click Publish */}
            <div className="lg:col-span-7 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-1.5 text-[11.5px] font-semibold text-indigo-600">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>
                    ข้อมูลการสอบและบทความ SEO ที่ระบบสกัดและเรียบเรียงใหม่อัตโนมัติ
                  </span>
                </div>

                <h3 className="text-[16px] font-bold text-zinc-900 leading-snug">
                  {item.generatedTitle}
                </h3>

                <p className="text-[12.5px] text-zinc-600 leading-relaxed">
                  {item.generatedExcerpt}
                </p>

                {/* Structured Exam Summary Box */}
                <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-3.5 grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[12px]">
                  <div className="flex items-start gap-2">
                    <Building2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-zinc-400 block text-[10.5px]">
                        หน่วยงานที่เปิดสอบ
                      </span>
                      <strong className="text-zinc-800">
                        {item.examMeta.organization}
                      </strong>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <GraduationCap className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-zinc-400 block text-[10.5px]">
                        วุฒิการศึกษาที่รับ
                      </span>
                      <strong className="text-zinc-800">
                        {item.examMeta.educationLevel}
                      </strong>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Calendar className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-zinc-400 block text-[10.5px]">
                        กำหนดการรับสมัคร
                      </span>
                      <strong className="text-zinc-800">
                        {item.examMeta.applyPeriod}
                      </strong>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Banknote className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-zinc-400 block text-[10.5px]">
                        อัตราเงินเดือน
                      </span>
                      <strong className="text-zinc-800">
                        {item.examMeta.salaryRange}
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="text-[11.5px] text-zinc-500 font-mono">
                  SEO Slug: <span className="text-zinc-800">/blog/{item.generatedSlug}</span>{" "}
                  · Keywords:{" "}
                  <span className="text-indigo-600">
                    {item.generatedFocusKeyword}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-zinc-100 flex flex-wrap items-center justify-end gap-2.5">
                {item.status === "approved" ? (
                  <a
                    href={`http://localhost:3002/blog/${item.generatedSlug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 text-[12.5px] font-semibold transition"
                  >
                    <span>เปิดดูบทความที่เผยแพร่บนหน้าเว็บ (:3002)</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                ) : (
                  <>
                    {item.status !== "rejected" && (
                      <button
                        type="button"
                        onClick={() => handleReject(item.id)}
                        disabled={isPending}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 px-3.5 py-2 text-[12px] font-medium text-zinc-600 transition cursor-pointer"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>ไม่ใช้ข่าวนี้</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleApprove(item)}
                      disabled={isPending}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 text-[12.5px] font-semibold shadow-xs transition cursor-pointer disabled:opacity-50"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>อนุมัติและเผยแพร่ขึ้นเว็บทันที (1-Click Publish)</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
