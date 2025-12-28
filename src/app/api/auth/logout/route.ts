import { cookies } from "next/headers";

import { jsonError, jsonOk } from "@/lib/errors";
import { AUTH_COOKIE_NAME } from "@/server/auth/constants";

export async function POST() {
  try {
    const cookieStore = await cookies();
    cookieStore.set(AUTH_COOKIE_NAME, "", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 0,
    });

    return jsonOk({ ok: true });
  } catch (err) {
    return jsonError(err);
  }
}
