import { Suspense } from "react";
import { ConsoleSidebar } from "@/components/console/sidebar";
import { CommandPalette } from "@/components/console/command-palette";
import { getSession } from "@/lib/dal";
import { getSiteSettings, getPosts } from "@/lib/cache";

async function SessionHeaderBadge() {
  const session = await getSession();
  const initials = (session?.name ?? "AF")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex items-center gap-2.5">
      <div className="text-right hidden sm:block">
        <div className="text-[12px] font-medium text-zinc-900 leading-none">
          {session?.name ?? "Admin First"}
        </div>
        <div className="text-[11px] text-zinc-400 mt-0.5">
          {session?.email ?? "admin@nextblog.dev"}
        </div>
      </div>
      <div className="w-7 h-7 rounded-full bg-zinc-900 text-white text-[11px] font-semibold flex items-center justify-center">
        {initials}
      </div>
    </div>
  );
}

export default async function ConsoleGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [settings, posts] = await Promise.all([getSiteSettings(), getPosts()]);

  const paletteItems = posts.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    status: p.status,
  }));

  return (
    <div className="min-h-screen flex bg-[#f8f9fa] text-zinc-900">
      <CommandPalette posts={paletteItems} />

      <Suspense
        fallback={
          <div className="w-60 shrink-0 border-r border-zinc-200/80 bg-[#fbfbfc] p-4" />
        }
      >
        <ConsoleSidebar />
      </Suspense>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-zinc-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-20 px-8 flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-[13px]">
            <span className="font-semibold text-zinc-900">
              {settings.siteName}
            </span>
            <span className="text-zinc-300">/</span>
            <span className="text-zinc-500 text-xs">{settings.tagline}</span>
          </div>

          <Suspense
            fallback={
              <div className="h-7 w-32 rounded-full bg-zinc-100 animate-pulse" />
            }
          >
            <SessionHeaderBadge />
          </Suspense>
        </header>

        <main className="flex-1 px-8 py-8 max-w-6xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
