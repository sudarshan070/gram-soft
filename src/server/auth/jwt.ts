import { SignJWT, jwtVerify } from "jose";

import { env } from "@/lib/env";
import type { UserRole } from "@/server/models";

export type AuthTokenPayload = {
  sub: string;
  role: UserRole;
  villageIds: string[];
  name: string;
  email: string;
};

function getSecretKey() {
  return new TextEncoder().encode(env.JWT_SECRET);
}

export async function signAuthToken(payload: AuthTokenPayload, expiresInSeconds: number) {
  const now = Math.floor(Date.now() / 1000);

  return new SignJWT({
    role: payload.role,
    villageIds: payload.villageIds,
    name: payload.name,
    email: payload.email,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt(now)
    .setExpirationTime(now + expiresInSeconds)
    .sign(getSecretKey());
}

export async function verifyAuthToken(token: string) {
  const res = await jwtVerify(token, getSecretKey());
  const { payload } = res;

  return {
    userId: String(payload.sub),
    role: payload.role as UserRole,
    villageIds: (payload.villageIds as string[] | undefined) ?? [],
    name: (payload.name as string | undefined) ?? "",
    email: (payload.email as string | undefined) ?? "",
  };
}
