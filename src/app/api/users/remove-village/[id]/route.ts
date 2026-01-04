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

    const userId = params.id;
    console.log("Removing village from user ID:", userId);
    console.log("MongoDB connection state:", mongoose.connection.readyState);

    // Check if user exists
    const user = await UserModel.findById(userId);
    console.log("Found user:", user);
    
    if (!user) {
      console.log("User not found. Checking if ID is valid ObjectId...");
      console.log("Is valid ObjectId:", mongoose.Types.ObjectId.isValid(userId));
      
      // Try to find user by string ID or check if there are any users
      const allUsers = await UserModel.find({}).limit(5);
      console.log("Sample users in database:", allUsers.map(u => ({ id: u._id, name: u.name })));
      
      return NextResponse.json(
        { success: false, error: { code: "USER_NOT_FOUND", message: "User not found" } },
        { status: 404 }
      );
    }

    // Check if user has a village assigned
    console.log("User villageId:", user.villageId);
    if (!user.villageId) {
      console.log("No village assigned to user");
      return NextResponse.json(
        { success: false, error: { code: "NO_VILLAGE_ASSIGNED", message: "No village assigned to this user" } },
        { status: 400 }
      );
    }

    // Remove user from village's userIds array
    console.log("Removing user from village:", user.villageId);
    const villageUpdate = await VillageModel.findByIdAndUpdate(
      user.villageId,
      { $pull: { userIds: userId } }
    );
    console.log("Village update result:", villageUpdate);

    // Remove villageId from user
    console.log("Removing villageId from user");
    const userUpdate = await UserModel.findByIdAndUpdate(
      userId,
      { $unset: { villageId: 1 } }
    );
    console.log("User update result:", userUpdate);

    console.log("Village removal completed successfully");
    return NextResponse.json({
      success: true,
      data: { ok: true }
    });

  } catch (error) {
    console.error("Remove village error:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: { 
          code: "REMOVE_VILLAGE_ERROR", 
          message: "Failed to remove village assignment" 
        } 
      },
      { status: 500 }
    );
  }
}
