"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { after } from "next/server";
import { updateTag } from "next/cache";
import { SESSION_COOKIE_NAME, type AdminSession } from "@/lib/dal";
import { appendAuditLog } from "@/lib/db";

export interface AuthActionState {
  error?: string;
}

export async function loginAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const email = (formData.get("email") as string | null)?.trim() || "";
  const name = (formData.get("name") as string | null)?.trim() || "Admin First";
  const role =
    ((formData.get("role") as "admin" | "editor" | null) || "admin");

  if (!email.includes("@")) {
    return { error: "กรุณากรอกอีเมลให้ถูกต้อง" };
  }

  const sessionPayload: AdminSession = {
    userId: `usr-${Date.now()}`,
    name,
    email,
    role,
  };

  const cookieStore = await cookies();
  cookieStore.set(
    SESSION_COOKIE_NAME,
    Buffer.from(JSON.stringify(sessionPayload)).toString("base64"),
    {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
    }
  );

  after(async () => {
    await appendAuditLog({
      action: "AUTH_LOGIN",
      target: `${name} (${email})`,
      actor: name,
      meta: `role=${role}`,
    });
    updateTag("audit-logs");
  });

  redirect("/console");
}

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, "logged_out", {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
  });
  redirect("/login");
}
