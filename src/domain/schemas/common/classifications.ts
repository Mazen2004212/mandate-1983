import { z } from "zod";

import {
  CHARACTER_AVAILABILITIES,
  CONTENT_LIFECYCLE_STATUSES,
  DELAYED_EFFECT_FAILURE_BEHAVIORS,
  DELAYED_EFFECT_IDEMPOTENCY_SCOPES,
  DELAYED_EFFECT_STATUSES,
  POLITICAL_BACKGROUND_IDS,
  STATE_VISIBILITIES,
  SUPPORTED_DIFFICULTIES,
} from "../../constants/classifications";

export const stateVisibilitySchema = z.enum(STATE_VISIBILITIES);
export const politicalBackgroundIdSchema = z.enum(POLITICAL_BACKGROUND_IDS);
export const contentLifecycleStatusSchema = z.enum(CONTENT_LIFECYCLE_STATUSES);
export const delayedEffectStatusSchema = z.enum(DELAYED_EFFECT_STATUSES);
export const delayedEffectIdempotencyScopeSchema = z.enum(
  DELAYED_EFFECT_IDEMPOTENCY_SCOPES,
);
export const delayedEffectFailureBehaviorSchema = z.enum(
  DELAYED_EFFECT_FAILURE_BEHAVIORS,
);
export const characterAvailabilitySchema = z.enum(CHARACTER_AVAILABILITIES);
export const difficultySchema = z.enum(SUPPORTED_DIFFICULTIES);

export type StateVisibility = z.infer<typeof stateVisibilitySchema>;
export type PoliticalBackgroundId = z.infer<typeof politicalBackgroundIdSchema>;
export type ContentLifecycleStatus = z.infer<
  typeof contentLifecycleStatusSchema
>;
export type DelayedEffectStatus = z.infer<typeof delayedEffectStatusSchema>;
export type DelayedEffectIdempotencyScope = z.infer<
  typeof delayedEffectIdempotencyScopeSchema
>;
export type DelayedEffectFailureBehavior = z.infer<
  typeof delayedEffectFailureBehaviorSchema
>;
export type CharacterAvailability = z.infer<typeof characterAvailabilitySchema>;
export type Difficulty = z.infer<typeof difficultySchema>;
