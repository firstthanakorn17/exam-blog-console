"use client";

import { useActionState } from "react";
import { loginAction, type AuthActionState } from "@/actions/auth.actions";
import { Command, ArrowRight } from "lucide-react";

const initialState: AuthActionState = {};

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(
    loginAction,
    initialState
  );

  return (
    <div className="rounded-2xl border border-zinc-200/90 bg-white p-7 shadow-sm space-y-6">
      <div className="space-y-2 text-center">
        <div className="w-9 h-9 rounded-xl bg-zinc-900 text-white flex items-center justify-center mx-auto shadow-xs">
          <Command className="w-4 h-4" />
        </div>
        <h1 className="text-lg font-semibold tracking-tight text-zinc-900 pt-1">
          เข้าสู่ระบบ NextBlog CMS
        </h1>
        <p className="text-[12px] text-zinc-500">
          จัดการเนื้อหา หมวดหมู่ และการตั้งค่าระบบบล็อก
        </p>
      </div>

      <form action={formAction} className="space-y-4">
        {state.error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
            {state.error}
          </div>
        )}

        <div className="space-y-1.5">
          <label
            className="text-[12px] font-medium text-zinc-700"
            htmlFor="name"
          >
            ชื่อผู้ใช้งาน
          </label>
          <input
            id="name"
            name="name"
            type="text"
            defaultValue="Admin First"
            required
            className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-[13px] text-zinc-900 focus:border-zinc-900 focus:outline-none shadow-2xs"
          />
        </div>

        <div className="space-y-1.5">
          <label
            className="text-[12px] font-medium text-zinc-700"
            htmlFor="email"
          >
            อีเมล
          </label>
          <input
            id="email"
            name="email"
            type="email"
            defaultValue="admin@nextblog.dev"
            required
            className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-[13px] text-zinc-900 focus:border-zinc-900 focus:outline-none shadow-2xs"
          />
        </div>

        <div className="space-y-1.5">
          <label
            className="text-[12px] font-medium text-zinc-700"
            htmlFor="role"
          >
            ระดับสิทธิ์
          </label>
          <select
            id="role"
            name="role"
            defaultValue="admin"
            className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-[13px] text-zinc-900 focus:border-zinc-900 focus:outline-none shadow-2xs"
          >
            <option value="admin">ผู้ดูแลระบบสูงสุด (Admin)</option>
            <option value="editor">บรรณาธิการเนื้อหา (Editor)</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-zinc-900 px-4 py-2.5 text-[13px] font-medium text-white hover:bg-zinc-800 disabled:opacity-50 shadow-2xs transition cursor-pointer"
        >
          <span>{isPending ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}
