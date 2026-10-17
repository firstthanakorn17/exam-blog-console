import Link from "next/link";
import { getPosts } from "@/lib/cache";
import { formatDate } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

export default async function RecentPostsSlotPage() {
  const posts = await getPosts();
  const recent = posts.slice(0, 5);

  return (
    <div className="rounded-xl border border-zinc-200/90 bg-white shadow-2xs flex flex-col justify-between h-full overflow-hidden">
      <div>
        <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between">
          <h2 className="text-[13px] font-semibold text-zinc-900">
            บทความที่แก้ไขล่าสุด
          </h2>
          <Link
            href="/console/posts"
            className="inline-flex items-center gap-1 text-[12px] font-medium text-zinc-500 hover:text-zinc-900 transition"
          >
            <span>ดูทั้งหมด</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="divide-y divide-zinc-100">
          {recent.map((post) => (
            <div
              key={post.id}
              className="px-5 py-3.5 flex items-center justify-between gap-4 hover:bg-zinc-50/70 transition"
            >
              <div className="min-w-0 space-y-0.5">
                <a
                  href={`/console/posts/${post.id}/edit`}
                  className="text-[13px] font-medium text-zinc-900 hover:underline truncate block"
                >
                  {post.title}
                </a>
                <div className="flex items-center gap-2 text-[11px] text-zinc-400">
                  <span className="font-mono text-zinc-500">
                    /{post.categorySlug}
                  </span>
                  <span>·</span>
                  <span>{formatDate(post.updatedAt)}</span>
                </div>
              </div>

              <span
                className={`shrink-0 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                  post.status === "published"
                    ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20"
                    : "bg-amber-50 text-amber-700 ring-1 ring-amber-600/20"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    post.status === "published"
                      ? "bg-emerald-500"
                      : "bg-amber-500"
                  }`}
                />
                {post.status === "published" ? "เผยแพร่แล้ว" : "ฉบับร่าง"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
