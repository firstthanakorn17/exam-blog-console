"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import {
  LayoutDashboard,
  FileText,
  FolderTree,
  Image as ImageIcon,
  Settings,
  RefreshCw,
  Download,
  LogOut,
  Command,
  Plus,
  Search,
  Globe,
  Radar,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { revalidateAllCacheAction } from "@/actions/post.actions";
import { logoutAction } from "@/actions/auth.actions";

const NAV_ITEMS = [
  {
    href: "/console",
    label: "ภาพรวมระบบ",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    href: "/console/scraper",
    label: "ดึงข่าวสอบ FB (Scraper)",
    icon: Radar,
  },
  {
    href: "/console/posts",
    label: "บทความทั้งหมด",
    icon: FileText,
  },
  {
    href: "/console/categories",
    label: "หมวดหมู่",
    icon: FolderTree,
  },
  {
    href: "/console/media",
    label: "คลังไฟล์สื่อ",
    icon: ImageIcon,
  },
  {
    href: "/console/settings",
    label: "ตั้งค่าเว็บไซต์ & SEO",
    icon: Settings,
  },
];

export function ConsoleSidebar() {
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const handlePurgeCache = () => {
    startTransition(async () => {
      await revalidateAllCacheAction();
      toast.success("ซิงค์ข้อมูลและล้าง Cache เรียบร้อยแล้ว");
    });
  };

  const openCommandPalette = () => {
    window.dispatchEvent(new Event("open-command-palette"));
  };

  return (
    <aside className="w-60 shrink-0 border-r border-zinc-200/80 bg-[#fbfbfc] flex flex-col justify-between min-h-screen select-none">
      <div className="p-4 space-y-5">
        {/* Brand Header */}
        <div className="flex items-center justify-between px-2 pt-1">
          <Link href="/console" className="flex items-center gap-2.5 group">
            <div className="w-7 h-7 rounded-lg bg-zinc-900 text-white flex items-center justify-center shadow-xs group-hover:bg-zinc-800 transition">
              <Command className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="font-semibold text-[13px] leading-none text-zinc-900 tracking-tight">
                NextBlog
              </div>
              <div className="text-[11px] text-zinc-400 mt-0.5 font-mono">
                CMS v16.4
              </div>
            </div>
          </Link>

          <Link
            href="/console/posts/new"
            title="เขียนบทความใหม่"
            className="w-7 h-7 rounded-md border border-zinc-200 bg-white text-zinc-600 hover:text-zinc-900 hover:border-zinc-300 flex items-center justify-center shadow-2xs transition"
          >
            <Plus className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Cmd+K Search Trigger */}
        <button
          type="button"
          onClick={openCommandPalette}
          className="w-full flex items-center justify-between rounded-lg border border-zinc-200/90 bg-white px-2.5 py-1.5 text-[12px] text-zinc-500 hover:border-zinc-300 hover:text-zinc-900 shadow-2xs transition cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-zinc-400" />
            <span>ค้นหาด่วน...</span>
          </span>
          <kbd className="rounded border border-zinc-200 bg-zinc-50 px-1.5 py-0.5 font-mono text-[10px] text-zinc-400">
            ⌘K
          </kbd>
        </button>

        {/* Primary Navigation */}
        <div className="space-y-1">
          <div className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
            Workspace
          </div>
          <nav className="space-y-0.5">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-all",
                    isActive
                      ? "bg-white text-zinc-900 shadow-2xs ring-1 ring-zinc-200/90"
                      : "text-zinc-600 hover:bg-zinc-200/50 hover:text-zinc-900"
                  )}
                >
                  <Icon
                    className={cn(
                      "w-4 h-4 shrink-0 transition-colors",
                      isActive ? "text-zinc-900" : "text-zinc-400"
                    )}
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* SEO & System Tools */}
        <div className="space-y-1.5 pt-2 border-t border-zinc-200/70">
          <div className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
            SEO & System
          </div>

          <button
            type="button"
            onClick={handlePurgeCache}
            disabled={isPending}
            className="w-full flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[12px] font-medium text-zinc-600 hover:bg-zinc-200/50 hover:text-zinc-900 disabled:opacity-50 transition cursor-pointer text-left"
          >
            <RefreshCw
              className={cn(
                "w-3.5 h-3.5 text-zinc-400 shrink-0",
                isPending && "animate-spin text-zinc-900"
              )}
            />
            <span>{isPending ? "กำลังล้างแคช..." : "ล้างแคชระบบ (Revalidate)"}</span>
          </button>

          <div className="grid grid-cols-2 gap-1.5 px-1 pt-1">
            <a
              href="/sitemap.xml"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-1 rounded-md border border-zinc-200 bg-white px-2 py-1.5 text-[11px] font-medium text-zinc-600 hover:text-zinc-900 hover:border-zinc-300 shadow-2xs transition"
            >
              <Globe className="w-3 h-3 text-zinc-400" />
              Sitemap
            </a>
            <a
              href="/robots.txt"
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-1 rounded-md border border-zinc-200 bg-white px-2 py-1.5 text-[11px] font-medium text-zinc-600 hover:text-zinc-900 hover:border-zinc-300 shadow-2xs transition"
            >
              <Globe className="w-3 h-3 text-zinc-400" />
              Robots
            </a>
          </div>

          <div className="grid grid-cols-2 gap-1.5 px-1">
            <a
              href="/api/export?format=json"
              className="flex items-center justify-center gap-1.5 rounded-md border border-zinc-200 bg-white px-2 py-1.5 text-[11px] font-medium text-zinc-600 hover:text-zinc-900 hover:border-zinc-300 shadow-2xs transition"
            >
              <Download className="w-3 h-3 text-zinc-400" />
              JSON
            </a>
            <a
              href="/api/export?format=csv"
              className="flex items-center justify-center gap-1.5 rounded-md border border-zinc-200 bg-white px-2 py-1.5 text-[11px] font-medium text-zinc-600 hover:text-zinc-900 hover:border-zinc-300 shadow-2xs transition"
            >
              <Download className="w-3 h-3 text-zinc-400" />
              CSV
            </a>
          </div>
        </div>
      </div>

      {/* Footer User / Logout */}
      <div className="p-3 border-t border-zinc-200/80 bg-zinc-100/40">
        <form action={logoutAction}>
          <button
            type="submit"
            className="w-full flex items-center justify-between rounded-lg px-2.5 py-2 text-[12px] font-medium text-zinc-600 hover:bg-white hover:text-red-600 hover:shadow-2xs hover:ring-1 hover:ring-zinc-200/80 transition cursor-pointer"
          >
            <span>ออกจากระบบ</span>
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </aside>
  );
}
