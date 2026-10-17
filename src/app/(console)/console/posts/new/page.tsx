import Link from "next/link";
import type { Metadata } from "next";
import { getCategories } from "@/lib/cache";
import { PostEditorForm } from "@/components/console/post-editor-form";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "เขียนบทความใหม่",
};

export default async function NewPostPage() {
  const categories = await getCategories();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="space-y-1">
        <Link
          href="/console/posts"
          className="inline-flex items-center gap-1.5 text-[12px] font-medium text-zinc-500 hover:text-zinc-900 mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          กลับไปหน้ารายการบทความ
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
          เขียนบทความใหม่
        </h1>
        <p className="text-[13px] text-zinc-500">
          กรอกรายละเอียดและเนื้อหาบทความด้านล่างเพื่อสร้างรายการใหม่
        </p>
      </div>

      <div className="rounded-xl border border-zinc-200/90 bg-white p-6 shadow-2xs">
        <PostEditorForm categories={categories} />
      </div>
    </div>
  );
}
