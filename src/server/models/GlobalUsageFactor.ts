
import mongoose, { Schema } from "mongoose";

export type GlobalUsageFactorDocument = {
    _id: mongoose.Types.ObjectId;
    usageTypeMr: string;
    weightage: number;
    effectiveFrom: Date;
    createdAt: Date;
};

const globalUsageFactorSchema = new Schema<GlobalUsageFactorDocument>(
    {
        usageTypeMr: { type: String, required: true, trim: true },
        weightage: { type: Number, required: true },
        effectiveFrom: { type: Date, required: true },
        createdAt: { type: Date, required: true, default: () => new Date() },
    },
    { collection: "global_usage_factors" },
);

globalUsageFactorSchema.index(
    { effectiveFrom: -1, usageTypeMr: 1 },
    { unique: true },
);

export const GlobalUsageFactorModel =
    (mongoose.models.GlobalUsageFactor as mongoose.Model<GlobalUsageFactorDocument>) ||
    mongoose.model<GlobalUsageFactorDocument>("GlobalUsageFactor", globalUsageFactorSchema);
