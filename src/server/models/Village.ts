import mongoose, { Schema } from "mongoose";

import { Status } from "./types";

export type VillageDocument = {
  _id: mongoose.Types.ObjectId;
  name: string;
  district: string;
  taluka: string;
  code: string;
  userIds: mongoose.Types.ObjectId[];
  parentId: mongoose.Types.ObjectId | null;
  status: Status;
  createdAt: Date;
};

const villageSchema = new Schema<VillageDocument>(
  {
    name: { type: String, required: true, trim: true },
    district: { type: String, required: true, trim: true },
    taluka: { type: String, required: true, trim: true },
    code: { type: String, required: true, trim: true },
    userIds: [{ type: Schema.Types.ObjectId, ref: "User" }],
    parentId: { type: Schema.Types.ObjectId, ref: "Village", default: null }, // Parent village for sub-villages
    status: { type: String, required: true, enum: Object.values(Status), default: Status.ACTIVE },
    createdAt: { type: Date, required: true, default: () => new Date() },
  },
  { collection: "villages" },
);

villageSchema.index({ code: 1 }, { unique: true });

// Prevent Mongoose OverwriteModelError by checking if model exists
// In development, force delete to ensure schema changes (like parentId) are applied
if (process.env.NODE_ENV === "development" && mongoose.models.Village) {
  delete mongoose.models.Village;
}

export const VillageModel =
  (mongoose.models.Village as mongoose.Model<VillageDocument>) ||
  mongoose.model<VillageDocument>("Village", villageSchema);
