import { Suspense } from "react";
import Link from "next/link";
import { getDashboardStats } from "@/lib/cache";
import { AlertCircle } from "lucide-react";

async function StatsContent({
  searchParams,
}: {
  searchParams: Promise<{ failStats?: string }>;
}) {
  const params = await searchParams;
  if (params.failStats === "1") {
    throw new Error(
      "ไม่สามารถโหลดข้อมูลสถิติได้ในขณะนี้ (ระบบแสดง Error เฉพาะส่วน @stats โดยไม่กระทบตารางอื่น)"
    );
  }

  const stats = await getDashboardStats();

  const cards = [
    {
      label: "บทความทั้งหมด",
      value: stats.totalPosts,
      meta: `${stats.totalCategories} หมวดหมู่`,
    },
    {
      label: "เผยแพร่แล้ว",
      value: stats.publishedPosts,
      meta: "ออนไลน์บนหน้าเว็บ",
      dot: "bg-emerald-500",
    },
    {
      label: "ฉบับร่าง",
      value: stats.draftPosts,
      meta: "รอการตรวจสอบ",
      dot: "bg-amber-500",
    },
    {
      label: "ยอดเข้าชมรวม",
      value: stats.totalViews.toLocaleString(),
      meta: `ไฟลสื่อ ${stats.totalMedia} รายการ`,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 bg-white rounded-xl border border-zinc-200/90 shadow-2xs divide-y sm:divide-y-0 sm:divide-x divide-zinc-200/80 overflow-hidden">
      {cards.map((card) => (
        <div key={card.label} className="p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[12px] font-medium text-zinc-500">
              {card.label}
            </span>
            {card.dot && (
              <span className={`w-2 h-2 rounded-full ${card.dot}`} />
            )}
          </div>
          <div className="text-3xl font-semibold tracking-tight text-zinc-900 font-mono">
            {card.value}
          </div>
          <div className="text-[11px] text-zinc-400">{card.meta}</div>
        </div>
      ))}
    </div>
  );
}

export default function StatsSlotPage({
  searchParams,
}: {
  searchParams: Promise<{ failStats?: string }>;
}) {
  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <span className="text-[12px] font-medium text-zinc-500">
          ตัวชี้วัดหลัก (Key Metrics)
        </span>
        <Link
          href="/console?failStats=1"
          className="inline-flex items-center gap-1 text-[11px] text-zinc-400 hover:text-zinc-700 transition"
        >
          <AlertCircle className="w-3 h-3" />
          <span>ทดสอบ Error Boundary เฉพาะส่วน</span>
        </Link>
      </div>

      <Suspense
        fallback={
          <div className="h-28 rounded-xl border border-zinc-200/80 bg-white animate-pulse" />
        }
      >
        <StatsContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
