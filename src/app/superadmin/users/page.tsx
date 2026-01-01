import { requireRole } from "@/server/auth/require";
import { listUsers } from "@/server/modules/users/userRepo";
import { SuperAdminUsersClient } from "./ui";


export default async function SuperAdminUsersPage() {
  await requireRole("SUPER_ADMIN");
  const users = await listUsers();

  return (
    <SuperAdminUsersClient
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
