import mongoose, { Schema } from "mongoose";

export type GlobalWaterSupplyTaxRateDocument = {
  _id: mongoose.Types.ObjectId;
  waterTaxTypeMr: string;
  rate: number;
  effectiveFrom: Date;
  createdAt: Date;
};

const globalWaterSupplyTaxRateSchema = new Schema<GlobalWaterSupplyTaxRateDocument>(
  {
    waterTaxTypeMr: { type: String, required: true, trim: true },
    rate: { type: Number, required: true },
    effectiveFrom: { type: Date, required: true },
    createdAt: { type: Date, required: true, default: () => new Date() },
  },
  { collection: "global_water_supply_tax_rates" },
);

globalWaterSupplyTaxRateSchema.index({ waterTaxTypeMr: 1, effectiveFrom: -1 }, { unique: true });
globalWaterSupplyTaxRateSchema.index({ effectiveFrom: -1 });

export const GlobalWaterSupplyTaxRateModel =
  (mongoose.models.GlobalWaterSupplyTaxRate as mongoose.Model<GlobalWaterSupplyTaxRateDocument>) ||
  mongoose.model<GlobalWaterSupplyTaxRateDocument>(
    "GlobalWaterSupplyTaxRate",
    globalWaterSupplyTaxRateSchema,
  );
