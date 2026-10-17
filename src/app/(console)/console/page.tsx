import Link from "next/link";
import { Plus, ArrowUpRight } from "lucide-react";

export default function ConsoleOverviewPage() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-zinc-200/80">
      <div className="space-y-1">
        <p className="text-[11px] font-medium uppercase tracking-widest text-zinc-400">
          Editorial Workspace
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
          ภาพรวมระบบจัดการบทความ
        </h1>
        <p className="text-[13px] text-zinc-500">
          ติดตามสถิติการเผยแพร่ รายการแก้ไขล่าสุด และประวัติการทำงานของระบบแบบเรียลไทม์
        </p>
      </div>

      <div className="flex items-center gap-2.5 shrink-0">
        <Link
          href="/console/posts"
          className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3.5 py-2 text-[13px] font-medium text-zinc-700 hover:bg-zinc-50 hover:border-zinc-300 shadow-2xs transition"
        >
          <span>จัดการบทความ</span>
          <ArrowUpRight className="w-3.5 h-3.5 text-zinc-400" />
        </Link>
        <Link
          href="/console/posts/new"
          className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-3.5 py-2 text-[13px] font-medium text-white hover:bg-zinc-800 shadow-2xs transition"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>เขียนบทความใหม่</span>
        </Link>
      </div>
    </div>
  );
}
