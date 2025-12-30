import { requireRole } from "@/server/auth/require";
import { SuperAdminCreateUserClient } from "./ui";


export default async function SuperAdminCreateUserPage() {
  await requireRole("SUPER_ADMIN");
  return <SuperAdminCreateUserClient />;
}
