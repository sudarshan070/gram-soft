import { connectDb } from "@/server/db/mongoose";
import { GlobalConstructionLandRateModel } from "@/server/models";

export async function listGlobalConstructionLandRates() {
  await connectDb();
  return GlobalConstructionLandRateModel.find({})
    .sort({ effectiveFrom: -1, createdAt: -1 })
    .lean();
}

export async function createGlobalConstructionLandRate(params: {
  propertyTypeMr: string;
  constructionRate: number;
  constructionLandRate: number;
  landRate: number;
  approvedRate: number;
  effectiveFrom: Date;
}) {
  await connectDb();
  const doc = await GlobalConstructionLandRateModel.create(params);
  return doc.toObject();
}

export async function updateGlobalConstructionLandRate(
  id: string,
  params: Partial<{
    propertyTypeMr: string;
    constructionRate: number;
    constructionLandRate: number;
    landRate: number;
    approvedRate: number;
    effectiveFrom: Date;
  }>,
) {
  await connectDb();
  const doc = await GlobalConstructionLandRateModel.findByIdAndUpdate(id, params, {
    new: true,
    runValidators: true,
  });
  return doc?.toObject() ?? null;
}

export async function deleteGlobalConstructionLandRate(id: string) {
  await connectDb();
  const doc = await GlobalConstructionLandRateModel.findByIdAndDelete(id);
  return doc?.toObject() ?? null;
}
