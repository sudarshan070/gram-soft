import mongoose from "mongoose";

import { connectDb } from "@/server/db/mongoose";
import { UserModel, UserVillageAccessModel, VillageModel } from "@/server/models";

export async function listUserIdsForVillage(villageId: string) {
  await connectDb();
  const village = await VillageModel.findById(villageId).lean();
  return (village?.userIds || []).map((id) => String(id));
}

export async function setUsersForVillage(villageId: string, userIds: string[]) {
  await connectDb();

  const villageObjectId = new mongoose.Types.ObjectId(villageId);

  // 1. Identify users currently in this village
  const currentUsersInVillage = await UserModel.find({ villageId: villageObjectId }).lean();
  const currentUserIdsInVillage = currentUsersInVillage.map((u) => String(u._id));

  // 2. Identify users to be removed (in current but not in new list)
  const userIdsToRemove = currentUserIdsInVillage.filter((id) => !userIds.includes(id));

  // 3. Identify users to be added (in new list but not in current)
  // Note: Some might already be in 'current' if we just re-sent the same list, so we filter.
  // We strictly care about setting the new relation.
  const userIdsToAdd = userIds.filter((id) => !currentUserIdsInVillage.includes(id));

  // 4. Handle Removals
  if (userIdsToRemove.length > 0) {
    await UserModel.updateMany(
      { _id: { $in: userIdsToRemove } },
      { $set: { villageId: null } }
    );
  }

  // 5. Handle Additions
  for (const userId of userIdsToAdd) {
    const user = await UserModel.findById(userId);
    if (!user) continue;

    // If user belongs to another village, remove them from that village's userIds
    if (user.villageId && String(user.villageId) !== villageId) {
      await VillageModel.findByIdAndUpdate(user.villageId, {
        $pull: { userIds: user._id },
      });
    }

    // Set new villageId
    await UserModel.findByIdAndUpdate(userId, {
      $set: { villageId: villageObjectId },
    });
  }

  // 6. Update the Village document itself
  // We can just overwrite the userIds array with the new list
  await VillageModel.findByIdAndUpdate(villageId, {
    $set: { userIds: userIds.map((id) => new mongoose.Types.ObjectId(id)) },
  });

  // 7. Maintain legacy UserVillageAccessModel for backward compatibility (Optional but requested implicitly by "mongo collection will change")
  // Actually, keeping it in sync is good practice until fully deprecated.
  await UserVillageAccessModel.deleteMany({ villageId: villageObjectId });
  if (userIds.length) {
    const docs = userIds.map((userId) => ({
      userId: new mongoose.Types.ObjectId(userId),
      villageId: villageObjectId,
    }));
    await UserVillageAccessModel.insertMany(docs, { ordered: false });
  }
}
