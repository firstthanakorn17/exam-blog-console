"use client";

import { useActionState, useEffect, useTransition } from "react";
import { toast } from "sonner";
import {
  createCategoryAction,
  deleteCategoryAction,
  type CategoryActionState,
} from "@/actions/category.actions";
import { Plus, Trash2 } from "lucide-react";

const initialState: CategoryActionState = {};

export function CreateCategoryForm({
  currentParentSlug,
}: {
  currentParentSlug: string | null;
}) {
  const [state, formAction, isPending] = useActionState(
    createCategoryAction,
    initialState
  );

  useEffect(() => {
    if (state.success && state.message) {
      toast.success(state.message);
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state]);

  return (
    <form
      action={formAction}
      className="rounded-xl border border-zinc-200/90 bg-white p-5 shadow-2xs space-y-4"
    >
      <div className="space-y-0.5">
        <div className="text-[13px] font-semibold text-zinc-900">
          สร้างหมวดหมู่ใหม่
        </div>
        <div className="text-[11px] text-zinc-400">
          {currentParentSlug ? (
            <>
              ภายใต้หมวดหมู่{" "}
              <span className="font-mono text-zinc-600">
                /{currentParentSlug}
              </span>
            </>
          ) : (
            "หมวดหมู่ระดับหลัก (Root Level)"
          )}
        </div>
      </div>

      <input
        type="hidden"
        name="parentSlug"
        value={currentParentSlug ?? ""}
      />

      <div className="space-y-1.5">
        <label className="text-[12px] font-medium text-zinc-700" htmlFor="cat-name">
          ชื่อหมวดหมู่ *
        </label>
        <input
          id="cat-name"
          name="name"
          type="text"
          required
          placeholder="เช่น Performance, Design Systems..."
          className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-[13px] text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none shadow-2xs"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-[12px] font-medium text-zinc-700" htmlFor="cat-desc">
          คำอธิบาย
        </label>
        <input
          id="cat-desc"
          name="description"
          type="text"
          placeholder="รายละเอียดของหมวดหมู่..."
          className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-[13px] text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none shadow-2xs"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-zinc-900 px-3.5 py-2 text-[12px] font-medium text-white hover:bg-zinc-800 disabled:opacity-50 shadow-2xs transition cursor-pointer"
      >
        <Plus className="w-3.5 h-3.5" />
        {isPending ? "กำลังบันทึก..." : "เพิ่มหมวดหมู่"}
      </button>
    </form>
  );
}

export function DeleteCategoryButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          await deleteCategoryAction(id);
          toast.success("ลบหมวดหมู่เรียบร้อยแล้ว");
        })
      }
      className="rounded-md p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
      title="ลบหมวดหมู่"
    >
      <Trash2 className="w-3.5 h-3.5" />
    </button>
  );
}
