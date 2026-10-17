import type { Metadata } from "next";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Console — NextBlog CMS",
    template: "%s — NextBlog CMS",
  },
  description:
    "ระบบจัดการบทความด้วยสถาปัตยกรรม Next.js 16 App Router",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#f8f9fa] text-zinc-900 selection:bg-zinc-900 selection:text-white font-sans">
        {children}
        <Toaster richColors position="bottom-right" theme="light" />
      </body>
    </html>
  );
}
