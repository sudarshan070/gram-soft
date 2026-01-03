import { jsonOk } from "@/lib/errors";
import { findUserByEmail } from "@/server/modules/users/userRepo";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    const user = await findUserByEmail(email);
    
    return jsonOk({
      user: {
        id: user?._id,
        name: user?.name,
        email: user?.email,
        role: user?.role,
        villageId: user?.villageId,
        hasVillageId: !!user?.villageId
      }
    });
  } catch (error) {
    return jsonOk({ error: error instanceof Error ? error.message : "Unknown error" });
  }
}
