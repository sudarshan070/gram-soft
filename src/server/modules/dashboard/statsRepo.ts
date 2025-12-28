import { connectDb } from "@/server/db/mongoose";
import { UserModel, VillageModel } from "@/server/models";

export async function getSuperAdminStats() {
  await connectDb();

  const [users, admins, villages] = await Promise.all([
    UserModel.countDocuments({ role: "USER" }),
    UserModel.countDocuments({ role: "ADMIN" }),
    VillageModel.countDocuments({}),
  ]);

  return { users, admins, villages };
}

export async function getVillageStats(villageId: string) {
  await connectDb();

  const village = await VillageModel.findById(villageId).lean();
  if (!village) return null;

  return {
    villageId,
    villageName: village.name,
  };
}
