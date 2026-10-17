import { NextResponse } from "next/server";
import { readDb } from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format") || "json";
  const db = await readDb();

  if (format === "csv") {
    const header = "id,title,slug,categorySlug,status,views,updatedAt\n";
    const rows = db.posts
      .map(
        (p) =>
          `"${p.id}","${p.title.replace(/"/g, '""')}","${p.slug}","${p.categorySlug}","${p.status}",${p.views},"${p.updatedAt}"`
      )
      .join("\n");

    return new NextResponse(header + rows, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="posts-export.csv"',
      },
    });
  }

  return NextResponse.json(
    {
      exportedAt: new Date().toISOString(),
      counts: {
        posts: db.posts.length,
        categories: db.categories.length,
        media: db.media.length,
      },
      data: db,
    },
    {
      headers: {
        "Content-Disposition": 'attachment; filename="blog-backup.json"',
      },
    }
  );
}
