import type { NextRequest } from "next/server";

import { badRequest, jsonError, jsonOk } from "@/lib/errors";
import { createGlobalWaterSupplyTaxRateSchema } from "@/lib/validators/globalRates";
import { requireRole } from "@/server/auth/require";
import {
  createGlobalWaterSupplyTaxRate,
  listGlobalWaterSupplyTaxRates,
} from "@/server/modules/taxRates/globalWaterSupplyTaxRateRepo";

export async function GET() {
  try {
    await requireRole("SUPER_ADMIN");
    const rates = await listGlobalWaterSupplyTaxRates();
    return jsonOk({ rates });
  } catch (err) {
    return jsonError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireRole("SUPER_ADMIN");

    const body = await req.json();
    const parsed = createGlobalWaterSupplyTaxRateSchema.safeParse(body);
    if (!parsed.success) throw badRequest("Invalid request", parsed.error.flatten());

    const rate = await createGlobalWaterSupplyTaxRate(parsed.data);
    return jsonOk({ rate });
  } catch (err) {
    return jsonError(err);
  }
}
