import { requireAuth } from "@/server/auth/require";

import { UserDashboardClient } from "./ui";

export default async function UserDashboardPage() {
  const auth = await requireAuth();

  return <UserDashboardClient name={auth.name} />;
}
