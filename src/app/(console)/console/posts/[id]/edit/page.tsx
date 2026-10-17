import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPostById, getCategories } from "@/lib/cache";
import { PostEditorForm } from "@/components/console/post-editor-form";
import { ArrowLeft } from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const post = await getPostById(id);
  if (!post) {
    return { title: "ไม่พบบทความ" };
  }
  return {
    title: `แก้ไข: ${post.title}`,
    description: post.excerpt,
  };
}

async function EditPostContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [post, categories] = await Promise.all([
    getPostById(id),
    getCategories(),
  ]);

  if (!post) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <p className="text-[11px] font-mono text-zinc-400">ID: {post.id}</p>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
          {post.title}
        </h1>
      </div>

      <div className="rounded-xl border border-zinc-200/90 bg-white p-6 shadow-2xs">
        <PostEditorForm post={post} categories={categories} />
      </div>
    </div>
  );
}

export default function FullPostEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <Link
        href="/console/posts"
        className="inline-flex items-center gap-1.5 text-[12px] font-medium text-zinc-500 hover:text-zinc-900"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        กลับไปหน้ารายการบทความ
      </Link>

      <Suspense
        fallback={
          <div className="h-96 rounded-xl border border-zinc-200/80 bg-white animate-pulse" />
        }
      >
        <EditPostContent params={params} />
      </Suspense>
    </div>
  );
}
