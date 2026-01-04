import { jsonError, jsonOk, badRequest } from "@/lib/errors";
import { createVillageSchema } from "@/lib/validators/villages";
import { requireRole } from "@/server/auth/require";
import { createVillage, listVillages } from "@/server/modules/villages/villageRepo";
import { UserRole } from "@/server/models/types";

function generateVillageCode() {
  return `V${Date.now().toString(36).toUpperCase()}`;
}

export async function GET() {
  try {
    await requireRole([UserRole.SUPER_ADMIN, UserRole.ADMIN]);
    // By default, only list root villages (not sub-villages)
    // If we want to support filtering via query params, we can add that logic here
    const villages = await listVillages({ parentId: null });
    return jsonOk({ villages });
  } catch (err) {
    return jsonError(err);
  }
}

export async function POST(req: Request) {
  try {
    await requireRole(UserRole.SUPER_ADMIN);

    const body = await req.json();
    const parsed = createVillageSchema.safeParse(body);
    if (!parsed.success) throw badRequest("Invalid request", parsed.error.flatten());

    const village = await createVillage({
      name: parsed.data.name,
      district: parsed.data.district,
      taluka: parsed.data.taluka,
      code: parsed.data.code ?? generateVillageCode(),
      parentId: parsed.data.parentId ?? null,
      status: parsed.data.status ?? "ACTIVE",
    });

    return jsonOk({ village });
  } catch (err) {
    return jsonError(err);
  }
}
