import { jsonError, jsonOk } from "@/lib/errors";
import { requireRole } from "@/server/auth/require";
import { getSuperAdminStats } from "@/server/modules/dashboard/statsRepo";

export async function GET() {
  try {
    await requireRole("SUPER_ADMIN");
    const stats = await getSuperAdminStats();
    return jsonOk({ stats });
  } catch (err) {
    return jsonError(err);
  }
}
