import mongoose from "mongoose";

import { connectDb } from "@/server/db/mongoose";
import { UserVillageAccessModel } from "@/server/models";

export async function listUserIdsForVillage(villageId: string) {
  await connectDb();
  const rows = await UserVillageAccessModel.find({
    villageId: new mongoose.Types.ObjectId(villageId),
  }).lean();
  return rows.map((r) => String(r.userId));
}

export async function setUsersForVillage(villageId: string, userIds: string[]) {
  await connectDb();

  const villageObjectId = new mongoose.Types.ObjectId(villageId);

  await UserVillageAccessModel.deleteMany({ villageId: villageObjectId });

  if (!userIds.length) return;

  const docs = userIds.map((userId) => ({
    userId: new mongoose.Types.ObjectId(userId),
    villageId: villageObjectId,
  }));

  await UserVillageAccessModel.insertMany(docs, { ordered: false });
}
