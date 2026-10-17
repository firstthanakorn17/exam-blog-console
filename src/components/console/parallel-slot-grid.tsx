"use client";

import { useSelectedLayoutSegment } from "next/navigation";

export function ParallelDashboardSlotGrid({
  stats,
  recent,
  activity,
}: {
  stats: React.ReactNode;
  recent: React.ReactNode;
  activity: React.ReactNode;
}) {
  const segment = useSelectedLayoutSegment();

  // Render parallel dashboard widgets only on the index '/console' route
  if (segment !== null) {
    return null;
  }

  return (
    <div className="space-y-6 mt-6">
      <div>{stats}</div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">{recent}</div>
        <div className="lg:col-span-5">{activity}</div>
      </div>
    </div>
  );
}
