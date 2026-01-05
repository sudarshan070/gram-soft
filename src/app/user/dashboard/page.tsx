import { requireAuth } from "@/server/auth/require";
import { findVillageById } from "@/server/modules/villages/villageRepo";
import { listVillageProperties } from "@/server/modules/villages/villagePropertyRepo";

import { UserDashboardClient } from "./ui";

export default async function UserDashboardPage() {
  const auth = await requireAuth();

  console.log("=== USER DASHBOARD DEBUG ===");
  console.log("Auth context:", auth);
  console.log("Village IDs:", auth.villageIds);
  console.log("Village IDs length:", auth.villageIds?.length);

  // Check if user has village assigned
  const hasVillage = auth.villageIds && auth.villageIds.length > 0;
  const villageId = hasVillage ? auth.villageIds[0] : undefined;
  
  let village;
  // Properties are now fetched on the village page, not dashboard
  
  if (villageId) {
    const rawVillage = await findVillageById(villageId);
    if (rawVillage) {
      // Serialize to plain object to avoid "Only plain objects can be passed to Client Components" error
      village = JSON.parse(JSON.stringify(rawVillage));
    }
  }
  
  console.log("Has village:", hasVillage);
  console.log("Village ID:", villageId);

  return <UserDashboardClient 
    name={auth.name} 
    email={auth.email}
    hasVillage={hasVillage}
    village={village}
    villageId={villageId}
  />;
}
