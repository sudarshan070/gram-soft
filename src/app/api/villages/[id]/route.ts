import { jsonError, jsonOk, badRequest, notFound } from "@/lib/errors";
import { updateVillageSchema } from "@/lib/validators/villages";
import { requireRole } from "@/server/auth/require";
import { deleteVillage, findVillageById, updateVillage } from "@/server/modules/villages/villageRepo";

export async function GET(_: Request, ctx: { params: { id: string } }) {
  try {
    await requireRole(["SUPER_ADMIN", "ADMIN"]);
    const { id } = ctx.params;
    const village = await findVillageById(id);
    if (!village) throw notFound("Village not found");
    return jsonOk({ village });
  } catch (err) {
    return jsonError(err);
  }
}

export async function PATCH(req: Request, ctx: { params: { id: string } }) {
  try {
    await requireRole("SUPER_ADMIN");
    const { id } = ctx.params;

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

export async function DELETE(_: Request, ctx: { params: { id: string } }) {
  try {
    await requireRole("SUPER_ADMIN");
    const { id } = ctx.params;
    await deleteVillage(id);
    return jsonOk({ ok: true });
  } catch (err) {
    return jsonError(err);
  }
}
