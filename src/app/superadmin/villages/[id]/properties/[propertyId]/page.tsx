
import { notFound } from "next/navigation";
import { requireRole } from "@/server/auth/require";
import { UserRole } from "@/server/models/types";
import { findVillageById } from "@/server/modules/villages/villageRepo";
import { findVillagePropertyById } from "@/server/modules/villages/villagePropertyRepo";
import { listGlobalConstructionLandRates } from "@/server/modules/taxRates/globalConstructionLandRateRepo";
import { listGlobalDepreciationRates } from "@/server/modules/taxRates/globalDepreciationRateRepo";
import { listGlobalUsageFactors } from "@/server/modules/taxRates/globalUsageFactorRepo";
import { listGlobalWaterSupplyTaxRates } from "@/server/modules/taxRates/globalWaterSupplyTaxRateRepo";
import { PropertyTaxDetailClient } from "./ui";

export default async function PropertyDetailPage({
    params
}: {
    params: Promise<{ id: string; propertyId: string }>
}) {
    await requireRole([UserRole.SUPER_ADMIN]);
    const { id: villageId, propertyId } = await params;

    const village = await findVillageById(villageId);
    if (!village) notFound();

    const property = await findVillagePropertyById(propertyId);
    if (!property) notFound();

    // Fetch Rates for Calculation
    const [constructionRates, depreciationRates, usageFactors, waterRates] = await Promise.all([
        listGlobalConstructionLandRates(),
        listGlobalDepreciationRates(),
        listGlobalUsageFactors(),
        listGlobalWaterSupplyTaxRates(),
    ]);

    return (
        <PropertyTaxDetailClient
            village={{
                _id: String(village._id),
                name: village.name,
                district: village.district,
            }}
            property={{
                ...property,
                _id: String(property._id),
                villageId: String(property.villageId),
                createdAt: property.createdAt.toISOString(),
                updatedAt: property.updatedAt.toISOString(),
                constructions: property.constructions.map((c: any) => ({
                    ...c,
                    _id: c._id ? String(c._id) : undefined,
                })),
            }}
            rates={{
                construction: constructionRates.map(r => ({ ...r, _id: String(r._id), effectiveFrom: r.effectiveFrom?.toISOString(), createdAt: r.createdAt?.toString() })),
                depreciation: depreciationRates.map(r => ({ ...r, _id: String(r._id), effectiveFrom: r.effectiveFrom?.toISOString(), createdAt: r.createdAt?.toString() })),
                usage: usageFactors.map(r => ({ ...r, _id: String(r._id), effectiveFrom: r.effectiveFrom?.toISOString(), createdAt: r.createdAt?.toString() })),
                water: waterRates.map(r => ({ ...r, _id: String(r._id), effectiveFrom: r.effectiveFrom?.toISOString(), createdAt: r.createdAt?.toString() })),
            }}
        />
    );
}
