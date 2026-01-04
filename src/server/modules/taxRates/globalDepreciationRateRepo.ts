import { connectDb } from "@/server/db/mongoose";
import { GlobalDepreciationRateModel } from "@/server/models";

export async function listGlobalDepreciationRates() {
    await connectDb();
    return GlobalDepreciationRateModel.find({})
        .sort({ effectiveFrom: -1, ageFromYear: 1 })
        .lean();
}

export async function createGlobalDepreciationRate(params: {
    ageFromYear: number;
    ageToYear?: number | null;
    depreciationRate: number;
    effectiveFrom: Date;
}) {
    await connectDb();
    const doc = await GlobalDepreciationRateModel.create(params);
    return doc.toObject();
}

export async function updateGlobalDepreciationRate(
    id: string,
    params: Partial<{
        ageFromYear: number;
        ageToYear?: number | null;
        depreciationRate: number;
        effectiveFrom: Date;
    }>,
) {
    await connectDb();
    const doc = await GlobalDepreciationRateModel.findByIdAndUpdate(id, params, {
        new: true,
        runValidators: true,
    });
    return doc?.toObject() ?? null;
}

export async function deleteGlobalDepreciationRate(id: string) {
    await connectDb();
    const doc = await GlobalDepreciationRateModel.findByIdAndDelete(id);
    return doc?.toObject() ?? null;
}
