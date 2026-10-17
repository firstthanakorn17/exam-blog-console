import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { getCategories, getPosts } from "@/lib/cache";
import {
  CreateCategoryForm,
  DeleteCategoryButton,
} from "@/components/console/category-manager";
import { ChevronRight, Folder } from "lucide-react";

export const metadata: Metadata = {
  title: "หมวดหมู่บทความ",
};

async function CategoryTreeContent({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const { slug } = await params;
  const activePath = slug && slug.length > 0 ? slug.join("/") : null;

  const [categories, posts] = await Promise.all([getCategories(), getPosts()]);

  const visibleCategories = categories.filter(
    (c) => c.parentSlug === activePath
  );

  return (
    <>
      <div className="flex items-center flex-wrap gap-1.5 rounded-lg border border-zinc-200/90 bg-white px-3.5 py-2 text-[12px] shadow-2xs">
        <Link
          href="/console/categories"
          className={`font-medium ${
            !activePath
              ? "text-zinc-900 font-semibold"
              : "text-zinc-500 hover:text-zinc-900"
          }`}
        >
          หมวดหมู่ทั้งหมด
        </Link>
        {slug?.map((segment, index) => {
          const href = `/console/categories/${slug.slice(0, index + 1).join("/")}`;
          const isLast = index === slug.length - 1;
          return (
            <span key={href} className="inline-flex items-center gap-1.5">
              <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
              <Link
                href={href}
                className={`font-mono ${
                  isLast
                    ? "text-zinc-900 font-semibold"
                    : "text-zinc-500 hover:text-zinc-900"
                }`}
              >
                {segment}
              </Link>
            </span>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8">
          <div className="rounded-xl border border-zinc-200/90 bg-white shadow-2xs divide-y divide-zinc-100 overflow-hidden">
            {visibleCategories.map((cat) => {
              const subCount = categories.filter(
                (c) => c.parentSlug === cat.slug
              ).length;
              const postCount = posts.filter(
                (p) =>
                  p.categorySlug === cat.slug ||
                  p.categorySlug.startsWith(`${cat.slug}/`)
              ).length;

              return (
                <div
                  key={cat.id}
                  className="p-4 flex items-center justify-between gap-4 hover:bg-zinc-50/70 transition"
                >
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <Folder className="w-4 h-4 text-zinc-400 shrink-0" />
                      <Link
                        href={`/console/categories/${cat.slug}`}
                        className="text-[13px] font-semibold text-zinc-900 hover:underline"
                      >
                        {cat.name}
                      </Link>
                      <span className="font-mono text-[11px] text-zinc-400">
                        /{cat.slug}
                      </span>
                    </div>
                    <p className="text-[12px] text-zinc-500 pl-6">
                      {cat.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    <Link
                      href={`/console/categories/${cat.slug}`}
                      className="rounded-md bg-zinc-100 px-2.5 py-1 text-[11px] font-medium text-zinc-600 hover:bg-zinc-200/70 transition"
                    >
                      {subCount} หมวดย่อย · {postCount} บทความ
                    </Link>
                    <DeleteCategoryButton id={cat.id} />
                  </div>
                </div>
              );
            })}

            {visibleCategories.length === 0 && (
              <div className="p-10 text-center text-[13px] text-zinc-400">
                ยังไม่มีหมวดหมู่ย่อยในระดับนี้ สามารถเพิ่มได้จากฟอร์มด้านขวา
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-4">
          <CreateCategoryForm currentParentSlug={activePath} />
        </div>
      </div>
    </>
  );
}

export default function CategoriesCatchAllPage({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <p className="text-[11px] font-medium uppercase tracking-widest text-zinc-400">
          Taxonomy & Hierarchy
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
          หมวดหมู่บทความ
        </h1>
        <p className="text-[13px] text-zinc-500">
          คลิกที่ชื่อหมวดหมู่เพื่อดูหมวดหมู่ย่อยภายในแต่ละระดับ
        </p>
      </div>

      <Suspense
        fallback={
          <div className="h-64 rounded-xl border border-zinc-200/80 bg-white animate-pulse" />
        }
      >
        <CategoryTreeContent params={params} />
      </Suspense>
    </div>
  );
}
