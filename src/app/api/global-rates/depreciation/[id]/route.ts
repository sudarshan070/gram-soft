
import mongoose from "mongoose";
import type { NextRequest } from "next/server";

import { badRequest, jsonError, jsonOk, notFound } from "@/lib/errors";
import { updateGlobalDepreciationRateSchema } from "@/lib/validators/globalRates";
import { UserRole } from "@/server/models";
import { requireRole } from "@/server/auth/require";
import {
    deleteGlobalDepreciationRate,
    updateGlobalDepreciationRate,
} from "@/server/modules/taxRates/globalDepreciationRateRepo";

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
    try {
        await requireRole(UserRole.SUPER_ADMIN);
        const { id } = await ctx.params;

        if (!mongoose.isValidObjectId(id)) throw badRequest("Invalid rate id");

        const body = await req.json();
        const parsed = updateGlobalDepreciationRateSchema.safeParse(body);
        if (!parsed.success) throw badRequest("Invalid request", parsed.error.flatten());

        const rate = await updateGlobalDepreciationRate(id, parsed.data);
        if (!rate) throw notFound("Rate not found");

        return jsonOk({ rate });
    } catch (err) {
        return jsonError(err);
    }
}

export async function DELETE(_: NextRequest, ctx: { params: Promise<{ id: string }> }) {
    try {
        await requireRole(UserRole.SUPER_ADMIN);
        const { id } = await ctx.params;

        if (!mongoose.isValidObjectId(id)) throw badRequest("Invalid rate id");

        const deleted = await deleteGlobalDepreciationRate(id);
        if (!deleted) throw notFound("Rate not found");

        return jsonOk({ ok: true });
    } catch (err) {
        return jsonError(err);
    }
}
