"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { revalidateAllCacheAction } from "@/actions/post.actions";
import {
  Search,
  FileText,
  Plus,
  LayoutDashboard,
  FolderTree,
  Image as ImageIcon,
  Settings,
  RefreshCw,
  Globe,
  FileCode2,
  ArrowRight,
} from "lucide-react";

export interface CommandPalettePostItem {
  id: string;
  title: string;
  slug: string;
  status: string;
}

export function CommandPalette({
  posts,
}: {
  posts: CommandPalettePostItem[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    };

    const onCustomOpen = () => setOpen(true);

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("open-command-palette", onCustomOpen);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("open-command-palette", onCustomOpen);
    };
  }, []);

  if (!open) return null;

  const q = query.trim().toLowerCase();

  const quickActions = [
    {
      label: "เขียนบทความใหม่ (New Post)",
      icon: Plus,
      action: () => router.push("/console/posts/new"),
    },
    {
      label: "ภาพรวมระบบ (Dashboard)",
      icon: LayoutDashboard,
      action: () => router.push("/console"),
    },
    {
      label: "จัดการบทความทั้งหมด (All Posts)",
      icon: FileText,
      action: () => router.push("/console/posts"),
    },
    {
      label: "จัดการหมวดหมู่ (Categories)",
      icon: FolderTree,
      action: () => router.push("/console/categories"),
    },
    {
      label: "คลังไฟล์สื่อ (Media Library)",
      icon: ImageIcon,
      action: () => router.push("/console/media"),
    },
    {
      label: "ตั้งค่าเว็บไซต์และ SEO (Site Settings)",
      icon: Settings,
      action: () => router.push("/console/settings"),
    },
    {
      label: "ตรวจสอบ XML Sitemap (/sitemap.xml)",
      icon: Globe,
      action: () => window.open("/sitemap.xml", "_blank"),
    },
    {
      label: "ตรวจสอบ Robots.txt (/robots.txt)",
      icon: FileCode2,
      action: () => window.open("/robots.txt", "_blank"),
    },
    {
      label: "ล้างแคชและอัปเดตข้อมูลทั้งหมด (Revalidate Cache Tags)",
      icon: RefreshCw,
      action: () => {
        startTransition(async () => {
          await revalidateAllCacheAction();
          toast.success("ซิงค์ข้อมูลและล้าง Cache เรียบร้อยแล้ว");
        });
      },
    },
  ].filter((item) => !q || item.label.toLowerCase().includes(q));

  const matchedPosts = posts
    .filter(
      (p) =>
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q)
    )
    .slice(0, 6);

  const runAndClose = (fn: () => void) => {
    fn();
    setOpen(false);
    setQuery("");
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-zinc-950/40 backdrop-blur-[2px] flex items-start justify-center pt-20 p-4"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-zinc-200 bg-white shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-100">
          <Search className="w-4 h-4 text-zinc-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="พิมพ์คำสั่ง หรือค้นหาชื่อบทความ... (Esc เพื่อปิด)"
            className="w-full text-[13px] text-zinc-900 placeholder:text-zinc-400 focus:outline-none"
          />
          <kbd className="rounded border border-zinc-200 bg-zinc-50 px-1.5 py-0.5 font-mono text-[10px] text-zinc-400">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-3">
          {matchedPosts.length > 0 && (
            <div className="space-y-1">
              <div className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                บทความ ({matchedPosts.length})
              </div>
              {matchedPosts.map((post) => (
                <a
                  key={post.id}
                  href={`/console/posts/${post.id}/edit`}
                  onClick={() => {
                    setOpen(false);
                    setQuery("");
                  }}
                  className="w-full flex items-center justify-between gap-3 rounded-xl px-3 py-2 text-left text-[13px] text-zinc-700 hover:bg-zinc-100/80 hover:text-zinc-900 transition cursor-pointer"
                >
                  <span className="flex items-center gap-2.5 min-w-0">
                    <FileText className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                    <span className="truncate font-medium">{post.title}</span>
                  </span>
                  <span className="text-[11px] font-mono text-zinc-400 shrink-0 flex items-center gap-1">
                    แก้ไขเต็มหน้า
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </a>
              ))}
            </div>
          )}

          {quickActions.length > 0 && (
            <div className="space-y-1">
              <div className="px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                คำสั่งด่วน & SEO Tools
              </div>
              {quickActions.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    type="button"
                    disabled={isPending}
                    onClick={() => runAndClose(item.action)}
                    className="w-full flex items-center justify-between gap-3 rounded-xl px-3 py-2 text-left text-[13px] text-zinc-700 hover:bg-zinc-100/80 hover:text-zinc-900 transition cursor-pointer"
                  >
                    <span className="flex items-center gap-2.5">
                      <Icon className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                      <span>{item.label}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {matchedPosts.length === 0 && quickActions.length === 0 && (
            <div className="py-8 text-center text-[13px] text-zinc-400">
              ไม่พบคำสั่งหรือบทความที่ตรงกับ &ldquo;{query}&rdquo;
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
