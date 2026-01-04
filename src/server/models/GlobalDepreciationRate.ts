
import mongoose, { Schema } from "mongoose";

export type GlobalDepreciationRateDocument = {
    _id: mongoose.Types.ObjectId;
    ageFromYear: number;
    ageToYear?: number | null;
    depreciationRate: number;
    effectiveFrom: Date;
    createdAt: Date;
};

const globalDepreciationRateSchema = new Schema<GlobalDepreciationRateDocument>(
    {
        ageFromYear: { type: Number, required: true },
        ageToYear: { type: Number, required: false, default: null },
        depreciationRate: { type: Number, required: true },
        effectiveFrom: { type: Date, required: true },
        createdAt: { type: Date, required: true, default: () => new Date() },
    },
    { collection: "global_depreciation_rates" },
);

globalDepreciationRateSchema.index(
    { effectiveFrom: -1, ageFromYear: 1, ageToYear: 1 },
    { unique: true },
);

export const GlobalDepreciationRateModel =
    (mongoose.models.GlobalDepreciationRate as mongoose.Model<GlobalDepreciationRateDocument>) ||
    mongoose.model<GlobalDepreciationRateDocument>("GlobalDepreciationRate", globalDepreciationRateSchema);
