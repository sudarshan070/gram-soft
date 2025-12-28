import "dotenv/config";

import { connectDb } from "../src/server/db/mongoose";
import { UserModel, VillageModel } from "../src/server/models";
import { hashPassword } from "../src/server/auth/password";

async function main() {
  await connectDb();

  const village = await VillageModel.findOne({ code: "V001" });
  const createdVillage =
    village ??
    (await VillageModel.create({
      name: "Sample Village",
      district: "Sample District",
      taluka: "Sample Taluka",
      code: "V001",
      status: "ACTIVE",
    }));

  const email = "admin";
  const existing = await UserModel.findOne({ email });

  if (!existing) {
    const passwordHash = await hashPassword("admin123");
    await UserModel.create({
      name: "Super Admin",
      email,
      passwordHash,
      role: "SUPER_ADMIN",
      status: "ACTIVE",
    });
  }

  console.log("Seed complete");
  console.log("- SUPER_ADMIN: admin / admin123");
  console.log("- Sample village:", String(createdVillage._id), createdVillage.name);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
