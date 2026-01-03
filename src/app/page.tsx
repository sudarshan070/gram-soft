import { redirect } from "next/navigation";
import { requireAuth } from "@/server/auth/require";

import { UserRole } from "@/server/models/types";

export default async function Home() {
  const auth = await requireAuth();
  
  // If user is SUPER_ADMIN, redirect to superadmin dashboard
  if (auth.role === UserRole.SUPER_ADMIN) {
    redirect("/superadmin/dashboard");
  }

  // Otherwise, redirect to user dashboard
  redirect("/user/dashboard");
}
