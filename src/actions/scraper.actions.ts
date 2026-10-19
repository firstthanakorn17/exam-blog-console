"use server";

import { updateTag, revalidatePath } from "next/cache";
import { GO_API_BASE } from "@/lib/db";

export async function triggerScraperRunAction(sourceId = "") {
  const res = await fetch(`${GO_API_BASE}/scraper/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sourceId }),
  });
  const data = await res.json();
  revalidatePath("/console/scraper");
  return data;
}

export async function simulateIncomingFBWebhookAction() {
  const now = new Date();
  const samplePost = {
    fbPostId: `fb-live-${now.getTime()}`,
    sourceId: "src-ocsc",
    sourceName: "เพจข่าวสอบราชการ & รัฐวิสาหกิจ (Webhook)",
    pageUrl: "https://www.facebook.com/OCSC.go.th",
    postUrl: `https://www.facebook.com/OCSC.go.th/posts/pfbid${now.getTime()}`,
    postedAt: now.toISOString(),
    text: `📢 ประกาศด่วน! กรมสรรพากร เปิดรับสมัครสอบแข่งขันเพื่อบรรจุและแต่งตั้งบุคคลเข้ารับราชการ ประจำปี 2569
📌 ตำแหน่งที่เปิดรับสมัคร: นักวิชาการสรรพากรปฏิบัติการ, นักวิชาการภาษีปฏิบัติการ และนักวิชาการคอมพิวเตอร์ปฏิบัติการ รวม 450 อัตรา
🎓 วุฒิการศึกษา: ปริญญาตรี (ที่ผ่านภาค ก. ของสำนักงาน ก.พ. แล้ว)
🗓 เปิดรับสมัครทางอินเทอร์เน็ตตั้งแต่วันที่ 25 พฤศจิกายน – 15 ธันวาคม 2569
🔗 เว็บไซต์รับสมัคร: https://rd.thaijobjob.com`,
  };

  const res = await fetch(`${GO_API_BASE}/scraper/webhook`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ posts: [samplePost] }),
  });
  const data = await res.json();
  revalidatePath("/console/scraper");
  return data;
}

export async function approveScrapedItemAction(id: string) {
  const res = await fetch(
    `${GO_API_BASE}/scraper/items/${encodeURIComponent(id)}/approve`,
    { method: "POST" }
  );
  const data = await res.json();
  updateTag("posts");
  updateTag("stats");
  updateTag("audit-logs");
  revalidatePath("/console/scraper");
  revalidatePath("/console/posts");

  // Also notify Reader UI (:3002)
  try {
    await fetch("http://localhost:3002/api/revalidate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-revalidate-secret": "nextblog-shared-secret",
      },
      body: JSON.stringify({ tags: ["posts"] }),
    });
  } catch {
    // ignore
  }

  return data;
}

export async function rejectScrapedItemAction(id: string) {
  const res = await fetch(
    `${GO_API_BASE}/scraper/items/${encodeURIComponent(id)}/reject`,
    { method: "POST" }
  );
  const data = await res.json();
  revalidatePath("/console/scraper");
  return data;
}

export async function addScrapeSourceAction(formData: FormData) {
  const name = ((formData.get("name") as string) || "").trim();
  const pageUrl = ((formData.get("pageUrl") as string) || "").trim();
  const categorySlug =
    ((formData.get("categorySlug") as string) || "").trim() || "engineering";
  const includeKeywords =
    ((formData.get("includeKeywords") as string) || "").trim() ||
    "รับสมัครสอบ,เปิดสอบ,ภาค ก,พนักงานราชการ";
  const excludeKeywords =
    ((formData.get("excludeKeywords") as string) || "").trim() ||
    "คอร์สติว,โปรโมชั่น,ลดราคา,ทักแชท";

  const res = await fetch(`${GO_API_BASE}/scraper/sources`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name,
      pageUrl,
      categorySlug,
      includeKeywords,
      excludeKeywords,
    }),
  });
  const data = await res.json();
  revalidatePath("/console/scraper");
  return data;
}

export async function deleteScrapeSourceAction(id: string) {
  await fetch(`${GO_API_BASE}/scraper/sources/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
  revalidatePath("/console/scraper");
}
