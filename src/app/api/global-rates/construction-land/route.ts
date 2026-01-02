import type { NextRequest } from "next/server";

import { badRequest, jsonError, jsonOk } from "@/lib/errors";
import { createGlobalConstructionLandRateSchema } from "@/lib/validators/globalRates";
import { requireRole } from "@/server/auth/require";
import {
  createGlobalConstructionLandRate,
  listGlobalConstructionLandRates,
} from "@/server/modules/taxRates/globalConstructionLandRateRepo";

export async function GET() {
  try {
    await requireRole("SUPER_ADMIN");
    const rates = await listGlobalConstructionLandRates();
    return jsonOk({ rates });
  } catch (err) {
    return jsonError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireRole("SUPER_ADMIN");

    const body = await req.json();
    const parsed = createGlobalConstructionLandRateSchema.safeParse(body);
    if (!parsed.success) throw badRequest("Invalid request", parsed.error.flatten());

    const rate = await createGlobalConstructionLandRate(parsed.data);
    return jsonOk({ rate });
  } catch (err) {
    return jsonError(err);
  }
}
