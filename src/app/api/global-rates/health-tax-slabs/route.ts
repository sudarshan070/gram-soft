import type { NextRequest } from "next/server";

import { badRequest, jsonError, jsonOk } from "@/lib/errors";
import { createGlobalSlabTaxRateSchema } from "@/lib/validators/globalRates";
import { requireRole } from "@/server/auth/require";
import {
  createGlobalSlabTaxRate,
  listGlobalSlabTaxRates,
} from "@/server/modules/taxRates/globalSlabTaxRateRepo";

export async function GET() {
  try {
    await requireRole("SUPER_ADMIN");
    const rates = await listGlobalSlabTaxRates("HEALTH");
    return jsonOk({ rates });
  } catch (err) {
    return jsonError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireRole("SUPER_ADMIN");

    const body = await req.json();
    const parsed = createGlobalSlabTaxRateSchema.safeParse(body);
    if (!parsed.success) throw badRequest("Invalid request", parsed.error.flatten());

    const rate = await createGlobalSlabTaxRate({ ...parsed.data, taxKey: "HEALTH" });
    return jsonOk({ rate });
  } catch (err) {
    return jsonError(err);
  }
}
