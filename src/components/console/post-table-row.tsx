"use client";

import Link from "next/link";
import { useOptimistic, useTransition } from "react";
import { toast } from "sonner";
import type { Post, PostStatus } from "@/lib/db";
import {
  togglePostStatusAction,
  deletePostAction,
} from "@/actions/post.actions";
import { formatDate } from "@/lib/utils";
import { Pencil, Trash2, Star } from "lucide-react";

export function PostTableRow({ post }: { post: Post }) {
  const [isPending, startTransition] = useTransition();
  const [optimisticStatus, setOptimisticStatus] = useOptimistic<
    PostStatus,
    PostStatus
  >(post.status, (_current, nextStatus) => nextStatus);

  const handleToggleStatus = () => {
    const nextStatus: PostStatus =
      optimisticStatus === "published" ? "draft" : "published";

    startTransition(async () => {
      setOptimisticStatus(nextStatus);
      const res = await togglePostStatusAction(post.id, nextStatus);
      if (res.ok) {
        toast.success(
          `เปลี่ยนสถานะเป็น "${
            nextStatus === "published" ? "เผยแพร่แล้ว" : "ฉบับร่าง"
          }" เรียบร้อย`
        );
      } else {
        toast.error("ไม่สามารถเปลี่ยนสถานะได้");
      }
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      const res = await deletePostAction(post.id);
      if (res.ok) {
        toast.success("ลบบทความเรียบร้อยแล้ว");
      }
    });
  };

  return (
    <tr className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50/70 transition group">
      <td className="py-3.5 px-5">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            {post.featured && (
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400 shrink-0" />
            )}
            <Link
              href={`/console/posts/${post.id}/edit`}
              className="font-medium text-[13px] text-zinc-900 hover:underline"
            >
              {post.title}
            </Link>
          </div>
          <div className="text-[11px] font-mono text-zinc-400">
            /{post.slug}
          </div>
        </div>
      </td>

      <td className="py-3.5 px-4">
        <span className="inline-flex items-center rounded-md bg-zinc-100 px-2 py-0.5 font-mono text-[11px] text-zinc-600">
          /{post.categorySlug}
        </span>
      </td>

      <td className="py-3.5 px-4">
        <button
          type="button"
          onClick={handleToggleStatus}
          disabled={isPending}
          title="คลิกเพื่อสลับสถานะทันที"
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium transition cursor-pointer ${
            optimisticStatus === "published"
              ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20 hover:bg-emerald-100/70"
              : "bg-amber-50 text-amber-700 ring-1 ring-amber-600/20 hover:bg-amber-100/70"
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              optimisticStatus === "published"
                ? "bg-emerald-500"
                : "bg-amber-500"
            }`}
          />
          {optimisticStatus === "published" ? "เผยแพร่แล้ว" : "ฉบับร่าง"}
        </button>
      </td>

      <td className="py-3.5 px-4 text-[12px] text-zinc-500">
        {formatDate(post.updatedAt)}
      </td>

      <td className="py-3.5 px-5 text-right">
        <div className="inline-flex items-center gap-1.5">
          <Link
            href={`/console/posts/${post.id}/edit`}
            className="inline-flex items-center gap-1.5 rounded-md border border-zinc-200 bg-white px-2.5 py-1 text-[12px] font-medium text-zinc-700 hover:bg-zinc-50 hover:border-zinc-300 shadow-2xs transition"
          >
            <Pencil className="w-3 h-3 text-zinc-400" />
            แก้ไขด่วน
          </Link>

          <button
            type="button"
            onClick={handleDelete}
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
}
