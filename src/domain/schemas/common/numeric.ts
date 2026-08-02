import { z } from "zod";

export const normalizedScoreSchema = z
  .number()
  .int()
  .min(0)
  .max(100)
  .brand<"NormalizedScore">();

export const signedWeightSchema = z
  .number()
  .int()
  .min(-100)
  .max(100)
  .brand<"SignedWeight">();

export const basisPointsSchema = z.number().int().brand<"BasisPoints">();

export const revisionSchema = z
  .number()
  .int()
  .nonnegative()
  .safe()
  .brand<"Revision">();

export const politicalPeriodSchema = z
  .number()
  .int()
  .min(0)
  .max(6)
  .brand<"PoliticalPeriod">();

export const seedValueSchema = z
  .string()
  .min(16)
  .max(128)
  .regex(/^[A-Za-z0-9_-]+$/, {
    message: "Seed values must use only bounded, persistence-safe characters.",
  })
  .brand<"SeedValue">();

export const governmentPenaltySchema = z.number().int().min(0).max(20);
export const inflationBasisPointsSchema = basisPointsSchema.refine(
  (value) => value >= 0 && value <= 5000,
  "Inflation must be between 0 and 5000 basis points.",
);
export const unemploymentBasisPointsSchema = basisPointsSchema.refine(
  (value) => value >= 0 && value <= 4000,
  "Unemployment must be between 0 and 4000 basis points.",
);
export const annualGrowthBasisPointsSchema = basisPointsSchema.refine(
  (value) => value >= -1000 && value <= 1000,
  "Annual growth must be between -1000 and 1000 basis points.",
);

export type NormalizedScore = z.infer<typeof normalizedScoreSchema>;
export type SignedWeight = z.infer<typeof signedWeightSchema>;
export type BasisPoints = z.infer<typeof basisPointsSchema>;
export type Revision = z.infer<typeof revisionSchema>;
export type PoliticalPeriod = z.infer<typeof politicalPeriodSchema>;
export type SeedValue = z.infer<typeof seedValueSchema>;
