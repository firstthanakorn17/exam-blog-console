import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { after } from "next/server";
import { GO_API_BASE, readDb, writeDb, appendAuditLog } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const alt = ((formData.get("alt") as string | null) || "").trim();

    if (!file || file.size === 0) {
      return NextResponse.json(
        { error: "กรุณาเลือกไฟล์ที่ต้องการอัปโหลด" },
        { status: 400 }
      );
    }

    const newItem = {
      id: `med-${Date.now()}`,
      filename: file.name,
      url: "/file.svg",
      sizeBytes: file.size,
      mimeType: file.type || "application/octet-stream",
      alt: alt || file.name,
      uploadedAt: new Date().toISOString(),
    };

    try {
      await fetch(`${GO_API_BASE}/media`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newItem),
      });
    } catch {
      const db = await readDb();
      db.media.unshift(newItem);
      await writeDb(db);
    }

    revalidateTag("media", "max");
    revalidateTag("stats", "max");

    after(async () => {
      await appendAuditLog({
        action: "MEDIA_UPLOAD",
        target: `${file.name} (${Math.round(file.size / 1024)} KB)`,
        actor: "Admin First",
        meta: "POST /api/upload -> PostgreSQL + Redis",
      });
      revalidateTag("audit-logs", "max");
    });

    return NextResponse.json({ item: newItem }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Upload failed" },
      { status: 500 }
    );
  }
}
