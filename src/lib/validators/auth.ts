import { z } from "zod";

export const loginRequestSchema = z.object({
  email: z.string().min(1).transform((s) => s.trim().toLowerCase()),
  password: z.string().min(1),
});
