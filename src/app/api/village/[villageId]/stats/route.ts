import { jsonError, jsonOk, notFound } from "@/lib/errors";
import { requireVillageAccess } from "@/server/auth/require";
import { getVillageStats } from "@/server/modules/dashboard/statsRepo";

export async function GET(_: Request, ctx: { params: { villageId: string } }) {
  try {
    const { villageId } = ctx.params;
    await requireVillageAccess(villageId);

    const stats = await getVillageStats(villageId);
    if (!stats) throw notFound("Village not found");

    return jsonOk({ stats });
  } catch (err) {
    return jsonError(err);
  }
}
