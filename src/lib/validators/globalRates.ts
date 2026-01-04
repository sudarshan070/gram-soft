import { z } from "zod";

// field is likely calculated or derived. Leaving schema as is but adding coercion.
export const createGlobalConstructionLandRateSchema = z.object({
  propertyTypeMr: z.string().trim().min(1),
  constructionRate: z.coerce.number().nonnegative(),
  constructionLandRate: z.coerce.number().nonnegative(),
  landRate: z.coerce.number().nonnegative(),
  approvedRate: z.coerce.number().nonnegative(),
  effectiveFrom: z.coerce.date(),
});

export const updateGlobalConstructionLandRateSchema = createGlobalConstructionLandRateSchema.partial();

export const createGlobalWaterSupplyTaxRateSchema = z.object({
  waterTaxTypeMr: z.string().trim().min(1),
  rate: z.coerce.number().nonnegative(),
  effectiveFrom: z.coerce.date(),
});

export const updateGlobalWaterSupplyTaxRateSchema = createGlobalWaterSupplyTaxRateSchema.partial();

export const createGlobalSlabTaxRateSchema = z
  .object({
    slabFromSqFt: z.coerce.number().nonnegative(),
    slabToSqFt: z.coerce.number().nonnegative().nullable().optional(),
    rate: z.coerce.number().nonnegative(),
    effectiveFrom: z.coerce.date(),
  })
  .superRefine((val, ctx) => {
    if (val.slabToSqFt != null && val.slabToSqFt < val.slabFromSqFt) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "slabToSqFt must be >= slabFromSqFt",
        path: ["slabToSqFt"],
      });
    }
  });

export const updateGlobalSlabTaxRateSchema = createGlobalSlabTaxRateSchema.partial();

export type CreateGlobalConstructionLandRateInput = z.infer<typeof createGlobalConstructionLandRateSchema>;
export type UpdateGlobalConstructionLandRateInput = z.infer<typeof updateGlobalConstructionLandRateSchema>;

export type CreateGlobalWaterSupplyTaxRateInput = z.infer<typeof createGlobalWaterSupplyTaxRateSchema>;
export type UpdateGlobalWaterSupplyTaxRateInput = z.infer<typeof updateGlobalWaterSupplyTaxRateSchema>;

export type CreateGlobalSlabTaxRateInput = z.infer<typeof createGlobalSlabTaxRateSchema>;
export type UpdateGlobalSlabTaxRateInput = z.infer<typeof updateGlobalSlabTaxRateSchema>;

