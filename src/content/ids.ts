import { z } from "zod";

import {
  authoredIdSchema,
  choiceIdSchema,
  conditionIdSchema,
  contentManifestIdSchema,
  delayedEffectIdSchema,
  effectIdSchema,
  flagIdSchema,
  lawOrMeasureIdSchema,
  mediaIdSchema,
  memoryIdSchema,
  outcomeIdSchema,
  projectIdSchema,
  scenarioIdSchema,
} from "../domain";

const boundedAuthoredIdSchema = authoredIdSchema.max(96);

function bounded<T extends z.ZodType>(schema: T) {
  return schema.refine((value) => String(value).length <= 96, {
    message: "Stable content IDs must not exceed 96 characters.",
  });
}

export const contentObjectIdSchema =
  boundedAuthoredIdSchema.brand<"ContentObjectId">();
export const scenarioContentIdSchema = bounded(scenarioIdSchema);
export const choiceContentIdSchema = bounded(choiceIdSchema);
export const conditionContentIdSchema = bounded(conditionIdSchema);
export const effectContentIdSchema = bounded(effectIdSchema);
export const delayedEffectContentIdSchema = bounded(delayedEffectIdSchema);
export const memoryContentIdSchema = bounded(memoryIdSchema);
export const flagContentIdSchema = bounded(flagIdSchema);
export const mediaContentIdSchema = bounded(mediaIdSchema);
export const lawOrMeasureContentIdSchema = bounded(lawOrMeasureIdSchema);
export const projectContentIdSchema = bounded(projectIdSchema);
export const outcomeContentIdSchema = bounded(outcomeIdSchema);
export const manifestContentIdSchema = bounded(contentManifestIdSchema);

export const beatIdSchema = boundedAuthoredIdSchema.brand<"BeatId">();
export const institutionIdSchema =
  boundedAuthoredIdSchema.brand<"InstitutionId">();
export const intelligenceAssertionIdSchema =
  boundedAuthoredIdSchema.brand<"IntelligenceAssertionId">();
export const epilogueIdSchema = boundedAuthoredIdSchema.brand<"EpilogueId">();
export const outletIdSchema = boundedAuthoredIdSchema.brand<"OutletId">();
export const tokenIdSchema = boundedAuthoredIdSchema.brand<"TokenId">();

export type ContentObjectId = z.infer<typeof contentObjectIdSchema>;
export type BeatId = z.infer<typeof beatIdSchema>;
export type InstitutionId = z.infer<typeof institutionIdSchema>;
export type IntelligenceAssertionId = z.infer<
  typeof intelligenceAssertionIdSchema
>;
export type EpilogueId = z.infer<typeof epilogueIdSchema>;
export type OutletId = z.infer<typeof outletIdSchema>;
export type TokenId = z.infer<typeof tokenIdSchema>;
