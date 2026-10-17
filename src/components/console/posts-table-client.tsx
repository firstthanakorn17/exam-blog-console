"use client";

import Link from "next/link";
import { useState, useOptimistic, useTransition } from "react";
import { toast } from "sonner";
import type { Post, PostStatus } from "@/lib/db";
import {
  togglePostStatusAction,
  deletePostAction,
  bulkUpdatePostsAction,
} from "@/actions/post.actions";
import { formatDate, evaluateSeoScore, cn } from "@/lib/utils";
import {
  Pencil,
  FilePenLine,
  Trash2,
  Star,
  CheckCircle2,
  FileEdit,
  Archive,
  X,
} from "lucide-react";

export function PostsTableClient({ posts }: { posts: Post[] }) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();

  const [optimisticPosts, applyOptimistic] = useOptimistic<
    Post[],
    | { type: "toggle"; id: string; status: PostStatus }
    | { type: "bulk-status"; ids: string[]; status: PostStatus }
    | { type: "bulk-delete"; ids: string[] }
  >(posts, (current, action) => {
    if (action.type === "toggle") {
      return current.map((p) =>
        p.id === action.id ? { ...p, status: action.status } : p
      );
    }
    if (action.type === "bulk-status") {
      const idSet = new Set(action.ids);
      return current.map((p) =>
        idSet.has(p.id) ? { ...p, status: action.status } : p
      );
    }
    if (action.type === "bulk-delete") {
      const idSet = new Set(action.ids);
      return current.filter((p) => !idSet.has(p.id));
    }
    return current;
  });

  const allSelected =
    optimisticPosts.length > 0 &&
    selectedIds.length === optimisticPosts.length;

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(optimisticPosts.map((p) => p.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleToggleSingleStatus = (post: Post) => {
    const nextStatus: PostStatus =
      post.status === "published" ? "draft" : "published";

    startTransition(async () => {
      applyOptimistic({ type: "toggle", id: post.id, status: nextStatus });
      const res = await togglePostStatusAction(post.id, nextStatus);
      if (res.ok) {
        toast.success(
          `เปลี่ยนสถานะเป็น "${
            nextStatus === "published" ? "เผยแพร่แล้ว" : "ฉบับร่าง"
          }" เรียบร้อย`
        );
      }
    });
  };

  const handleDeleteSingle = (id: string) => {
    startTransition(async () => {
      applyOptimistic({ type: "bulk-delete", ids: [id] });
      const res = await deletePostAction(id);
      if (res.ok) {
        setSelectedIds((prev) => prev.filter((item) => item !== id));
        toast.success("ลบบทความเรียบร้อยแล้ว");
      }
    });
  };

  const handleBulkAction = (
    operation: "publish" | "draft" | "archive" | "delete"
  ) => {
    const targetIds = [...selectedIds];
    if (!targetIds.length) return;

    startTransition(async () => {
      if (operation === "delete") {
        applyOptimistic({ type: "bulk-delete", ids: targetIds });
      } else {
        const statusMap: Record<"publish" | "draft" | "archive", PostStatus> = {
          publish: "published",
          draft: "draft",
          archive: "archived",
        };
        applyOptimistic({
          type: "bulk-status",
          ids: targetIds,
          status: statusMap[operation],
        });
      }

      const res = await bulkUpdatePostsAction(targetIds, operation);
      if (res.ok) {
        setSelectedIds([]);
        toast.success(`ดำเนินการกับ ${res.count} บทความเรียบร้อยแล้ว`);
      }
    });
  };

  return (
    <div className="relative">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-200/80 bg-zinc-50/60 text-[11px] font-medium text-zinc-500">
              <th className="py-2.5 pl-5 pr-2 w-9">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleSelectAll}
                  aria-label="เลือกบทความทั้งหมด"
                  className="rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900 cursor-pointer"
                />
              </th>
              <th className="py-2.5 px-4">ชื่อบทความ</th>
              <th className="py-2.5 px-4">หมวดหมู่</th>
              <th className="py-2.5 px-4">คะแนน SEO</th>
              <th className="py-2.5 px-4">สถานะ (กดเพื่อสลับ)</th>
              <th className="py-2.5 px-4">แก้ไขล่าสุด</th>
              <th className="py-2.5 px-5 text-right">การจัดการ</th>
            </tr>
          </thead>
          <tbody>
            {optimisticPosts.map((post) => {
              const isSelected = selectedIds.includes(post.id);
              const { score } = evaluateSeoScore({
                title: post.title,
                slug: post.slug,
                excerpt: post.excerpt,
                content: post.content,
                seoTitle: post.seoTitle,
                seoDescription: post.seoDescription,
                focusKeyword: post.focusKeyword,
              });

              return (
                <tr
                  key={post.id}
                  className={cn(
                    "border-b border-zinc-100 last:border-0 transition group",
                    isSelected ? "bg-zinc-100/70" : "hover:bg-zinc-50/70"
                  )}
                >
                  <td className="py-3.5 pl-5 pr-2">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelectOne(post.id)}
                      aria-label={`เลือก ${post.title}`}
                      className="rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900 cursor-pointer"
                    />
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        {post.featured && (
                          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400 shrink-0" />
                        )}
                        <a
                          href={`/console/posts/${post.id}/edit`}
                          className="font-medium text-[13px] text-zinc-900 hover:underline"
                        >
                          {post.title}
                        </a>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-400">
                        <span>/{post.slug}</span>
                        {post.focusKeyword && (
                          <span className="rounded bg-zinc-100 px-1.5 py-0.2 text-[10px] text-zinc-600">
                            kw: {post.focusKeyword}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center rounded-md bg-zinc-100 px-2 py-0.5 font-mono text-[11px] text-zinc-600">
                      /{post.categorySlug}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded-md px-2 py-0.5 font-mono text-[11px] font-semibold",
                        score >= 80
                          ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20"
                          : score >= 60
                          ? "bg-amber-50 text-amber-700 ring-1 ring-amber-600/20"
                          : "bg-zinc-100 text-zinc-600"
                      )}
                    >
                      {score}/100
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <button
                      type="button"
                      onClick={() => handleToggleSingleStatus(post)}
                      disabled={isPending}
                      title="คลิกเพื่อสลับสถานะทันที"
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium transition cursor-pointer",
                        post.status === "published"
                          ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20 hover:bg-emerald-100/70"
                          : post.status === "draft"
                          ? "bg-amber-50 text-amber-700 ring-1 ring-amber-600/20 hover:bg-amber-100/70"
                          : "bg-zinc-100 text-zinc-600 ring-1 ring-zinc-300"
                      )}
                    >
                      <span
                        className={cn(
                          "w-1.5 h-1.5 rounded-full",
                          post.status === "published"
                            ? "bg-emerald-500"
                            : post.status === "draft"
                            ? "bg-amber-500"
                            : "bg-zinc-400"
                        )}
                      />
                      {post.status === "published"
                        ? "เผยแพร่แล้ว"
                        : post.status === "draft"
                        ? "ฉบับร่าง"
                        : "คลังเก็บ"}
                    </button>
                  </td>

                  <td className="py-3.5 px-4 text-[12px] text-zinc-500">
                    {formatDate(post.updatedAt)}
                  </td>

                  <td className="py-3.5 px-5 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      {/* Soft Navigation Link triggers Intercepting Route Modal @modal/(.)[id]/edit */}
                      <Link
                        href={`/console/posts/${post.id}/edit`}
                        className="inline-flex items-center gap-1 rounded-md border border-zinc-200 bg-white px-2.5 py-1 text-[12px] font-medium text-zinc-700 hover:bg-zinc-50 hover:border-zinc-300 shadow-2xs transition"
                        title="เปิดหน้าต่างแก้ไขด่วน (Intercepting Route Modal)"
                      >
                        <Pencil className="w-3 h-3 text-zinc-400" />
                        แก้ไขด่วน
                      </Link>

                      {/* Direct Link opens Full Page Editor with Split-View & Zen Mode */}
                      <a
                        href={`/console/posts/${post.id}/edit`}
                        className="inline-flex items-center gap-1 rounded-md bg-zinc-900 px-2.5 py-1 text-[12px] font-medium text-white hover:bg-zinc-800 shadow-2xs transition"
                        title="เปิดหน้าแก้ไขบทความฉบับเต็ม (Full Editor + SEO Studio)"
                      >
                        <FilePenLine className="w-3 h-3" />
                        แก้ไขเต็มหน้า
                      </a>

                      <button
                        type="button"
                        onClick={() => handleDeleteSingle(post.id)}
                        disabled={isPending}
                        className="inline-flex items-center justify-center rounded-md border border-transparent p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                        title="ลบบทความ"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {optimisticPosts.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="py-12 text-center text-[13px] text-zinc-400"
                >
                  ไม่พบบทความที่ตรงกับการค้นหา
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Floating Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-white shadow-2xl">
          <span className="text-[12px] font-medium pr-2 border-r border-zinc-700">
            เลือกแล้ว {selectedIds.length} รายการ
          </span>

          <button
            type="button"
            disabled={isPending}
            onClick={() => handleBulkAction("publish")}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-[12px] font-medium text-white hover:bg-emerald-500 transition cursor-pointer"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            เผยแพร่ทั้งหมด
          </button>

          <button
            type="button"
            disabled={isPending}
            onClick={() => handleBulkAction("draft")}
            className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-800 px-3 py-1.5 text-[12px] font-medium text-zinc-200 hover:bg-zinc-700 transition cursor-pointer"
          >
            <FileEdit className="w-3.5 h-3.5" />
            เปลี่ยนเป็นร่าง
          </button>

          <button
            type="button"
            disabled={isPending}
            onClick={() => handleBulkAction("archive")}
            className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-800 px-3 py-1.5 text-[12px] font-medium text-zinc-200 hover:bg-zinc-700 transition cursor-pointer"
          >
            <Archive className="w-3.5 h-3.5" />
            เก็บเข้าคลัง
          </button>

          <button
            type="button"
            disabled={isPending}
            onClick={() => handleBulkAction("delete")}
            className="inline-flex items-center gap-1.5 rounded-lg bg-red-600/90 px-3 py-1.5 text-[12px] font-medium text-white hover:bg-red-500 transition cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            ลบ
          </button>

          <button
            type="button"
            onClick={() => setSelectedIds([])}
            className="p-1 text-zinc-400 hover:text-white transition cursor-pointer"
            title="ยกเลิกการเลือก"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
