import { requireRole } from "@/server/auth/require";
import mongoose from "mongoose";
import { listUsers } from "@/server/modules/users/userRepo";
import { listVillages } from "@/server/modules/villages/villageRepo";
import { UserModel } from "@/server/models/User";
import { VillageModel } from "@/server/models/Village";
import { UserRole } from "@/server/models/types";

import { SuperAdminVillagesClient } from "./ui";

export default async function SuperAdminVillagesPage() {
  await requireRole(UserRole.SUPER_ADMIN);

  const [villages, users] = await Promise.all([listVillages({ parentId: null }), listUsers()]);

  // Fetch user details for each village
  const villagesWithUsers = await Promise.all(
    villages.map(async (village) => {
      if (mongoose.connection.readyState !== 1) {
        await mongoose.connect(process.env.MONGODB_URI!);
      }

      // Populate user details for this village
      const villageWithUsers = await VillageModel.findById(village._id).populate('userIds');
      const userDocs = (villageWithUsers?.userIds as any[]) || [];

      return {
        _id: String(village._id),
        name: village.name,
        district: village.district,
        taluka: village.taluka,
        code: village.code,
        status: village.status,
        users: userDocs.map((userDoc: any) => ({
          _id: String(userDoc._id),
          name: userDoc.name,
          email: userDoc.email,
          role: userDoc.role,
          status: userDoc.status,
        }))
      };
    })
  );

  return (
    <SuperAdminVillagesClient
      villages={villagesWithUsers}
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
