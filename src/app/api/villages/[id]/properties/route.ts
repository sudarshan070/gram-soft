
import { NextRequest } from "next/server";
import { jsonError, jsonOk, badRequest } from "@/lib/errors";
import { createVillagePropertySchema } from "@/lib/validators/villageProperties";
import { requireRole } from "@/server/auth/require";
import { UserRole } from "@/server/models/types";
import { createVillageProperty, listVillageProperties } from "@/server/modules/villages/villagePropertyRepo";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        await requireRole([UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.USER]);
        const { id } = await params; // villageId
        const properties = await listVillageProperties(id);
        return jsonOk({ properties });
    } catch (err) {
        return jsonError(err);
    }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        await requireRole([UserRole.SUPER_ADMIN, UserRole.ADMIN]);
        const { id } = await params;
        const body = await req.json();

        const parsed = createVillagePropertySchema.safeParse({ ...body, villageId: id });
        if (!parsed.success) {
            throw badRequest("Invalid property data", parsed.error.flatten());
        }

        const prop = await createVillageProperty(parsed.data as any);
        return jsonOk({ property: prop });
    } catch (err) {
        return jsonError(err);
    }
}
