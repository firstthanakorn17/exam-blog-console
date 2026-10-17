import Link from "next/link";

export default function PostNotFound() {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-8 text-center space-y-3 max-w-md mx-auto my-12 shadow-2xs">
      <div className="text-[11px] font-mono text-zinc-400">404 Not Found</div>
      <h2 className="text-lg font-semibold text-zinc-900">
        ไม่พบบทความที่คุณระบุ
      </h2>
      <p className="text-[13px] text-zinc-500">
        รหัสบทความนี้อาจถูกลบไปแล้ว หรือไม่มีอยู่ในระบบ
      </p>
      <div className="pt-2">
        <Link
          href="/console/posts"
          className="inline-flex items-center rounded-lg bg-zinc-900 px-4 py-2 text-[12px] font-medium text-white hover:bg-zinc-800 transition"
        >
          กลับสู่รายการบทความ
        </Link>
      </div>
    </div>
  );
}
