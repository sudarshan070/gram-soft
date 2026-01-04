
import type { NextRequest } from "next/server";

import { badRequest, jsonError, jsonOk } from "@/lib/errors";
import { createGlobalUsageFactorSchema } from "@/lib/validators/globalRates";
import { UserRole } from "@/server/models";
import { requireRole } from "@/server/auth/require";
import {
    createGlobalUsageFactor,
    listGlobalUsageFactors,
} from "@/server/modules/taxRates/globalUsageFactorRepo";

export async function GET() {
    try {
        await requireRole(UserRole.SUPER_ADMIN);
        const rates = await listGlobalUsageFactors();
        return jsonOk({ rates });
    } catch (err) {
        return jsonError(err);
    }
}

export async function POST(req: NextRequest) {
    try {
        await requireRole(UserRole.SUPER_ADMIN);

        const body = await req.json();
        const parsed = createGlobalUsageFactorSchema.safeParse(body);
        if (!parsed.success) throw badRequest("Invalid request", parsed.error.flatten());

        const rate = await createGlobalUsageFactor(parsed.data);
        return jsonOk({ rate });
    } catch (err) {
        return jsonError(err);
    }
}
