import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#f8f9fa] text-zinc-900 flex items-center justify-center p-6">
      <div className="max-w-sm w-full rounded-2xl border border-zinc-200 bg-white p-8 text-center space-y-3 shadow-2xs">
        <div className="text-[11px] font-mono text-zinc-400">404 Error</div>
        <h1 className="text-lg font-semibold text-zinc-900">
          ไม่พบหน้าที่คุณต้องการ
        </h1>
        <p className="text-[13px] text-zinc-500">
          ลิงก์ที่เปิดอาจถูกย้ายหรือไม่มีอยู่ในระบบแล้ว
        </p>
        <div className="pt-2">
          <Link
            href="/console"
            className="inline-flex items-center justify-center rounded-lg bg-zinc-900 px-4 py-2 text-[12px] font-medium text-white hover:bg-zinc-800 transition"
          >
            กลับสู่หน้าหลัก Console
          </Link>
        </div>
      </div>
    </div>
  );
}
