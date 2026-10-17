"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import {
  updateSettingsAction,
  type SettingsActionState,
} from "@/actions/category.actions";
import type { SiteSettings } from "@/lib/db";
import { Save, Globe } from "lucide-react";

const initialState: SettingsActionState = {};

export function SettingsForm({ settings }: { settings: SiteSettings }) {
  const [state, formAction, isPending] = useActionState(
    updateSettingsAction,
    initialState
  );

  useEffect(() => {
    if (state.success && state.message) {
      toast.success(state.message);
    }
  }, [state]);

  return (
    <form
      action={formAction}
      className="rounded-xl border border-zinc-200/90 bg-white p-6 shadow-2xs space-y-5 max-w-2xl"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label
            className="text-[12px] font-medium text-zinc-700"
            htmlFor="siteName"
          >
            ชื่อเว็บไซต์ (Site Name)
          </label>
          <input
            id="siteName"
            name="siteName"
            type="text"
            defaultValue={settings.siteName}
            required
            className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-[13px] text-zinc-900 focus:border-zinc-900 focus:outline-none shadow-2xs"
          />
        </div>

        <div className="space-y-1.5">
          <label
            className="text-[12px] font-medium text-zinc-700"
            htmlFor="postsPerPage"
          >
            จำนวนบทความต่อหน้า
          </label>
          <input
            id="postsPerPage"
            name="postsPerPage"
            type="number"
            min={1}
            max={50}
            defaultValue={settings.postsPerPage}
            className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-[13px] text-zinc-900 focus:border-zinc-900 focus:outline-none shadow-2xs"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label
            className="text-[12px] font-medium text-zinc-700"
            htmlFor="siteUrl"
          >
            Canonical Base URL (ใช้สร้าง Sitemap & Robots.txt)
          </label>
          <input
            id="siteUrl"
            name="siteUrl"
            type="url"
            defaultValue={settings.siteUrl ?? "https://nextblog.example.com"}
            className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-[13px] font-mono text-zinc-800 focus:border-zinc-900 focus:outline-none shadow-2xs"
          />
        </div>

        <div className="space-y-1.5">
          <label
            className="text-[12px] font-medium text-zinc-700"
            htmlFor="twitterHandle"
          >
            X / Twitter Handle (สำหรับ Twitter Card)
          </label>
          <input
            id="twitterHandle"
            name="twitterHandle"
            type="text"
            defaultValue={settings.twitterHandle ?? "@nextblog"}
            className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-[13px] font-mono text-zinc-800 focus:border-zinc-900 focus:outline-none shadow-2xs"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label
          className="text-[12px] font-medium text-zinc-700"
          htmlFor="tagline"
        >
          คำโปรยเว็บไซต์ (Tagline)
        </label>
        <input
          id="tagline"
          name="tagline"
          type="text"
          defaultValue={settings.tagline}
          className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-[13px] text-zinc-900 focus:border-zinc-900 focus:outline-none shadow-2xs"
        />
      </div>

      <div className="space-y-1.5">
        <label
          className="text-[12px] font-medium text-zinc-700"
          htmlFor="defaultSeoDescription"
        >
          คำอธิบาย SEO เริ่มต้น (Default Meta Description)
        </label>
        <textarea
          id="defaultSeoDescription"
          name="defaultSeoDescription"
          rows={3}
          defaultValue={settings.defaultSeoDescription}
          className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-[13px] text-zinc-900 focus:border-zinc-900 focus:outline-none shadow-2xs"
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-6 pt-2">
        <label className="inline-flex items-center gap-2 text-[12px] font-medium text-zinc-700 cursor-pointer">
          <input
            type="checkbox"
            name="allowComments"
            defaultChecked={settings.allowComments}
            className="rounded border-zinc-300 text-zinc-900"
          />
          <span>เปิดระบบแสดงความคิดเห็น</span>
        </label>

        <label className="inline-flex items-center gap-2 text-[12px] font-medium text-zinc-700 cursor-pointer">
          <input
            type="checkbox"
            name="maintenanceMode"
            defaultChecked={settings.maintenanceMode}
            className="rounded border-zinc-300 text-zinc-900"
          />
          <span>
            โหมดปรับปรุงระบบ (บล็อก Search Engine ใน robots.txt อัตโนมัติ)
          </span>
        </label>
      </div>

      <div className="pt-4 border-t border-zinc-100 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-[12px] text-zinc-500">
          <Globe className="w-3.5 h-3.5 text-zinc-400" />
          <a
            href="/sitemap.xml"
            target="_blank"
            rel="noreferrer"
            className="hover:text-zinc-900 underline"
          >
            ดูไฟล์ /sitemap.xml
          </a>
          <span>·</span>
          <a
            href="/robots.txt"
            target="_blank"
            rel="noreferrer"
            className="hover:text-zinc-900 underline"
          >
            ดูไฟล์ /robots.txt
          </a>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-4 py-2 text-[12px] font-medium text-white hover:bg-zinc-800 disabled:opacity-50 shadow-2xs transition cursor-pointer"
        >
          <Save className="w-3.5 h-3.5" />
          {isPending ? "กำลังบันทึก..." : "บันทึกการตั้งค่า"}
        </button>
      </div>
    </form>
  );
}
