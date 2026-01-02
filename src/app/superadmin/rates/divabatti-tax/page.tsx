import { requireRole } from "@/server/auth/require";
import type { GlobalSlabTaxRateDocument } from "@/server/models";
import { listGlobalSlabTaxRates } from "@/server/modules/taxRates/globalSlabTaxRateRepo";
import { SuperAdminDivabattiTaxSlabsClient } from "./ui";


export default async function SuperAdminDivabattiTaxSlabsPage() {
  await requireRole("SUPER_ADMIN");
  const rates = await listGlobalSlabTaxRates("DIVABATTI");

  return (
    <SuperAdminDivabattiTaxSlabsClient
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
