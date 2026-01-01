import type { NextRequest } from "next/server";

import { jsonError, jsonOk, notFound } from "@/lib/errors";
import { requireVillageAccess } from "@/server/auth/require";
import { getVillageStats } from "@/server/modules/dashboard/statsRepo";

export async function GET(_: NextRequest, ctx: { params: Promise<{ villageId: string }> }) {
  try {
    const { villageId } = await ctx.params;
    await requireVillageAccess(villageId);

    const stats = await getVillageStats(villageId);
    if (!stats) throw notFound("Village not found");

    return jsonOk({ stats });
  } catch (err) {
    return jsonError(err);
  }
}
