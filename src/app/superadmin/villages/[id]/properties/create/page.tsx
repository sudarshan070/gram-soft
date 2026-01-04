
import { notFound } from "next/navigation";
import { requireRole } from "@/server/auth/require";
import { UserRole } from "@/server/models/types";
import { findVillageById } from "@/server/modules/villages/villageRepo";
import { listGlobalConstructionLandRates } from "@/server/modules/taxRates/globalConstructionLandRateRepo";
import { listGlobalUsageFactors } from "@/server/modules/taxRates/globalUsageFactorRepo";
import { listGlobalWaterSupplyTaxRates } from "@/server/modules/taxRates/globalWaterSupplyTaxRateRepo";
import { CreatePropertyClient } from "./ui";

export default async function CreateVillagePropertyPage({ params }: { params: Promise<{ id: string }> }) {
    await requireRole([UserRole.SUPER_ADMIN, UserRole.ADMIN]);
    const { id } = await params;

    const village = await findVillageById(id);
    if (!village) notFound();

    // Fetch all necessary global rates
    const [constructionRates, usageFactors, waterTaxRates] = await Promise.all([
        listGlobalConstructionLandRates(),
        listGlobalUsageFactors(),
        listGlobalWaterSupplyTaxRates(),
    ]);

    return (
        <CreatePropertyClient
            village={{
                _id: String(village._id),
                name: village.name,
            }}
            constructionRates={constructionRates.map((r) => ({
                _id: String(r._id),
                propertyTypeMr: r.propertyTypeMr,
                constructionRate: r.constructionRate,
                landRate: r.landRate,
            }))}
            usageFactors={usageFactors.map((r) => ({
                _id: String(r._id),
                usageTypeMr: r.usageTypeMr,
                weightage: r.weightage,
            }))}
            waterTaxRates={waterTaxRates.map((r) => ({
                _id: String(r._id),
                waterTaxTypeMr: r.waterTaxTypeMr,
                rate: r.rate,
            }))}
        />
    );
}
