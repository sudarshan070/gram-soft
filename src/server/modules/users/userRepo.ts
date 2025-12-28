import mongoose from "mongoose";

import { connectDb } from "@/server/db/mongoose";
import { UserModel, UserVillageAccessModel } from "@/server/models";

export async function findUserByEmail(email: string) {
  await connectDb();
  return UserModel.findOne({ email }).lean();
}

export async function findUserById(id: string) {
  await connectDb();
  return UserModel.findById(id).lean();
}

export async function listUsers() {
  await connectDb();
  return UserModel.find({}).sort({ createdAt: -1 }).lean();
}

export async function createUser(params: {
  name: string;
  email: string;
  passwordHash: string;
  role: "SUPER_ADMIN" | "ADMIN" | "USER";
  status: "ACTIVE" | "INACTIVE";
  villageIds?: string[];
}) {
  await connectDb();

  const user = await UserModel.create({
    name: params.name,
    email: params.email,
    passwordHash: params.passwordHash,
    role: params.role,
    status: params.status,
  });

  if (params.villageIds?.length) {
    const docs = params.villageIds.map((v) => ({
      userId: user._id,
      villageId: new mongoose.Types.ObjectId(v),
    }));
    await UserVillageAccessModel.insertMany(docs, { ordered: false });
  }

  return user.toObject();
}

export async function updateUser(
  id: string,
  params: {
    name?: string;
    passwordHash?: string;
    role?: "SUPER_ADMIN" | "ADMIN" | "USER";
    status?: "ACTIVE" | "INACTIVE";
    villageIds?: string[];
  },
) {
  await connectDb();

  const update: Record<string, unknown> = {};
  if (params.name !== undefined) update.name = params.name;
  if (params.passwordHash !== undefined) update.passwordHash = params.passwordHash;
  if (params.role !== undefined) update.role = params.role;
  if (params.status !== undefined) update.status = params.status;

  const user = await UserModel.findByIdAndUpdate(id, update, { new: true });

  if (params.villageIds) {
    await UserVillageAccessModel.deleteMany({ userId: id });
    if (params.villageIds.length) {
      const docs = params.villageIds.map((v) => ({ userId: id, villageId: v }));
      await UserVillageAccessModel.insertMany(docs, { ordered: false });
    }
  }

  return user?.toObject() ?? null;
}

export async function deleteUser(id: string) {
  await connectDb();
  await UserVillageAccessModel.deleteMany({ userId: id });
  await UserModel.findByIdAndDelete(id);
}

export async function getVillageIdsForUser(userId: string) {
  await connectDb();
  const rows = await UserVillageAccessModel.find({ userId }).lean();
  return rows.map((r) => String(r.villageId));
}
