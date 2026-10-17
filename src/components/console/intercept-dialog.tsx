"use client";

import { usePathname, useRouter } from "next/navigation";
import { X } from "lucide-react";

export function InterceptDialog({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  // Only stay visible while URL matches the edit route
  if (!pathname.endsWith("/edit")) {
    return null;
  }

  const handleClose = () => {
    router.back();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-zinc-950/45 backdrop-blur-[2px] flex items-center justify-center p-4 overflow-y-auto"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-2xl rounded-2xl border border-zinc-200 bg-white shadow-2xl overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-zinc-100 flex items-start justify-between gap-4 bg-zinc-50/60">
          <div className="space-y-0.5 min-w-0">
            <h2 className="text-[15px] font-semibold text-zinc-900 truncate">
              {title}
            </h2>
            {subtitle && (
              <p className="text-[12px] text-zinc-500">{subtitle}</p>
            )}
          </div>

          <button
            type="button"
            onClick={handleClose}
            aria-label="ปิดหน้าต่าง"
            className="rounded-lg border border-zinc-200 bg-white p-1.5 text-zinc-400 hover:text-zinc-900 shadow-2xs transition cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 max-h-[80vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
