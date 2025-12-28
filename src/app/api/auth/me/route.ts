import { jsonError, jsonOk } from "@/lib/errors";
import { requireAuth } from "@/server/auth/require";

export async function GET() {
  try {
    const auth = await requireAuth();
    return jsonOk({
      user: {
        id: auth.userId,
        role: auth.role,
        name: auth.name,
        email: auth.email,
        villageIds: auth.villageIds,
      },
    });
  } catch (err) {
    return jsonError(err);
  }
}
