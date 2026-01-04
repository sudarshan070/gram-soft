import { requireRole } from "@/server/auth/require";
import { UserRole, type GlobalDepreciationRateDocument } from "@/server/models";
import { listGlobalDepreciationRates } from "@/server/modules/taxRates/globalDepreciationRateRepo";
import { SuperAdminDepreciationRatesClient } from "./ui";


export default async function SuperAdminDepreciationRatesPage() {
    await requireRole(UserRole.SUPER_ADMIN);
    const rates = await listGlobalDepreciationRates();

    return (
        <SuperAdminDepreciationRatesClient
            rates={rates.map((r: GlobalDepreciationRateDocument) => ({
                _id: String(r._id),
                ageFromYear: r.ageFromYear,
                ageToYear: r.ageToYear ?? null,
                depreciationRate: r.depreciationRate,
                effectiveFrom: r.effectiveFrom.toISOString(),
            }))}
        />
    );
}
