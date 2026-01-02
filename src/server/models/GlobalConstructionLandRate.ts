import mongoose, { Schema } from "mongoose";

export type GlobalConstructionLandRateDocument = {
  _id: mongoose.Types.ObjectId;
  propertyTypeMr: string;
  constructionRate: number;
  constructionLandRate: number;
  landRate: number;
  approvedRate: number;
  effectiveFrom: Date;
  createdAt: Date;
};

const globalConstructionLandRateSchema = new Schema<GlobalConstructionLandRateDocument>(
  {
    propertyTypeMr: { type: String, required: true, trim: true },
    constructionRate: { type: Number, required: true },
    constructionLandRate: { type: Number, required: true },
    landRate: { type: Number, required: true },
    approvedRate: { type: Number, required: true },
    effectiveFrom: { type: Date, required: true },
    createdAt: { type: Date, required: true, default: () => new Date() },
  },
  { collection: "global_construction_land_rates" },
);

globalConstructionLandRateSchema.index(
  { propertyTypeMr: 1, effectiveFrom: -1 },
  { unique: true },
);

globalConstructionLandRateSchema.index({ effectiveFrom: -1 });

export const GlobalConstructionLandRateModel =
  (mongoose.models.GlobalConstructionLandRate as mongoose.Model<GlobalConstructionLandRateDocument>) ||
  mongoose.model<GlobalConstructionLandRateDocument>(
    "GlobalConstructionLandRate",
    globalConstructionLandRateSchema,
  );
