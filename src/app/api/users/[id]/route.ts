import type { NextRequest } from "next/server";
import mongoose from "mongoose";

import { jsonError, jsonOk, badRequest, notFound } from "@/lib/errors";
import { updateUserSchema } from "@/lib/validators/users";
import { hashPassword } from "@/server/auth/password";
import { requireRole } from "@/server/auth/require";
import { deleteUser, findUserById, updateUser } from "@/server/modules/users/userRepo";
import { UserModel } from "@/server/models/User";
import { VillageModel } from "@/server/models/Village";
import { UserRole } from "@/server/models/types";

export async function GET(_: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    await requireRole(UserRole.SUPER_ADMIN);
    const { id } = await ctx.params;
    const user = await findUserById(id);
    if (!user) throw notFound("User not found");
    return jsonOk({ user });
  } catch (err) {
    return jsonError(err);
  }
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    await requireRole(UserRole.SUPER_ADMIN);
    const { id } = await ctx.params;

    const body = await req.json();
    const parsed = updateUserSchema.safeParse(body);
    if (!parsed.success) throw badRequest("Invalid request", parsed.error.flatten());

    const passwordHash = parsed.data.password ? await hashPassword(parsed.data.password) : undefined;

    const user = await updateUser(id, {
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash,
      role: parsed.data.role,
      status: parsed.data.status,
      villageIds: parsed.data.villageIds,
    });

    if (!user) throw notFound("User not found");

    return jsonOk({ user });
  } catch (err) {
    return jsonError(err);
  }
}

export async function DELETE(_: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    await requireRole(UserRole.SUPER_ADMIN);
    const { id } = await ctx.params;
    await deleteUser(id);
    return jsonOk({ ok: true });
  } catch (err) {
    return jsonError(err);
  }
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    await requireRole(UserRole.SUPER_ADMIN);
    const { id } = await ctx.params;
    
    const body = await req.json();
    
    // Handle village removal
    if (body.action === "remove-village") {
      if (mongoose.connection.readyState !== 1) {
        await mongoose.connect(process.env.MONGODB_URI!);
      }

      // Check if user exists
      const user = await UserModel.findById(id);
      if (!user) {
        return jsonError(badRequest("User not found"));
      }

      // Check if user has a village assigned
      if (!user.villageId) {
        return jsonError(badRequest("No village assigned to this user"));
      }

      // Remove user from village's userIds array
      await VillageModel.findByIdAndUpdate(
        user.villageId,
        { $pull: { userIds: id } }
      );

      // Set villageId to null instead of unsetting it
      await UserModel.findByIdAndUpdate(
        id,
        { villageId: null }
      );

      return jsonOk({ ok: true });
    }
    
    // Handle village assignment
    if (body.action === "assign-village" && body.villageId) {
      if (mongoose.connection.readyState !== 1) {
        await mongoose.connect(process.env.MONGODB_URI!);
      }

      const { villageId } = body;

      // Check if user exists
      const user = await UserModel.findById(id);
      if (!user) {
        return jsonError(badRequest("User not found"));
      }

      // Check if village exists
      const village = await VillageModel.findById(villageId);
      if (!village) {
        return jsonError(badRequest("Village not found"));
      }

      // Remove user from previous village if assigned
      if (user.villageId) {
        await VillageModel.findByIdAndUpdate(
          user.villageId,
          { $pull: { userIds: id } }
        );
      }

      // Assign user to new village
      await UserModel.findByIdAndUpdate(
        id,
        { villageId: villageId }
      );

      await VillageModel.findByIdAndUpdate(
        villageId,
        { $addToSet: { userIds: id } }
      );

      return jsonOk({ ok: true });
    }

    return jsonError(badRequest("Invalid action"));
  } catch (err) {
    return jsonError(err);
  }
}
