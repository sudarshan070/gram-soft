import type { NextRequest } from "next/server";

import { jsonError, jsonOk, badRequest, notFound } from "@/lib/errors";
import { updateUserSchema } from "@/lib/validators/users";
import { hashPassword } from "@/server/auth/password";
import { requireRole } from "@/server/auth/require";
import { deleteUser, findUserById, updateUser } from "@/server/modules/users/userRepo";

export async function GET(_: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    await requireRole("SUPER_ADMIN");
    const { id } = await ctx.params;
    const user = await findUserById(id);
    if (!user) throw notFound("User not found");
    return jsonOk({ user });
  } catch (err) {
    return jsonError(err);
  }
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    await requireRole("SUPER_ADMIN");
    const { id } = await ctx.params;

    const body = await req.json();
    const parsed = updateUserSchema.safeParse(body);
    if (!parsed.success) throw badRequest("Invalid request", parsed.error.flatten());

    const passwordHash = parsed.data.password ? await hashPassword(parsed.data.password) : undefined;

    const user = await updateUser(id, {
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash,
      role: parsed.data.role,
      status: parsed.data.status,
      villageIds: parsed.data.villageIds,
    });

    if (!user) throw notFound("User not found");

    return jsonOk({ user });
  } catch (err) {
    return jsonError(err);
  }
}

export async function DELETE(_: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    await requireRole("SUPER_ADMIN");
    const { id } = await ctx.params;
    await deleteUser(id);
    return jsonOk({ ok: true });
  } catch (err) {
    return jsonError(err);
  }
}
