import mongoose from "mongoose";

import { env } from "@/lib/env";

type MongooseGlobal = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

const globalForMongoose = globalThis as unknown as { __mongoose: MongooseGlobal };

if (!globalForMongoose.__mongoose) {
  globalForMongoose.__mongoose = { conn: null, promise: null };
}

export async function connectDb() {
  const cached = globalForMongoose.__mongoose;

  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(env.MONGODB_URI, {
        autoIndex: process.env.NODE_ENV !== "production",
      })
      .then((m) => m);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
