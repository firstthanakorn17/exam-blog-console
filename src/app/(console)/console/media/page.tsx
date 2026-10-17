import Image from "next/image";
import type { Metadata } from "next";
import { getMediaItems } from "@/lib/cache";
import { MediaUploader } from "@/components/console/media-uploader";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "คลังไฟล์สื่อ",
};

export default async function MediaLibraryPage() {
  const media = await getMediaItems();

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <p className="text-[11px] font-medium uppercase tracking-widest text-zinc-400">
          Asset Library
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
          คลังไฟล์สื่อ ({media.length})
        </h1>
        <p className="text-[13px] text-zinc-500">
          จัดการรูปภาพและไฟล์ประกอบสำหรับใช้งานในบทความ
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {media.map((item) => (
            <div
              key={item.id}
              className="rounded-xl border border-zinc-200/90 bg-white p-3.5 shadow-2xs flex flex-col justify-between space-y-3 hover:border-zinc-300 transition"
            >
              <div className="h-28 rounded-lg bg-zinc-50 border border-zinc-100 flex items-center justify-center p-4">
                <Image
                  src={item.url}
                  alt={item.alt}
                  width={64}
                  height={64}
                  className="max-h-14 w-auto object-contain"
                />
              </div>

              <div className="space-y-0.5">
                <div className="text-[12px] font-medium text-zinc-900 truncate">
                  {item.filename}
                </div>
                <div className="text-[11px] text-zinc-400 truncate">
                  {item.alt}
                </div>
                <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 pt-1.5 border-t border-zinc-100 mt-1.5">
                  <span>{Math.max(1, Math.round(item.sizeBytes / 1024))} KB</span>
                  <span>{formatDate(item.uploadedAt)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-4">
          <MediaUploader />
        </div>
      </div>
    </div>
  );
}
