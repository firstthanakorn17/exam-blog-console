import { NextResponse } from "next/server";
import { readDb, writeDb } from "@/lib/db";

export async function GET() {
  const db = await readDb();
  return NextResponse.json(db);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const db = await readDb();

    if (body.type === "increment_view" && body.slug) {
      const post = db.posts.find((p) => p.slug === body.slug);
      if (post) {
        post.views = (post.views || 0) + 1;
        await writeDb(db);
      }
      return NextResponse.json({ ok: true, views: post?.views ?? 0 });
    }

    if (body.type === "clap" && body.slug) {
      const post = db.posts.find((p) => p.slug === body.slug) as
        | (typeof db.posts)[number] & { claps?: number }
        | undefined;
      if (post) {
        post.claps = (post.claps || 0) + 1;
        await writeDb(db);
      }
      return NextResponse.json({ ok: true, claps: post?.claps ?? 1 });
    }

    return NextResponse.json({ ok: false }, { status: 400 });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
