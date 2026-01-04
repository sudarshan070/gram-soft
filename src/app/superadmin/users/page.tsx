import { requireRole } from "@/server/auth/require";
import { listUsers } from "@/server/modules/users/userRepo";
import { SuperAdminUsersClient } from "./ui";
import mongoose from "mongoose";
import { VillageModel } from "@/server/models/Village";
import { UserRole } from "@/server/models/types";


export default async function SuperAdminUsersPage() {
  await requireRole(UserRole.SUPER_ADMIN);
  const users = await listUsers();

  // Fetch village data for users with villageId
  const usersWithVillages = await Promise.all(
    users.map(async (user) => {
      let village = null;
      if (user.villageId) {
        village = await VillageModel.findById(user.villageId);
      }
      
      return {
        _id: String(user._id),
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        villageId: user.villageId ? String(user.villageId) : null,
        village: village ? {
          _id: String(village._id),
          name: village.name,
          taluka: village.taluka,
          district: village.district,
          code: village.code,
          status: village.status,
        } : null,
      };
    })
  );

  return (
    <SuperAdminUsersClient users={usersWithVillages} />
  );
}
