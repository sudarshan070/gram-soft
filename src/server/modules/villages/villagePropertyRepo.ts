
import { connectDb } from "@/server/db/mongoose";
import { VillagePropertyModel } from "@/server/models/VillageProperty";
import type { VillagePropertyDocument } from "@/server/models/VillageProperty";

export async function listVillageProperties(villageId: string) {
    await connectDb();
    return VillagePropertyModel.find({ villageId }).sort({ propertyNo: 1 }).lean();
}

export async function createVillageProperty(params: Partial<VillagePropertyDocument>) {
    await connectDb();
    const doc = await VillagePropertyModel.create(params);
    return doc.toObject();
}

export async function findVillagePropertyById(id: string) {
    await connectDb();
    return VillagePropertyModel.findById(id).lean();
}

export async function updateVillageProperty(id: string, params: Partial<VillagePropertyDocument>) {
    await connectDb();
    const doc = await VillagePropertyModel.findByIdAndUpdate(id, params, { new: true });
    return doc?.toObject() ?? null;
}

export async function deleteVillageProperty(id: string) {
    await connectDb();
    return VillagePropertyModel.findByIdAndDelete(id);
}
