import mongoose from "mongoose";
import type { NextRequest } from "next/server";

import { jsonError, jsonOk, badRequest, notFound } from "@/lib/errors";
import { updateVillageSchema } from "@/lib/validators/villages";
import { requireRole } from "@/server/auth/require";
import { deleteVillage, findVillageById, updateVillage } from "@/server/modules/villages/villageRepo";
import { UserRole } from "@/server/models";

export async function GET(_: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    await requireRole([UserRole.SUPER_ADMIN, UserRole.ADMIN]);
    const { id } = await ctx.params;
    const village = await findVillageById(id);
    if (!village) throw notFound("Village not found");
    return jsonOk({ village });
  } catch (err) {
    return jsonError(err);
  }
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    await requireRole(UserRole.SUPER_ADMIN);
    const { id } = await ctx.params;

    const body = await req.json();
    const parsed = updateVillageSchema.safeParse(body);
    if (!parsed.success) throw badRequest("Invalid request", parsed.error.flatten());

    const village = await updateVillage(id, parsed.data);
    if (!village) throw notFound("Village not found");

    return jsonOk({ village });
  } catch (err) {
    return jsonError(err);
  }
}

export async function DELETE(_: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    await requireRole(UserRole.SUPER_ADMIN);
    const { id } = await ctx.params;

    if (!mongoose.isValidObjectId(id)) throw badRequest("Invalid village id");

    const deleted = await deleteVillage(id);
    if (!deleted) throw notFound("Village not found");
    return jsonOk({ ok: true });
  } catch (err) {
    return jsonError(err);
  }
}
