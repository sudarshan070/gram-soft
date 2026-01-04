import { requireRole } from "@/server/auth/require";
import { UserRole, type GlobalUsageFactorDocument } from "@/server/models";
import { listGlobalUsageFactors } from "@/server/modules/taxRates/globalUsageFactorRepo";
import { SuperAdminUsageFactorsClient } from "./ui";

export default async function SuperAdminUsageFactorsPage() {
    await requireRole(UserRole.SUPER_ADMIN);
    const rates = await listGlobalUsageFactors();

    return (
        <SuperAdminUsageFactorsClient
            rates={rates.map((r: GlobalUsageFactorDocument) => ({
                _id: String(r._id),
                usageTypeMr: r.usageTypeMr,
                weightage: r.weightage,
                effectiveFrom: r.effectiveFrom.toISOString(),
            }))}
        />
    );
}
