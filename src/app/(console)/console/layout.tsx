import { Suspense } from "react";
import { ParallelDashboardSlotGrid } from "@/components/console/parallel-slot-grid";

export default function ConsoleParallelLayout({
  children,
  stats,
  recent,
  activity,
}: {
  children: React.ReactNode;
  stats: React.ReactNode;
  recent: React.ReactNode;
  activity: React.ReactNode;
}) {
  return (
    <div>
      {children}
      <Suspense fallback={null}>
        <ParallelDashboardSlotGrid
          stats={stats}
          recent={recent}
          activity={activity}
        />
      </Suspense>
    </div>
  );
}
