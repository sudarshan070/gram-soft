import { jsonError, jsonOk, badRequest } from "@/lib/errors";
import { createUserSchema } from "@/lib/validators/users";
import { hashPassword } from "@/server/auth/password";
import { requireRole } from "@/server/auth/require";
import { createUser, listUsers } from "@/server/modules/users/userRepo";

export async function GET() {
  try {
    await requireRole("SUPER_ADMIN");
    const users = await listUsers();
    return jsonOk({ users });
  } catch (err) {
    return jsonError(err);
  }
}

export async function POST(req: Request) {
  try {
    await requireRole("SUPER_ADMIN");

    const body = await req.json();
    const parsed = createUserSchema.safeParse(body);
    if (!parsed.success) throw badRequest("Invalid request", parsed.error.flatten());

    const passwordHash = await hashPassword(parsed.data.password);

    const user = await createUser({
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash,
      role: parsed.data.role ?? "USER",
      status: parsed.data.status ?? "ACTIVE",
      villageIds: parsed.data.villageIds,
    });

    return jsonOk({ user });
  } catch (err) {
    return jsonError(err);
  }
}
