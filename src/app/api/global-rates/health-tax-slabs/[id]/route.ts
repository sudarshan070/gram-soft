import mongoose from "mongoose";
import type { NextRequest } from "next/server";

import { badRequest, jsonError, jsonOk, notFound } from "@/lib/errors";
import { updateGlobalSlabTaxRateSchema } from "@/lib/validators/globalRates";
import { requireRole } from "@/server/auth/require";
import {
  deleteGlobalSlabTaxRate,
  updateGlobalSlabTaxRate,
} from "@/server/modules/taxRates/globalSlabTaxRateRepo";

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    await requireRole("SUPER_ADMIN");
    const { id } = await ctx.params;

    if (!mongoose.isValidObjectId(id)) throw badRequest("Invalid rate id");

    const body = await req.json();
    const parsed = updateGlobalSlabTaxRateSchema.safeParse(body);
    if (!parsed.success) throw badRequest("Invalid request", parsed.error.flatten());

    const rate = await updateGlobalSlabTaxRate(id, parsed.data);
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

    const deleted = await deleteGlobalSlabTaxRate(id);
    if (!deleted) throw notFound("Rate not found");

    return jsonOk({ ok: true });
  } catch (err) {
    return jsonError(err);
  }
}
