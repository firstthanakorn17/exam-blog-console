import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { getPosts } from "@/lib/cache";
import { PostsTableClient } from "@/components/console/posts-table-client";
import { Plus, Search } from "lucide-react";

export const metadata: Metadata = {
  title: "บทความทั้งหมด",
};

async function PostsListDynamicContent({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const { q = "", status = "all" } = await searchParams;
  const allPosts = await getPosts();

  const filtered = allPosts.filter((p) => {
    const matchStatus = status === "all" || p.status === status;
    const matchQuery =
      !q ||
      p.title.toLowerCase().includes(q.toLowerCase()) ||
      p.slug.toLowerCase().includes(q.toLowerCase()) ||
      (p.focusKeyword || "").toLowerCase().includes(q.toLowerCase());
    return matchStatus && matchQuery;
  });

  return (
    <div className="rounded-xl border border-zinc-200/90 bg-white shadow-2xs overflow-hidden">
      {/* Toolbar */}
      <form
        method="GET"
        action="/console/posts"
        className="p-4 border-b border-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-50/40"
      >
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-2.5" />
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="ค้นหาชื่อบทความ, slug หรือคีย์เวิร์ด SEO..."
            className="w-full rounded-lg border border-zinc-200 bg-white pl-9 pr-3 py-1.5 text-[13px] text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none shadow-2xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            name="status"
            defaultValue={status}
            className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-[12px] font-medium text-zinc-700 focus:border-zinc-900 focus:outline-none shadow-2xs"
          >
            <option value="all">ทุกสถานะ ({allPosts.length})</option>
            <option value="published">เผยแพร่แล้ว (Published)</option>
            <option value="draft">ฉบับร่าง (Draft)</option>
            <option value="archived">เก็บเข้าคลัง (Archived)</option>
          </select>

          <button
            type="submit"
            className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-[12px] font-medium text-zinc-700 hover:bg-zinc-50 shadow-2xs transition cursor-pointer"
          >
            กรองข้อมูล
          </button>
        </div>
      </form>

      {/* Interactive Table + Bulk Action Bar */}
      <PostsTableClient posts={filtered} />
    </div>
  );
}

export default function PostsListPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1">
          <p className="text-[11px] font-medium uppercase tracking-widest text-zinc-400">
            Content & SEO Management
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
            บทความทั้งหมด
          </h1>
          <p className="text-[13px] text-zinc-500">
            ติ๊กเลือกหลายรายการเพื่อจัดการพร้อมกัน (Bulk Actions) หรือตรวจสอบคะแนน SEO รายบทความ
          </p>
        </div>

        <Link
          href="/console/posts/new"
          className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-3.5 py-2 text-[13px] font-medium text-white hover:bg-zinc-800 shadow-2xs transition self-start"
        >
          <Plus className="w-3.5 h-3.5" />
          เขียนบทความใหม่
        </Link>
      </div>

      <Suspense
        fallback={
          <div className="h-80 rounded-xl border border-zinc-200/80 bg-white animate-pulse" />
        }
      >
        <PostsListDynamicContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
