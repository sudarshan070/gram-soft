
import { connectDb } from "@/server/db/mongoose";
import type { GlobalSlabTaxKey } from "@/server/models";
import { GlobalSlabTaxRateModel } from "@/server/models";

export async function listGlobalSlabTaxRates(taxKey: GlobalSlabTaxKey) {
  await connectDb();
  return GlobalSlabTaxRateModel.find({ taxKey })
    .sort({ effectiveFrom: -1, slabFromSqFt: 1, slabToSqFt: 1, createdAt: -1 })
    .lean();
}

export async function createGlobalSlabTaxRate(params: {
  taxKey: GlobalSlabTaxKey;
  slabFromSqFt: number;
  slabToSqFt?: number | null;
  rate: number;
  effectiveFrom: Date;
}) {
  await connectDb();
  const doc = await GlobalSlabTaxRateModel.create(params);
  return doc.toObject();
}

export async function updateGlobalSlabTaxRate(
  id: string,
  params: Partial<{
    slabFromSqFt: number;
    slabToSqFt?: number | null;
    rate: number;
    effectiveFrom: Date;
  }>,
) {
  await connectDb();
  const doc = await GlobalSlabTaxRateModel.findByIdAndUpdate(id, params, {
    new: true,
    runValidators: true,
  });
  return doc?.toObject() ?? null;
}

export async function deleteGlobalSlabTaxRate(id: string) {
  await connectDb();
  const doc = await GlobalSlabTaxRateModel.findByIdAndDelete(id);
  return doc?.toObject() ?? null;
}
