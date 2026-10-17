import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/cache";
import { SettingsForm } from "@/components/console/settings-form";

export const metadata: Metadata = {
  title: "ตั้งค่าเว็บไซต์",
};

export default async function ConsoleSettingsPage() {
  const settings = await getSiteSettings();

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <p className="text-[11px] font-medium uppercase tracking-widest text-zinc-400">
          Configuration
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
          ตั้งค่าเว็บไซต์และ SEO
        </h1>
        <p className="text-[13px] text-zinc-500">
          ข้อมูลที่แก้ไขจะซิงค์ไปยังส่วนหัวของระบบและหน้าบทความทันที
        </p>
      </div>

      <SettingsForm settings={settings} />
    </div>
  );
}
