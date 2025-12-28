import { requireRole } from "@/server/auth/require";
import { getSuperAdminStats } from "@/server/modules/dashboard/statsRepo";

import { SuperAdminDashboardClient } from "./ui";

export default async function SuperAdminDashboardPage() {
  await requireRole("SUPER_ADMIN");
  const stats = await getSuperAdminStats();

  return <SuperAdminDashboardClient stats={stats} />;
}
