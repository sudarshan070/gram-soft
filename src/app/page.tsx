import { redirect } from "next/navigation";
import { requireAuth } from "@/server/auth/require";

export default async function Home() {
  const auth = await requireAuth();
  
  // If user is SUPER_ADMIN, redirect to superadmin dashboard
  if (auth.role === "SUPER_ADMIN") {
    redirect("/superadmin/dashboard");
  }

  // Otherwise, redirect to user dashboard
  redirect("/user/dashboard");
}
