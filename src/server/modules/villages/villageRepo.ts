import { connectDb } from "@/server/db/mongoose";
import { VillageModel } from "@/server/models";

export async function listVillages() {
  await connectDb();
  return VillageModel.find({}).sort({ createdAt: -1 }).lean();
}

export async function findVillageById(id: string) {
  await connectDb();
  return VillageModel.findById(id).lean();
}

export async function createVillage(params: {
  name: string;
  district: string;
  taluka: string;
  code: string;
  status: "ACTIVE" | "INACTIVE";
}) {
  await connectDb();
  const village = await VillageModel.create(params);
  return village.toObject();
}

export async function updateVillage(
  id: string,
  params: Partial<{
    name: string;
    district: string;
    taluka: string;
    code: string;
    status: "ACTIVE" | "INACTIVE";
  }>,
) {
  await connectDb();
  const village = await VillageModel.findByIdAndUpdate(id, params, { new: true });
  return village?.toObject() ?? null;
}

export async function deleteVillage(id: string) {
  await connectDb();
  await VillageModel.findByIdAndDelete(id);
}
