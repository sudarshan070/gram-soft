import { badRequest, jsonError, jsonOk } from "@/lib/errors";
import { setVillageUsersSchema } from "@/lib/validators/villageUsers";
import { requireRole } from "@/server/auth/require";
import { listUserIdsForVillage, setUsersForVillage } from "@/server/modules/villages/villageUserAccessRepo";

export async function GET(_: Request, ctx: { params: { id: string } }) {
  try {
    await requireRole("SUPER_ADMIN");
    const { id } = ctx.params;

    const userIds = await listUserIdsForVillage(id);
    return jsonOk({ userIds });
  } catch (err) {
    return jsonError(err);
  }
}

export async function PUT(req: Request, ctx: { params: { id: string } }) {
  try {
    await requireRole("SUPER_ADMIN");
    const { id } = ctx.params;

    const body = await req.json();
    const parsed = setVillageUsersSchema.safeParse(body);
    if (!parsed.success) throw badRequest("Invalid request", parsed.error.flatten());

    await setUsersForVillage(id, parsed.data.userIds);
    return jsonOk({ ok: true });
  } catch (err) {
    return jsonError(err);
  }
}
