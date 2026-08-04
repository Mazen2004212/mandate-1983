import "server-only";

import { z } from "zod";

import {
  choiceIdSchema,
  idempotencyKeySchema,
  politicalPeriodSchema,
  publicSaveSummarySchema,
  revisionSchema,
  saveIdSchema,
  scenarioIdSchema,
  utcTimestampSchema,
} from "@/domain";

export const repositoryFailureCodeSchema = z.enum([
  "unauthenticated",
  "not_found",
  "duplicate_save_id",
  "unsupported_save_version",
  "unsupported_schema_version",
  "unsupported_content_version",
  "corrupted_save",
  "revision_conflict",
  "idempotency_conflict",
  "mutation_rejected",
  "persistence_error",
]);

export const repositoryFailureSchema = z
  .object({
    status: z.literal("failure"),
    code: repositoryFailureCodeSchema,
    message: z.string().min(1).max(240),
  })
  .strict();

export const compatibilityFailureSchema = repositoryFailureSchema.extend({
  code: z.enum([
    "unsupported_save_version",
    "unsupported_schema_version",
    "unsupported_content_version",
    "corrupted_save",
  ]),
});

export const safeSaveResponseSchema = z
  .object({
    status: z.enum(["created", "loaded"]),
    summary: publicSaveSummarySchema,
  })
  .strict();

export const safeSaveListResponseSchema = z
  .object({
    status: z.literal("listed"),
    saves: z.array(publicSaveSummarySchema),
  })
  .strict();

export const safeDeleteResponseSchema = z
  .object({
    status: z.literal("deleted"),
    saveId: saveIdSchema,
  })
  .strict();

export const safeChoiceReceiptSchema = z
  .object({
    type: z.literal("choice_resolution"),
    idempotencyKey: idempotencyKeySchema,
    scenarioId: scenarioIdSchema,
    choiceId: choiceIdSchema,
    expectedRevision: revisionSchema,
    resultingRevision: revisionSchema,
    politicalPeriod: politicalPeriodSchema,
    occurredAt: utcTimestampSchema,
  })
  .strict();

export const safePeriodReceiptSchema = z
  .object({
    type: z.literal("period_advance"),
    idempotencyKey: idempotencyKeySchema,
    expectedRevision: revisionSchema,
    resultingRevision: revisionSchema,
    fromPeriod: politicalPeriodSchema,
    toPeriod: politicalPeriodSchema,
    occurredAt: utcTimestampSchema,
  })
  .strict();

export const safeMutationReceiptSchema = z.discriminatedUnion("type", [
  safeChoiceReceiptSchema,
  safePeriodReceiptSchema,
]);

export const safeMutationResponseSchema = z
  .object({
    status: z.enum(["applied", "already_applied"]),
    saveId: saveIdSchema,
    receipt: safeMutationReceiptSchema,
  })
  .strict();

export const resolveChoiceForSaveInputSchema = z
  .object({
    saveId: saveIdSchema,
    scenarioId: scenarioIdSchema,
    choiceId: choiceIdSchema,
    expectedRevision: revisionSchema,
    idempotencyKey: idempotencyKeySchema,
    resolvedAt: utcTimestampSchema,
  })
  .strict();

export const advanceSavePeriodInputSchema = z
  .object({
    saveId: saveIdSchema,
    expectedRevision: revisionSchema,
    idempotencyKey: idempotencyKeySchema,
    targetPeriod: politicalPeriodSchema,
    advancedAt: utcTimestampSchema,
  })
  .strict();

export type RepositoryFailure = z.infer<typeof repositoryFailureSchema>;
export type RepositoryFailureCode = z.infer<typeof repositoryFailureCodeSchema>;
export type CompatibilityFailure = z.infer<typeof compatibilityFailureSchema>;
export type SafeSaveResponse = z.infer<typeof safeSaveResponseSchema>;
export type SafeSaveListResponse = z.infer<typeof safeSaveListResponseSchema>;
export type SafeDeleteResponse = z.infer<typeof safeDeleteResponseSchema>;
export type SafeMutationReceipt = z.infer<typeof safeMutationReceiptSchema>;
export type SafeMutationResponse = z.infer<typeof safeMutationResponseSchema>;
export type ResolveChoiceForSaveInput = z.infer<
  typeof resolveChoiceForSaveInputSchema
>;
export type AdvanceSavePeriodInput = z.infer<
  typeof advanceSavePeriodInputSchema
>;

export type SaveOperationResult = SafeSaveResponse | RepositoryFailure;
export type SaveListResult = SafeSaveListResponse | RepositoryFailure;
export type DeleteSaveResult = SafeDeleteResponse | RepositoryFailure;
export type PersistedMutationResult = SafeMutationResponse | RepositoryFailure;

export function repositoryFailure(
  code: RepositoryFailureCode,
): RepositoryFailure {
  const messages: Record<RepositoryFailureCode, string> = {
    unauthenticated: "Sign in before accessing a save.",
    not_found: "The requested save is not available.",
    duplicate_save_id: "That save could not be created.",
    unsupported_save_version:
      "This save version is not supported by the current game.",
    unsupported_schema_version:
      "This save schema is not supported by the current game.",
    unsupported_content_version:
      "This save content version is not supported by the current game.",
    corrupted_save: "This save cannot be loaded safely.",
    revision_conflict:
      "This save changed before the request could be applied. Reload and try again.",
    idempotency_conflict:
      "This request identifier was already used for a different action.",
    mutation_rejected: "The request could not be applied safely.",
    persistence_error: "The save service is temporarily unavailable.",
  };
  return repositoryFailureSchema.parse({
    status: "failure",
    code,
    message: messages[code],
  });
}
