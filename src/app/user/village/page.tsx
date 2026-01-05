import { requireAuth } from "@/server/auth/require";
import { findVillageById, listVillages } from "@/server/modules/villages/villageRepo";
import { listVillageProperties } from "@/server/modules/villages/villagePropertyRepo";

import { UserVillageClient } from "./ui";

export default async function UserVillagePage() {
  const auth = await requireAuth();

  const hasVillage = auth.villageIds && auth.villageIds.length > 0;
  const villageId = hasVillage ? auth.villageIds[0] : undefined;
  
  let village;
  let properties: any[] = [];
  let subVillages: any[] = [];

  if (villageId) {
    const rawVillage = await findVillageById(villageId);
    if (rawVillage) {
      // Serialize to plain object
      village = JSON.parse(JSON.stringify(rawVillage));
    }
    
    // Fetch properties and sub-villages concurrently
    const [rawProperties, rawSubVillages] = await Promise.all([
      listVillageProperties(villageId),
      listVillages({ parentId: villageId })
    ]);

    if (rawProperties && rawProperties.length > 0) {
      properties = JSON.parse(JSON.stringify(rawProperties));
    }

    if (rawSubVillages && rawSubVillages.length > 0) {
      subVillages = JSON.parse(JSON.stringify(rawSubVillages));
    }
  }

  return (
    <UserVillageClient 
      name={auth.name} 
      email={auth.email}
      hasVillage={hasVillage}
      village={village}
      villageId={villageId}
      properties={properties}
      subVillages={subVillages}
    />
  );
}
