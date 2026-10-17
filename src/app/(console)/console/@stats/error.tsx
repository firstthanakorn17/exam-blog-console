"use client";

import Link from "next/link";
import { AlertCircle, RotateCcw } from "lucide-react";

export default function StatsSlotError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50/50 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="text-[13px] font-medium text-red-900">
            ส่วนแสดงผลสถิติขัดข้องชั่วคราว
          </p>
          <p className="text-[12px] text-red-700/80">{error.message}</p>
        </div>
      </div>
      <Link
        href="/console"
        onClick={() => reset()}
        className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-[12px] font-medium text-red-700 hover:bg-red-50 shadow-2xs transition self-start sm:self-auto"
      >
        <RotateCcw className="w-3.5 h-3.5" />
        โหลดส่วนนี้ใหม่
      </Link>
    </div>
  );
}
