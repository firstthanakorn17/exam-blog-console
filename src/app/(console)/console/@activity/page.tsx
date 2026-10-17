import { getAuditLogs } from "@/lib/cache";
import { formatDate } from "@/lib/utils";

export default async function ActivitySlotPage() {
  const logs = await getAuditLogs();

  return (
    <div className="rounded-xl border border-zinc-200/90 bg-white shadow-2xs flex flex-col h-full overflow-hidden">
      <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between">
        <h2 className="text-[13px] font-semibold text-zinc-900">
          ประวัติการทำงาน (Activity Log)
        </h2>
        <span className="text-[11px] text-zinc-400 font-mono">Real-time</span>
      </div>

      <div className="p-5 space-y-4">
        {logs.slice(0, 5).map((log, idx) => (
          <div key={log.id} className="relative pl-5 pb-1 last:pb-0">
            {idx !== Math.min(logs.length, 5) - 1 && (
              <span className="absolute left-[5px] top-3 bottom-[-16px] w-px bg-zinc-200" />
            )}
            <span className="absolute left-0 top-1.5 w-2.5 h-2.5 rounded-full border-2 border-zinc-400 bg-white" />

            <div className="space-y-0.5">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-[11px] font-medium text-zinc-700">
                  {log.action}
                </span>
                <span className="text-[11px] text-zinc-400">
                  {formatDate(log.timestamp)}
                </span>
              </div>
              <p className="text-[12px] text-zinc-600 line-clamp-1">
                {log.target}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
