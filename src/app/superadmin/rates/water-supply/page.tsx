import { requireRole } from "@/server/auth/require";
import type { GlobalWaterSupplyTaxRateDocument } from "@/server/models";
import { listGlobalWaterSupplyTaxRates } from "@/server/modules/taxRates/globalWaterSupplyTaxRateRepo";

import { SuperAdminGlobalWaterSupplyTaxRatesClient } from "./ui";

export default async function SuperAdminGlobalWaterSupplyTaxRatesPage() {
  await requireRole("SUPER_ADMIN");
  const rates = await listGlobalWaterSupplyTaxRates();

  return (
    <SuperAdminGlobalWaterSupplyTaxRatesClient
      rates={rates.map((r: GlobalWaterSupplyTaxRateDocument) => ({
        _id: String(r._id),
        waterTaxTypeMr: r.waterTaxTypeMr,
        rate: r.rate,
        effectiveFrom: r.effectiveFrom.toISOString(),
      }))}
    />
  );
}
