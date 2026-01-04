
import { notFound } from "next/navigation";
import { requireRole } from "@/server/auth/require";
import { UserRole } from "@/server/models/types";
import { findVillageById, listVillages } from "@/server/modules/villages/villageRepo";
import { VillageDashboardClient } from "./ui";

export default async function VillageDashboardPage({ params }: { params: Promise<{ id: string }> }) {
    await requireRole(UserRole.SUPER_ADMIN);
    const { id } = await params;

    const village = await findVillageById(id);
    if (!village) notFound();

    const subVillages = await listVillages({ parentId: id });

    let parentVillage = null;
    if (village.parentId) {
        parentVillage = await findVillageById(String(village.parentId));
    }

    return (
        <VillageDashboardClient
            village={{
                _id: String(village._id),
                name: village.name,
                district: village.district,
                taluka: village.taluka,
                code: village.code,
                status: village.status,
                parentId: village.parentId ? String(village.parentId) : null,
            }}
            parentVillage={parentVillage ? {
                _id: String(parentVillage._id),
                name: parentVillage.name,
                district: parentVillage.district,
                taluka: parentVillage.taluka,
                code: parentVillage.code,
                status: parentVillage.status,
            } : null}
            subVillages={subVillages.map((v) => ({
                _id: String(v._id),
                name: v.name,
                district: v.district,
                taluka: v.taluka,
                code: v.code,
                status: v.status,
            }))}
        />
    );
}
