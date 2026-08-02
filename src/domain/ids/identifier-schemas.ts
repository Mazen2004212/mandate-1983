import { z } from "zod";

import {
  CANONICAL_CHARACTER_IDS,
  CANONICAL_FACTION_IDS,
  CANONICAL_INTERNATIONAL_ENTITY_IDS,
  CANONICAL_OUTCOME_IDS,
  CANONICAL_REGION_IDS,
  FAMILY_ROLE_IDS,
} from "../constants/canonical-ids";

export const authoredIdSchema = z
  .string()
  .regex(/^[a-z][a-z0-9]*(?:_[a-z0-9]+)*$/, {
    message:
      "Stable authored IDs must be lowercase ASCII snake case and begin with a letter.",
  });

export const saveIdSchema = z.uuid().brand<"SaveId">();
export const userIdSchema = z.uuid().brand<"UserId">();
export const characterIdSchema = authoredIdSchema.brand<"CharacterId">();
export const factionIdSchema = authoredIdSchema.brand<"FactionId">();
export const regionIdSchema = authoredIdSchema.brand<"RegionId">();
export const scenarioIdSchema = authoredIdSchema.brand<"ScenarioId">();
export const choiceIdSchema = authoredIdSchema.brand<"ChoiceId">();
export const conditionIdSchema = authoredIdSchema.brand<"ConditionId">();
export const effectIdSchema = authoredIdSchema.brand<"EffectId">();
export const delayedEffectIdSchema =
  authoredIdSchema.brand<"DelayedEffectId">();
export const memoryIdSchema = authoredIdSchema.brand<"MemoryId">();
export const flagIdSchema = authoredIdSchema.brand<"FlagId">();
export const mediaIdSchema = authoredIdSchema.brand<"MediaId">();
export const lawOrMeasureIdSchema = authoredIdSchema.brand<"LawOrMeasureId">();
export const projectIdSchema = authoredIdSchema.brand<"ProjectId">();
export const outcomeIdSchema = authoredIdSchema.brand<"OutcomeId">();
export const contentManifestIdSchema =
  authoredIdSchema.brand<"ContentManifestId">();
export const portraitPresetIdSchema =
  authoredIdSchema.brand<"PortraitPresetId">();

export const canonicalCharacterIdSchema = z
  .enum(CANONICAL_CHARACTER_IDS)
  .transform((value) => characterIdSchema.parse(value));
export const familyRoleIdSchema = z
  .enum(FAMILY_ROLE_IDS)
  .brand<"FamilyRoleId">();
export const canonicalFactionIdSchema = z
  .enum(CANONICAL_FACTION_IDS)
  .transform((value) => factionIdSchema.parse(value));
export const canonicalRegionIdSchema = z
  .enum(CANONICAL_REGION_IDS)
  .transform((value) => regionIdSchema.parse(value));
export const canonicalInternationalEntityIdSchema = z
  .enum(CANONICAL_INTERNATIONAL_ENTITY_IDS)
  .brand<"InternationalEntityId">();
export const canonicalOutcomeIdSchema = z
  .enum(CANONICAL_OUTCOME_IDS)
  .transform((value) => outcomeIdSchema.parse(value));

export type SaveId = z.infer<typeof saveIdSchema>;
export type UserId = z.infer<typeof userIdSchema>;
export type CharacterId = z.infer<typeof characterIdSchema>;
export type FactionId = z.infer<typeof factionIdSchema>;
export type RegionId = z.infer<typeof regionIdSchema>;
export type ScenarioId = z.infer<typeof scenarioIdSchema>;
export type ChoiceId = z.infer<typeof choiceIdSchema>;
export type ConditionId = z.infer<typeof conditionIdSchema>;
export type EffectId = z.infer<typeof effectIdSchema>;
export type DelayedEffectId = z.infer<typeof delayedEffectIdSchema>;
export type MemoryId = z.infer<typeof memoryIdSchema>;
export type FlagId = z.infer<typeof flagIdSchema>;
export type MediaId = z.infer<typeof mediaIdSchema>;
export type LawOrMeasureId = z.infer<typeof lawOrMeasureIdSchema>;
export type ProjectId = z.infer<typeof projectIdSchema>;
export type OutcomeId = z.infer<typeof outcomeIdSchema>;
export type ContentManifestId = z.infer<typeof contentManifestIdSchema>;
export type PortraitPresetId = z.infer<typeof portraitPresetIdSchema>;
export type FamilyRoleId = z.infer<typeof familyRoleIdSchema>;
export type InternationalEntityId = z.infer<
  typeof canonicalInternationalEntityIdSchema
>;
