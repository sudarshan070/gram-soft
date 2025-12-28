import mongoose, { Schema } from "mongoose";

import type { Status, UserRole } from "./types";

export type UserDocument = {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
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
      enum: ["SUPER_ADMIN", "ADMIN", "USER"],
      default: "USER",
    },
    status: { type: String, required: true, enum: ["ACTIVE", "INACTIVE"], default: "ACTIVE" },
    createdAt: { type: Date, required: true, default: () => new Date() },
  },
  { collection: "users" },
);

userSchema.index({ email: 1 }, { unique: true });

export const UserModel =
  (mongoose.models.User as mongoose.Model<UserDocument>) ||
  mongoose.model<UserDocument>("User", userSchema);
