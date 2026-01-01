import { requireRole } from "@/server/auth/require";
import { listUsers } from "@/server/modules/users/userRepo";
import { listVillages } from "@/server/modules/villages/villageRepo";

import { SuperAdminVillagesClient } from "./ui";

export default async function SuperAdminVillagesPage() {
  await requireRole("SUPER_ADMIN");

  const [villages, users] = await Promise.all([listVillages(), listUsers()]);

  return (
    <SuperAdminVillagesClient
      villages={villages.map((v) => ({
        _id: String(v._id),
        name: v.name,
        district: v.district,
        taluka: v.taluka,
        code: v.code,
        status: v.status,
      }))}
      users={users.map((u) => ({
        _id: String(u._id),
        name: u.name,
        email: u.email,
        role: u.role,
        status: u.status,
      }))}
    />
  );
}
