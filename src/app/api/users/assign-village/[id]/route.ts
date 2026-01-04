import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

import { UserModel } from "@/server/models/User";
import { VillageModel } from "@/server/models/Village";

type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: { code: string; message: string } };

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    const { villageId } = await request.json();
    const userId = params.id;
    console.log("Assigning village to user:", userId, villageId);

    if (!villageId) {
      return NextResponse.json(
        { success: false, error: { code: "MISSING_VILLAGE_ID", message: "Village ID is required" } },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await UserModel.findById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: "USER_NOT_FOUND", message: "User not found" } },
        { status: 404 }
      );
    }

    // Check if village exists
    const village = await VillageModel.findById(villageId);
    if (!village) {
      return NextResponse.json(
        { success: false, error: { code: "VILLAGE_NOT_FOUND", message: "Village not found" } },
        { status: 404 }
      );
    }

    // Remove user from previous village if assigned
    if (user.villageId) {
      await VillageModel.findByIdAndUpdate(
        user.villageId,
        { $pull: { userIds: userId } }
      );
    }

    // Assign user to new village
    await UserModel.findByIdAndUpdate(
      userId,
      { villageId: villageId }
    );

    await VillageModel.findByIdAndUpdate(
      villageId,
      { $addToSet: { userIds: userId } }
    );

    console.log("Village assignment completed successfully");
    return NextResponse.json({
      success: true,
      data: { ok: true }
    });

  } catch (error) {
    console.error("Assign village error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: { 
          code: "ASSIGN_VILLAGE_ERROR", 
          message: "Failed to assign village to user" 
        } 
      },
      { status: 500 }
    );
  }
}
