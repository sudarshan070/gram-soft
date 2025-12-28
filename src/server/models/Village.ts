import mongoose, { Schema } from "mongoose";

import type { Status } from "./types";

export type VillageDocument = {
  _id: mongoose.Types.ObjectId;
  name: string;
  district: string;
  taluka: string;
  code: string;
  status: Status;
  createdAt: Date;
};

const villageSchema = new Schema<VillageDocument>(
  {
    name: { type: String, required: true, trim: true },
    district: { type: String, required: true, trim: true },
    taluka: { type: String, required: true, trim: true },
    code: { type: String, required: true, trim: true },
    status: { type: String, required: true, enum: ["ACTIVE", "INACTIVE"], default: "ACTIVE" },
    createdAt: { type: Date, required: true, default: () => new Date() },
  },
  { collection: "villages" },
);

villageSchema.index({ code: 1 }, { unique: true });

export const VillageModel =
  (mongoose.models.Village as mongoose.Model<VillageDocument>) ||
  mongoose.model<VillageDocument>("Village", villageSchema);
