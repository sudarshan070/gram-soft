import mongoose from "mongoose";
import type { NextRequest } from "next/server";

import { badRequest, jsonError, jsonOk, notFound } from "@/lib/errors";
import { updateGlobalWaterSupplyTaxRateSchema } from "@/lib/validators/globalRates";
import { requireRole } from "@/server/auth/require";
import {
  deleteGlobalWaterSupplyTaxRate,
  updateGlobalWaterSupplyTaxRate,
} from "@/server/modules/taxRates/globalWaterSupplyTaxRateRepo";

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    await requireRole("SUPER_ADMIN");
    const { id } = await ctx.params;

    if (!mongoose.isValidObjectId(id)) throw badRequest("Invalid rate id");

    const body = await req.json();
    const parsed = updateGlobalWaterSupplyTaxRateSchema.safeParse(body);
    if (!parsed.success) throw badRequest("Invalid request", parsed.error.flatten());

    const rate = await updateGlobalWaterSupplyTaxRate(id, parsed.data);
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

    const deleted = await deleteGlobalWaterSupplyTaxRate(id);
    if (!deleted) throw notFound("Rate not found");

    return jsonOk({ ok: true });
  } catch (err) {
    return jsonError(err);
  }
}
