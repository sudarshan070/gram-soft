import { cookies } from "next/headers";

import { forbidden, unauthorized } from "@/lib/errors";
import type { UserRole } from "@/server/models";

import { AUTH_COOKIE_NAME } from "./constants";
import { verifyAuthToken } from "./jwt";

export type AuthContext = {
  userId: string;
  role: UserRole;
  villageIds: string[];
  name: string;
  email: string;
};

export async function requireAuth(): Promise<AuthContext> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  if (!token) {
    console.error("Auth failed: No token found in cookies");
    throw unauthorized();
  }

  try {
    return await verifyAuthToken(token);
  } catch (err) {
    console.error("Auth verification failed:", err);
    throw unauthorized();
  }
}

export async function requireRole(roles: UserRole | UserRole[]) {
  const auth = await requireAuth();
  const allowed = Array.isArray(roles) ? roles : [roles];
  if (!allowed.includes(auth.role)) throw forbidden();
  return auth;
}

export async function requireVillageAccess(villageId: string) {
  const auth = await requireAuth();
  if (auth.role === "SUPER_ADMIN") return auth;
  if (!auth.villageIds.includes(villageId)) throw forbidden("No village access");
  return auth;
}
