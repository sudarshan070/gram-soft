import mongoose, { Schema } from "mongoose";

export type UserVillageAccessDocument = {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  villageId: mongoose.Types.ObjectId;
  createdAt: Date;
};

const userVillageAccessSchema = new Schema<UserVillageAccessDocument>(
  {
    userId: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    villageId: { type: Schema.Types.ObjectId, required: true, ref: "Village" },
    createdAt: { type: Date, required: true, default: () => new Date() },
  },
  { collection: "userVillageAccess" },
);

userVillageAccessSchema.index({ userId: 1, villageId: 1 }, { unique: true });

export const UserVillageAccessModel =
  (mongoose.models.UserVillageAccess as mongoose.Model<UserVillageAccessDocument>) ||
  mongoose.model<UserVillageAccessDocument>("UserVillageAccess", userVillageAccessSchema);
