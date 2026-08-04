import { z } from "zod";

import {
  choiceIdSchema,
  idempotencyKeySchema,
  politicalPeriodSchema,
  revisionSchema,
  scenarioIdSchema,
  utcTimestampSchema,
} from "../../../domain";
import type { ContentRegistryBundle } from "../../registry";

function isRecord(value: unknown): value is Readonly<Record<string, unknown>> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isDeepFrozen(value: unknown, seen: Set<object>): boolean {
  if (typeof value !== "object" || value === null) return true;
  if (seen.has(value)) return true;
  if (!Object.isFrozen(value)) return false;
  seen.add(value);
  return Object.values(value).every((nested) => isDeepFrozen(nested, seen));
}

function isRegistry(value: unknown): value is ContentRegistryBundle {
  if (!isRecord(value)) return false;
  const hasRequiredMaps = [
    "scenarios",
    "choices",
    "conditions",
    "effects",
    "delayedEffects",
    "memories",
    "flags",
    "mediaReactions",
  ].every((field) => isRecord(value[field]));
  return hasRequiredMaps && isDeepFrozen(value, new Set<object>());
}

const registrySchema = z.custom<ContentRegistryBundle>(isRegistry, {
  message: "Registry must be a validated immutable content registry.",
});

export const resolveChoiceInputSchema = z
  .object({
    save: z.unknown(),
    registry: registrySchema,
    scenarioId: scenarioIdSchema,
    choiceId: choiceIdSchema,
    expectedRevision: revisionSchema,
    idempotencyKey: idempotencyKeySchema,
    resolvedAt: utcTimestampSchema,
  })
  .strict();

export const advancePeriodInputSchema = z
  .object({
    save: z.unknown(),
    registry: registrySchema,
    expectedRevision: revisionSchema,
    idempotencyKey: idempotencyKeySchema,
    targetPeriod: politicalPeriodSchema,
    advancedAt: utcTimestampSchema,
  })
  .strict();

export type ResolveChoiceInput = z.infer<typeof resolveChoiceInputSchema>;
export type AdvancePeriodInput = z.infer<typeof advancePeriodInputSchema>;
