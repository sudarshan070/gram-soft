import { requireRole } from "@/server/auth/require";
import { listGlobalConstructionLandRates } from "@/server/modules/taxRates/globalConstructionLandRateRepo";
import type { GlobalConstructionLandRateDocument } from "@/server/models";

import { SuperAdminGlobalConstructionLandRatesClient } from "./ui";

export default async function SuperAdminGlobalConstructionLandRatesPage() {
  await requireRole("SUPER_ADMIN");
  const rates = await listGlobalConstructionLandRates();

  return (
    <SuperAdminGlobalConstructionLandRatesClient
      rates={rates.map((r: GlobalConstructionLandRateDocument) => ({
        _id: String(r._id),
        propertyTypeMr: r.propertyTypeMr,
        constructionRate: r.constructionRate,
        constructionLandRate: r.constructionLandRate,
        landRate: r.landRate,
        approvedRate: r.approvedRate,
        effectiveFrom: r.effectiveFrom.toISOString(),
      }))}
    />
  );
}
