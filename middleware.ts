import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

import { AUTH_COOKIE_NAME } from "@/server/auth/constants";

const protectedMatchers = ["/superadmin", "/village"]; // prefix match

async function verifyToken(token: string) {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET ?? "");
  const { payload } = await jwtVerify(token, secret);
  return {
    userId: String(payload.sub),
    role: payload.role as string,
    villageIds: (payload.villageIds as string[] | undefined) ?? [],
  };
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isProtected = protectedMatchers.some((p) => pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();

  const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  try {
    const auth = await verifyToken(token);

    if (pathname.startsWith("/superadmin")) {
      if (auth.role !== "SUPER_ADMIN") {
        const url = req.nextUrl.clone();
        url.pathname = "/login";
        return NextResponse.redirect(url);
      }
    }

    if (pathname.startsWith("/village/")) {
      const parts = pathname.split("/").filter(Boolean);
      const villageId = parts[1];
      if (auth.role !== "SUPER_ADMIN" && !auth.villageIds.includes(villageId)) {
        const url = req.nextUrl.clone();
        url.pathname = "/login";
        return NextResponse.redirect(url);
      }
    }

    return NextResponse.next();
  } catch {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }
}

export const config = {
  matcher: ["/superadmin/:path*", "/village/:path*"],
};
