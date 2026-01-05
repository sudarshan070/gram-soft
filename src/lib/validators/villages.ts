import { z } from "zod";

export const createVillageSchema = z.object({
  name: z.string().min(1),
  district: z.string().min(1),
  taluka: z.string().min(1),
  code: z.string().min(1).optional(),
  parentId: z.string().optional().nullable(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
});

export const updateVillageSchema = z.object({
  name: z.string().min(1).optional(),
  district: z.string().min(1).optional(),
  taluka: z.string().min(1).optional(),
  code: z.string().min(1).optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
});
