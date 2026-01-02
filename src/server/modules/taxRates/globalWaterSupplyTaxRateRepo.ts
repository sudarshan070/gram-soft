import { connectDb } from "@/server/db/mongoose";
import { GlobalWaterSupplyTaxRateModel } from "@/server/models";

export async function listGlobalWaterSupplyTaxRates() {
  await connectDb();
  return GlobalWaterSupplyTaxRateModel.find({})
    .sort({ effectiveFrom: -1, createdAt: -1 })
    .lean();
}

export async function createGlobalWaterSupplyTaxRate(params: {
  waterTaxTypeMr: string;
  rate: number;
  effectiveFrom: Date;
}) {
  await connectDb();
  const doc = await GlobalWaterSupplyTaxRateModel.create(params);
  return doc.toObject();
}

export async function updateGlobalWaterSupplyTaxRate(
  id: string,
  params: Partial<{
    waterTaxTypeMr: string;
    rate: number;
    effectiveFrom: Date;
  }>,
) {
  await connectDb();
  const doc = await GlobalWaterSupplyTaxRateModel.findByIdAndUpdate(id, params, {
    new: true,
    runValidators: true,
  });
  return doc?.toObject() ?? null;
}

export async function deleteGlobalWaterSupplyTaxRate(id: string) {
  await connectDb();
  const doc = await GlobalWaterSupplyTaxRateModel.findByIdAndDelete(id);
  return doc?.toObject() ?? null;
}
