"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="th">
      <body className="min-h-screen bg-[#f8f9fa] text-zinc-900 flex items-center justify-center p-6 font-sans">
        <div className="max-w-sm w-full rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm space-y-4">
          <div className="text-[11px] font-mono text-red-600">System Error</div>
          <h1 className="text-lg font-semibold text-zinc-900">
            เกิดข้อผิดพลาดในระบบ
          </h1>
          <p className="text-[13px] text-zinc-500">
            {error.message || "ระบบตรวจพบข้อผิดพลาดที่ไม่คาดคิด"}
          </p>
          <button
            onClick={() => reset()}
            className="w-full rounded-lg bg-zinc-900 px-4 py-2 text-[12px] font-medium text-white hover:bg-zinc-800 transition cursor-pointer"
          >
            ลองใหม่อีกครั้ง
          </button>
        </div>
      </body>
    </html>
  );
}
