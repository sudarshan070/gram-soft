import { cookies } from "next/headers";

import { badRequest, jsonError, jsonOk, unauthorized } from "@/lib/errors";
import { loginRequestSchema } from "@/lib/validators/auth";
import { AUTH_COOKIE_MAX_AGE_SECONDS, AUTH_COOKIE_NAME } from "@/server/auth/constants";
import { signAuthToken } from "@/server/auth/jwt";
import { verifyPassword } from "@/server/auth/password";
import { findUserByEmail } from "@/server/modules/users/userRepo";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = loginRequestSchema.safeParse(body);
    if (!parsed.success) {
      throw badRequest("Invalid request", parsed.error.flatten());
    }

    const user = await findUserByEmail(parsed.data.email);
    if (!user || user.status !== "ACTIVE") throw unauthorized("Invalid credentials");

    const ok = await verifyPassword(parsed.data.password, user.passwordHash);
    if (!ok) throw unauthorized("Invalid credentials");

    // For SUPER_ADMIN, no villageIds. For others, use villageId if assigned
    const villageIds = user.role === "SUPER_ADMIN" ? [] : (user.villageId ? [String(user.villageId)] : []);

    const token = await signAuthToken(
      {
        sub: String(user._id),
        role: user.role,
        villageIds,
        name: user.name,
        email: user.email,
      },
      AUTH_COOKIE_MAX_AGE_SECONDS,
    );

    const cookieStore = await cookies();
    cookieStore.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: AUTH_COOKIE_MAX_AGE_SECONDS,
    });

    return jsonOk({
      user: {
        id: String(user._id),
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    return jsonError(err);
  }
}
