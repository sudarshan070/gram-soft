import { connectDb } from "@/server/db/mongoose";
import { GlobalUsageFactorModel } from "@/server/models";

export async function listGlobalUsageFactors() {
    await connectDb();
    return GlobalUsageFactorModel.find({})
        .sort({ effectiveFrom: -1, usageTypeMr: 1 })
        .lean();
}

export async function createGlobalUsageFactor(params: {
    usageTypeMr: string;
    weightage: number;
    effectiveFrom: Date;
}) {
    await connectDb();
    const doc = await GlobalUsageFactorModel.create(params);
    return doc.toObject();
}

export async function updateGlobalUsageFactor(
    id: string,
    params: Partial<{
        usageTypeMr: string;
        weightage: number;
        effectiveFrom: Date;
    }>,
) {
    await connectDb();
    const doc = await GlobalUsageFactorModel.findByIdAndUpdate(id, params, {
        new: true,
        runValidators: true,
    });
    return doc?.toObject() ?? null;
}

export async function deleteGlobalUsageFactor(id: string) {
    await connectDb();
    const doc = await GlobalUsageFactorModel.findByIdAndDelete(id);
    return doc?.toObject() ?? null;
}
