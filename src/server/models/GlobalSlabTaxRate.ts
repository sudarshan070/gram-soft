
import mongoose, { Schema } from "mongoose";

export type GlobalSlabTaxKey = "HEALTH" | "ELECTRICITY_SUPPLY" | "DIVABATTI";

export type GlobalSlabTaxRateDocument = {
  _id: mongoose.Types.ObjectId;
  taxKey: GlobalSlabTaxKey;
  slabFromSqFt: number;
  slabToSqFt?: number | null;
  rate: number;
  effectiveFrom: Date;
  createdAt: Date;
};

const globalSlabTaxRateSchema = new Schema<GlobalSlabTaxRateDocument>(
  {
    taxKey: { type: String, required: true, enum: ["HEALTH", "ELECTRICITY_SUPPLY", "DIVABATTI"] },
    slabFromSqFt: { type: Number, required: true },
    slabToSqFt: { type: Number, required: false, default: null },
    rate: { type: Number, required: true },
    effectiveFrom: { type: Date, required: true },
    createdAt: { type: Date, required: true, default: () => new Date() },
  },
  { collection: "global_slab_tax_rates" },
);

globalSlabTaxRateSchema.index(
  { taxKey: 1, effectiveFrom: -1, slabFromSqFt: 1, slabToSqFt: 1 },
  { unique: true },
);

globalSlabTaxRateSchema.index({ taxKey: 1, effectiveFrom: -1 });

export const GlobalSlabTaxRateModel =
  (mongoose.models.GlobalSlabTaxRate as mongoose.Model<GlobalSlabTaxRateDocument>) ||
  mongoose.model<GlobalSlabTaxRateDocument>("GlobalSlabTaxRate", globalSlabTaxRateSchema);

