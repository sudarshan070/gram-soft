import { z } from "zod";

export const setVillageUsersSchema = z.object({
  userIds: z.array(z.string().min(1)),
});
