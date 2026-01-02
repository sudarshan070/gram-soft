import { requireRole } from "@/server/auth/require";
import type { GlobalSlabTaxRateDocument } from "@/server/models";
import { listGlobalSlabTaxRates } from "@/server/modules/taxRates/globalSlabTaxRateRepo";
import { SuperAdminHealthTaxSlabsClient } from "./ui";


export default async function SuperAdminHealthTaxSlabsPage() {
  await requireRole("SUPER_ADMIN");
  const rates = await listGlobalSlabTaxRates("HEALTH");

  return (
    <SuperAdminHealthTaxSlabsClient
      rates={rates.map((r: GlobalSlabTaxRateDocument) => ({
        _id: String(r._id),
        slabFromSqFt: r.slabFromSqFt,
        slabToSqFt: r.slabToSqFt ?? null,
        rate: r.rate,
        effectiveFrom: r.effectiveFrom.toISOString(),
      }))}
    />
  );
}
