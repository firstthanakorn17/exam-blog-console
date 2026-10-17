"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { UploadCloud } from "lucide-react";

export function MediaUploader() {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    setIsUploading(true);
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || "อัปโหลดไม่สำเร็จ");
      } else {
        toast.success(`อัปโหลดไฟล์ ${json.item.filename} เรียบร้อยแล้ว`);
        form.reset();
        router.refresh();
      }
    } catch {
      toast.error("เกิดข้อผิดพลาดในการอัปโหลด");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-zinc-200/90 bg-white p-5 shadow-2xs space-y-4"
    >
      <div className="space-y-0.5">
        <h2 className="text-[13px] font-semibold text-zinc-900">
          อัปโหลดไฟล์ใหม่
        </h2>
        <p className="text-[11px] text-zinc-400">
          รองรับรูปภาพ SVG, PNG, JPG และเอกสารประกอบบทความ
        </p>
      </div>

      <div className="space-y-1.5">
        <label className="text-[12px] font-medium text-zinc-700" htmlFor="media-file">
          เลือกไฟล์ *
        </label>
        <input
          id="media-file"
          name="file"
          type="file"
          required
          className="w-full rounded-lg border border-zinc-200 bg-zinc-50/50 px-3 py-2 text-[12px] text-zinc-600 file:mr-3 file:rounded-md file:border-0 file:bg-zinc-900 file:px-2.5 file:py-1 file:text-[11px] file:font-medium file:text-white hover:file:bg-zinc-800"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-[12px] font-medium text-zinc-700" htmlFor="media-alt">
          คำอธิบายภาพ (Alt Text)
        </label>
        <input
          id="media-alt"
          name="alt"
          type="text"
          placeholder="คำอธิบายสำหรับ SEO..."
          className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-[13px] text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-900 focus:outline-none shadow-2xs"
        />
      </div>

      <button
        type="submit"
        disabled={isUploading}
        className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg bg-zinc-900 px-4 py-2 text-[12px] font-medium text-white hover:bg-zinc-800 disabled:opacity-50 shadow-2xs transition cursor-pointer"
      >
        <UploadCloud className="w-3.5 h-3.5" />
        {isUploading ? "กำลังอัปโหลด..." : "อัปโหลดเข้าคลังสื่อ"}
      </button>
    </form>
  );
}
