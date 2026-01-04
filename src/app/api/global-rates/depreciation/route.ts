
import type { NextRequest } from "next/server";

import { badRequest, jsonError, jsonOk } from "@/lib/errors";
import { createGlobalDepreciationRateSchema } from "@/lib/validators/globalRates";
import { UserRole } from "@/server/models";
import { requireRole } from "@/server/auth/require";
import {
    createGlobalDepreciationRate,
    listGlobalDepreciationRates,
} from "@/server/modules/taxRates/globalDepreciationRateRepo";

export async function GET() {
    try {
        await requireRole(UserRole.SUPER_ADMIN);
        const rates = await listGlobalDepreciationRates();
        return jsonOk({ rates });
    } catch (err) {
        return jsonError(err);
    }
}

export async function POST(req: NextRequest) {
    try {
        await requireRole(UserRole.SUPER_ADMIN);

        const body = await req.json();
        const parsed = createGlobalDepreciationRateSchema.safeParse(body);
        if (!parsed.success) throw badRequest("Invalid request", parsed.error.flatten());

        const rate = await createGlobalDepreciationRate(parsed.data);
        return jsonOk({ rate });
    } catch (err) {
        return jsonError(err);
    }
}
