import { z } from "zod";

export const createUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().min(1).transform((s) => s.trim().toLowerCase()),
  password: z.string().min(6),
  role: z.enum(["SUPER_ADMIN", "ADMIN", "USER"]).optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
  villageIds: z.array(z.string().min(1)).optional(),
});

export const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  email: z
    .string()
    .min(1)
    .transform((s) => s.trim().toLowerCase())
    .optional(),
  password: z.string().min(6).optional(),
  role: z.enum(["SUPER_ADMIN", "ADMIN", "USER"]).optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
  villageIds: z.array(z.string().min(1)).optional(),
});
