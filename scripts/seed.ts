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

  const superAdmins = [
    { email: "admin", password: "admin123" },
    { email: "gramsoft@gmail.com", password: "SwarajSoft@123" },
  ];

  for (const sa of superAdmins) {
    const passwordHash = await hashPassword(sa.password);
    await UserModel.updateOne(
      { email: sa.email },
      {
        $set: {
          name: "Super Admin",
          passwordHash,
          role: "SUPER_ADMIN",
          status: "ACTIVE",
        },
        $setOnInsert: {
          createdAt: new Date(),
        },
      },
      { upsert: true },
    );
  }

  console.log("Seed complete");
  console.log("- SUPER_ADMIN: admin / admin123");
  console.log("- SUPER_ADMIN: gramsoft@gmail.com / SwarajSoft@123");
  console.log("- Sample village:", String(createdVillage._id), createdVillage.name);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
