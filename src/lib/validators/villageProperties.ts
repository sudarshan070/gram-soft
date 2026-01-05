
import { z } from "zod";

const propertyConstructionSchema = z.object({
    usageType: z.string().min(1),
    constructionType: z.string().min(1),
    constructionYear: z.coerce.number().int().min(1900),
    floor: z.string().min(1),
    length: z.coerce.number().nonnegative(),
    width: z.coerce.number().nonnegative(),
    areaSqFt: z.coerce.number().nonnegative(),
});

export const createVillagePropertySchema = z.object({
    villageId: z.string().min(1),
    propertyNo: z.string().min(1),
    wardNo: z.string().min(1),
    ownerName: z.string().min(1),
    aadharNumber: z.string().length(12).regex(/^\d+$/, "Must be numeric").optional().or(z.literal("")),
    spouseName: z.string().optional(),
    occupierName: z.string().optional(),
    address: z.string().optional(),
    mobile: z.string().optional(),
    mobile2: z.string().optional(),
    directions: z.object({
        east: z.string().optional(),
        west: z.string().optional(),
        north: z.string().optional(),
        south: z.string().optional(),
    }).optional(),
    waterTaxType: z.string().optional(),
    isTaxExempt: z.boolean().optional(),
    constructions: z.array(propertyConstructionSchema).default([]),
});

export type CreateVillagePropertyInput = z.infer<typeof createVillagePropertySchema>;
