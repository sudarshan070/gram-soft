import { requireVillageAccess } from "@/server/auth/require";
import { findVillageById } from "@/server/modules/villages/villageRepo";
import { notFound } from "next/navigation";

import { VillageDashboardClient } from "./ui";

export default async function VillageDashboardPage(props: { params: { villageId: string } }) {
  const { villageId } = props.params;
  await requireVillageAccess(villageId);

  const village = await findVillageById(villageId);
  if (!village) notFound();

  return <VillageDashboardClient village={{ id: String(village._id), name: village.name }} />;
}
