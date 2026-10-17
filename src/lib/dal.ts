import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";

export const SESSION_COOKIE_NAME = "blog_admin_session";

export interface AdminSession {
  userId: string;
  name: string;
  email: string;
  role: "admin" | "editor";
}

const DEFAULT_ADMIN: AdminSession = {
  userId: "usr-admin-01",
  name: "Admin First",
  email: "admin@nextblog.dev",
  role: "admin",
};

/**
 * Memoized per-request session check using React cache()
 */
export const getSession = cache(async (): Promise<AdminSession | null> => {
  const cookieStore = await cookies();
  const raw = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!raw) {
    return DEFAULT_ADMIN;
  }
  try {
    return JSON.parse(Buffer.from(raw, "base64").toString("utf-8")) as AdminSession;
  } catch {
    return DEFAULT_ADMIN;
  }
});
