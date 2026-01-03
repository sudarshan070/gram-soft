import mongoose, { Schema } from "mongoose";

import { UserRole, Status } from "./types";

export type UserDocument = {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  villageId: mongoose.Types.ObjectId | null;
  status: Status;
  createdAt: Date;
};

const userSchema = new Schema<UserDocument>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      required: true,
      enum: Object.values(UserRole),
      default: UserRole.USER,
    },
    villageId: { type: Schema.Types.ObjectId, ref: "Village", default: null },
    status: { type: String, required: true, enum: Object.values(Status), default: Status.ACTIVE },
    createdAt: { type: Date, required: true, default: () => new Date() },
  },
  { collection: "users" },
);

export const UserModel =
  (mongoose.models.User as mongoose.Model<UserDocument>) ||
  mongoose.model<UserDocument>("User", userSchema);
