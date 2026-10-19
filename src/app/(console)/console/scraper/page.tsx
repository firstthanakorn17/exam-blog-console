import { Suspense } from "react";
import { GO_API_BASE } from "@/lib/db";
import {
  ScraperRadarClient,
  type ScrapeSource,
  type ScrapedItem,
} from "@/components/console/scraper-radar-client";

async function ScraperRadarData() {
  let sources: ScrapeSource[] = [];
  let items: ScrapedItem[] = [];

  try {
    const [srcRes, itemRes] = await Promise.all([
      fetch(`${GO_API_BASE}/scraper/sources`, { cache: "no-store" }),
      fetch(`${GO_API_BASE}/scraper/items`, { cache: "no-store" }),
    ]);
    if (srcRes.ok) {
      const sData = await srcRes.json();
      sources = sData.sources || [];
    }
    if (itemRes.ok) {
      const iData = await itemRes.json();
      items = iData.items || [];
    }
  } catch {
    // fallback if API restarting
  }

  return <ScraperRadarClient initialSources={sources} initialItems={items} />;
}

export default function ConsoleScraperPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-4">
          <div className="h-32 rounded-2xl border border-zinc-200 bg-white animate-pulse" />
          <div className="h-96 rounded-2xl border border-zinc-200 bg-white animate-pulse" />
        </div>
      }
    >
      <ScraperRadarData />
    </Suspense>
  );
}
