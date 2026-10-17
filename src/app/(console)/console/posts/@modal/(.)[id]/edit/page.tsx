import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getPostById, getCategories } from "@/lib/cache";
import { InterceptDialog } from "@/components/console/intercept-dialog";
import { PostEditorForm } from "@/components/console/post-editor-form";

async function ModalContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [post, categories] = await Promise.all([
    getPostById(id),
    getCategories(),
  ]);

  if (!post) {
    notFound();
  }

  return (
    <InterceptDialog
      title={`แก้ไขด่วน: ${post.title}`}
      subtitle="กำลังแสดงผ่าน Intercepting Route (@modal/(.)[id]/edit) — หากกด Refresh จะสลับไปหน้า Full Editor อัตโนมัติ"
    >
      <PostEditorForm post={post} categories={categories} isModal />
    </InterceptDialog>
  );
}

export default function InterceptedQuickEditModal({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="fixed inset-0 z-50 bg-zinc-950/35 backdrop-blur-[2px] flex items-center justify-center p-4">
          <div className="w-full max-w-xl rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl space-y-4">
            <div className="h-5 w-48 rounded bg-zinc-200 animate-pulse" />
            <div className="h-48 w-full rounded-xl bg-zinc-100 animate-pulse" />
          </div>
        </div>
      }
    >
      <ModalContent params={params} />
    </Suspense>
  );
}
