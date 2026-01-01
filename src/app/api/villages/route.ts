import { jsonError, jsonOk, badRequest } from "@/lib/errors";
import { createVillageSchema } from "@/lib/validators/villages";
import { requireRole } from "@/server/auth/require";
import { createVillage, listVillages } from "@/server/modules/villages/villageRepo";

function generateVillageCode() {
  return `V${Date.now().toString(36).toUpperCase()}`;
}

export async function GET() {
  try {
    await requireRole(["SUPER_ADMIN", "ADMIN"]);
    const villages = await listVillages();
    return jsonOk({ villages });
  } catch (err) {
    return jsonError(err);
  }
}

export async function POST(req: Request) {
  try {
    await requireRole("SUPER_ADMIN");

    const body = await req.json();
    const parsed = createVillageSchema.safeParse(body);
    if (!parsed.success) throw badRequest("Invalid request", parsed.error.flatten());

    const village = await createVillage({
      name: parsed.data.name,
      district: parsed.data.district,
      taluka: parsed.data.taluka,
      code: parsed.data.code ?? generateVillageCode(),
      status: parsed.data.status ?? "ACTIVE",
    });

    return jsonOk({ village });
  } catch (err) {
    return jsonError(err);
  }
}
