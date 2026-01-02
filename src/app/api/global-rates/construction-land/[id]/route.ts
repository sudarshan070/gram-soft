import mongoose from "mongoose";
import type { NextRequest } from "next/server";

import { badRequest, jsonError, jsonOk, notFound } from "@/lib/errors";
import { updateGlobalConstructionLandRateSchema } from "@/lib/validators/globalRates";
import { requireRole } from "@/server/auth/require";
import {
  deleteGlobalConstructionLandRate,
  updateGlobalConstructionLandRate,
} from "@/server/modules/taxRates/globalConstructionLandRateRepo";

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    await requireRole("SUPER_ADMIN");
    const { id } = await ctx.params;

    if (!mongoose.isValidObjectId(id)) throw badRequest("Invalid rate id");

    const body = await req.json();
    const parsed = updateGlobalConstructionLandRateSchema.safeParse(body);
    if (!parsed.success) throw badRequest("Invalid request", parsed.error.flatten());

    const rate = await updateGlobalConstructionLandRate(id, parsed.data);
    if (!rate) throw notFound("Rate not found");

    return jsonOk({ rate });
  } catch (err) {
    return jsonError(err);
  }
}

export async function DELETE(_: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    await requireRole("SUPER_ADMIN");
    const { id } = await ctx.params;

    if (!mongoose.isValidObjectId(id)) throw badRequest("Invalid rate id");

    const deleted = await deleteGlobalConstructionLandRate(id);
    if (!deleted) throw notFound("Rate not found");

    return jsonOk({ ok: true });
  } catch (err) {
    return jsonError(err);
  }
}
