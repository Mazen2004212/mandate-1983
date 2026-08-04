import "server-only";

import {
  authoritativeSaveSchema,
  saveIdSchema,
  userIdSchema,
  type AuthoritativeSave,
  type MutationHistoryEntry,
} from "@/domain";
import type { ContentRegistryBundle } from "@/content/registry";
import { advancePeriod, resolveChoice } from "@/content/runtime/mutation";
import {
  matchesChoiceRequestIdentity,
  matchesPeriodRequestIdentity,
} from "@/content/runtime/mutation/history";
import { createSupabaseServerClient } from "@/server/supabase/server-client";

import {
  advanceSavePeriodInputSchema,
  repositoryFailure,
  resolveChoiceForSaveInputSchema,
  safeDeleteResponseSchema,
  safeMutationResponseSchema,
  safeSaveListResponseSchema,
  safeSaveResponseSchema,
  type DeleteSaveResult,
  type PersistedMutationResult,
  type RepositoryFailure,
  type SaveListResult,
  type SaveOperationResult,
} from "./contracts";
import {
  createPostgresPersistenceGateway,
  type MutationHistoryRow,
  type PersistenceGateway,
} from "./postgres-gateway";
import {
  deserializeAuthoritativeSave,
  deserializeMutationReceipt,
  projectPublicSaveSummary,
  serializeAuthoritativeSave,
  serializeMutationReceipt,
  SUPPORTED_CONTENT_VERSION,
  SUPPORTED_SAVE_VERSION,
  SUPPORTED_SCHEMA_VERSION,
} from "./serialization";

interface AuthenticatedUser {
  readonly id: string;
}

export interface RequestScopedAuthClient {
  readonly auth: {
    getUser(): Promise<{
      readonly data: { readonly user: AuthenticatedUser | null };
      readonly error: unknown;
    }>;
  };
}

export interface SaveRepositoryDependencies {
  readonly authClient: RequestScopedAuthClient;
  readonly persistence: PersistenceGateway;
  readonly registry: ContentRegistryBundle;
}

export interface SaveRepository {
  createSave(input: unknown): Promise<SaveOperationResult>;
  getSaveById(saveId: unknown): Promise<SaveOperationResult>;
  listSaveSummaries(): Promise<SaveListResult>;
  deleteSave(saveId: unknown): Promise<DeleteSaveResult>;
  resolveChoiceForSave(input: unknown): Promise<PersistedMutationResult>;
  advanceSavePeriod(input: unknown): Promise<PersistedMutationResult>;
}

function databaseErrorCode(error: unknown): string | null {
  if (typeof error !== "object" || error === null || !("code" in error)) {
    return null;
  }
  return typeof error.code === "string" ? error.code : null;
}

async function authenticatedActor(
  authClient: RequestScopedAuthClient,
): Promise<string | RepositoryFailure> {
  try {
    const { data, error } = await authClient.auth.getUser();
    if (error !== null || data.user === null) {
      return repositoryFailure("unauthenticated");
    }
    const parsed = userIdSchema.safeParse(data.user.id);
    return parsed.success ? parsed.data : repositoryFailure("unauthenticated");
  } catch {
    return repositoryFailure("unauthenticated");
  }
}

function isFailure(
  value: string | RepositoryFailure,
): value is RepositoryFailure {
  return typeof value !== "string";
}

function safeReceipt(receipt: MutationHistoryEntry) {
  if (receipt.type === "choice_resolution") {
    return {
      type: receipt.type,
      idempotencyKey: receipt.idempotencyKey,
      scenarioId: receipt.scenarioId,
      choiceId: receipt.choiceId,
      expectedRevision: receipt.expectedRevision,
      resultingRevision: receipt.resultingRevision,
      politicalPeriod: receipt.politicalPeriod,
      occurredAt: receipt.resolvedAt,
    } as const;
  }
  return {
    type: receipt.type,
    idempotencyKey: receipt.idempotencyKey,
    expectedRevision: receipt.expectedRevision,
    resultingRevision: receipt.resultingRevision,
    fromPeriod: receipt.fromPeriod,
    toPeriod: receipt.toPeriod,
    occurredAt: receipt.advancedAt,
  } as const;
}

function safeMutationResult(
  status: "applied" | "already_applied",
  saveId: string,
  receipt: MutationHistoryEntry,
): PersistedMutationResult {
  return safeMutationResponseSchema.parse({
    status,
    saveId,
    receipt: safeReceipt(receipt),
  });
}

function historyRowsAgree(
  save: AuthoritativeSave,
  persisted: MutationHistoryEntry,
): boolean {
  const embedded = save.authoritativeState.eventHistory.find(
    (entry) => entry.idempotencyKey === persisted.idempotencyKey,
  );
  return (
    embedded !== undefined &&
    JSON.stringify(embedded) === JSON.stringify(persisted)
  );
}

function mutationRow(
  saveId: string,
  receipt: MutationHistoryEntry,
): MutationHistoryRow {
  return {
    save_id: saveId,
    idempotency_key: receipt.idempotencyKey,
    mutation_type: receipt.type,
    expected_revision: receipt.expectedRevision,
    resulting_revision: receipt.resultingRevision,
    occurred_at:
      receipt.type === "choice_resolution"
        ? receipt.resolvedAt
        : receipt.advancedAt,
    receipt_body: serializeMutationReceipt(receipt),
    created_at:
      receipt.type === "choice_resolution"
        ? receipt.resolvedAt
        : receipt.advancedAt,
  };
}

function mutationFailureProjection(code: string): RepositoryFailure {
  if (code === "revision_conflict") return repositoryFailure(code);
  if (code === "idempotency_conflict") return repositoryFailure(code);
  return repositoryFailure("mutation_rejected");
}

function persistedReceiptOrFailure(
  row: MutationHistoryRow,
  save: AuthoritativeSave,
): MutationHistoryEntry | RepositoryFailure {
  try {
    const receipt = deserializeMutationReceipt(row);
    return historyRowsAgree(save, receipt)
      ? receipt
      : repositoryFailure("corrupted_save");
  } catch {
    return repositoryFailure("corrupted_save");
  }
}

export function createSaveRepository(
  dependencies: SaveRepositoryDependencies,
): SaveRepository {
  const { authClient, persistence, registry } = dependencies;

  return {
    async createSave(input) {
      const actor = await authenticatedActor(authClient);
      if (isFailure(actor)) return actor;
      const parsed = authoritativeSaveSchema.safeParse(input);
      if (!parsed.success) return repositoryFailure("corrupted_save");
      if (parsed.data.saveVersion !== SUPPORTED_SAVE_VERSION) {
        return repositoryFailure("unsupported_save_version");
      }
      if (parsed.data.schemaVersion !== SUPPORTED_SCHEMA_VERSION) {
        return repositoryFailure("unsupported_schema_version");
      }
      if (parsed.data.contentVersion !== SUPPORTED_CONTENT_VERSION) {
        return repositoryFailure("unsupported_content_version");
      }
      const owned = authoritativeSaveSchema.parse({
        ...parsed.data,
        ownerId: actor,
      });
      try {
        const row = await persistence.createOwnedSave(
          actor,
          serializeAuthoritativeSave(owned),
        );
        const loaded = deserializeAuthoritativeSave(row);
        if (!loaded.success) return loaded.failure;
        return safeSaveResponseSchema.parse({
          status: "created",
          summary: projectPublicSaveSummary(loaded.save),
        });
      } catch (error) {
        return databaseErrorCode(error) === "23505"
          ? repositoryFailure("duplicate_save_id")
          : repositoryFailure("persistence_error");
      }
    },

    async getSaveById(input) {
      const actor = await authenticatedActor(authClient);
      if (isFailure(actor)) return actor;
      const saveId = saveIdSchema.safeParse(input);
      if (!saveId.success) return repositoryFailure("not_found");
      try {
        const row = await persistence.readOwnedSave(actor, saveId.data);
        if (row === null) return repositoryFailure("not_found");
        const loaded = deserializeAuthoritativeSave(row);
        if (!loaded.success) return loaded.failure;
        return safeSaveResponseSchema.parse({
          status: "loaded",
          summary: projectPublicSaveSummary(loaded.save),
        });
      } catch {
        return repositoryFailure("persistence_error");
      }
    },

    async listSaveSummaries() {
      const actor = await authenticatedActor(authClient);
      if (isFailure(actor)) return actor;
      try {
        const rows = await persistence.listOwnedSaves(actor);
        const summaries = [];
        for (const row of rows) {
          const loaded = deserializeAuthoritativeSave(row);
          if (!loaded.success) return loaded.failure;
          summaries.push(projectPublicSaveSummary(loaded.save));
        }
        return safeSaveListResponseSchema.parse({
          status: "listed",
          saves: summaries,
        });
      } catch {
        return repositoryFailure("persistence_error");
      }
    },

    async deleteSave(input) {
      const actor = await authenticatedActor(authClient);
      if (isFailure(actor)) return actor;
      const saveId = saveIdSchema.safeParse(input);
      if (!saveId.success) return repositoryFailure("not_found");
      try {
        const deleted = await persistence.deleteOwnedSave(actor, saveId.data);
        return deleted
          ? safeDeleteResponseSchema.parse({
              status: "deleted",
              saveId: saveId.data,
            })
          : repositoryFailure("not_found");
      } catch {
        return repositoryFailure("persistence_error");
      }
    },

    async resolveChoiceForSave(input) {
      const actor = await authenticatedActor(authClient);
      if (isFailure(actor)) return actor;
      const request = resolveChoiceForSaveInputSchema.safeParse(input);
      if (!request.success) return repositoryFailure("mutation_rejected");
      try {
        return await persistence.withLockedOwnedSave(
          actor,
          request.data.saveId,
          request.data.idempotencyKey,
          async (row, receiptRow) => {
            if (row === null) {
              return { kind: "return", result: repositoryFailure("not_found") };
            }
            const loaded = deserializeAuthoritativeSave(row);
            if (!loaded.success) {
              return { kind: "return", result: loaded.failure };
            }
            if (receiptRow !== null) {
              const receipt = persistedReceiptOrFailure(
                receiptRow,
                loaded.save,
              );
              if ("status" in receipt) {
                return { kind: "return", result: receipt };
              }
              if (matchesChoiceRequestIdentity(receipt, request.data)) {
                return {
                  kind: "return",
                  result: safeMutationResult(
                    "already_applied",
                    request.data.saveId,
                    receipt,
                  ),
                };
              }
              return {
                kind: "return",
                result: repositoryFailure("idempotency_conflict"),
              };
            }
            if (
              loaded.save.authoritativeState.eventHistory.some(
                (entry) => entry.idempotencyKey === request.data.idempotencyKey,
              )
            ) {
              return {
                kind: "return",
                result: repositoryFailure("corrupted_save"),
              };
            }
            const mutation = resolveChoice({
              save: loaded.save,
              registry,
              scenarioId: request.data.scenarioId,
              choiceId: request.data.choiceId,
              expectedRevision: request.data.expectedRevision,
              idempotencyKey: request.data.idempotencyKey,
              resolvedAt: request.data.resolvedAt,
            });
            if (mutation.status === "failure") {
              return {
                kind: "return",
                result: mutationFailureProjection(mutation.code),
              };
            }
            if (mutation.status !== "applied") {
              return {
                kind: "return",
                result: repositoryFailure("corrupted_save"),
              };
            }
            return {
              kind: "commit",
              save: serializeAuthoritativeSave(mutation.save),
              receipt: mutationRow(request.data.saveId, mutation.receipt),
              result: safeMutationResult(
                "applied",
                request.data.saveId,
                mutation.receipt,
              ),
            };
          },
        );
      } catch (error) {
        return databaseErrorCode(error) === "40001"
          ? repositoryFailure("revision_conflict")
          : repositoryFailure("persistence_error");
      }
    },

    async advanceSavePeriod(input) {
      const actor = await authenticatedActor(authClient);
      if (isFailure(actor)) return actor;
      const request = advanceSavePeriodInputSchema.safeParse(input);
      if (!request.success) return repositoryFailure("mutation_rejected");
      try {
        return await persistence.withLockedOwnedSave(
          actor,
          request.data.saveId,
          request.data.idempotencyKey,
          async (row, receiptRow) => {
            if (row === null) {
              return { kind: "return", result: repositoryFailure("not_found") };
            }
            const loaded = deserializeAuthoritativeSave(row);
            if (!loaded.success) {
              return { kind: "return", result: loaded.failure };
            }
            if (receiptRow !== null) {
              const receipt = persistedReceiptOrFailure(
                receiptRow,
                loaded.save,
              );
              if ("status" in receipt) {
                return { kind: "return", result: receipt };
              }
              if (matchesPeriodRequestIdentity(receipt, request.data)) {
                return {
                  kind: "return",
                  result: safeMutationResult(
                    "already_applied",
                    request.data.saveId,
                    receipt,
                  ),
                };
              }
              return {
                kind: "return",
                result: repositoryFailure("idempotency_conflict"),
              };
            }
            if (
              loaded.save.authoritativeState.eventHistory.some(
                (entry) => entry.idempotencyKey === request.data.idempotencyKey,
              )
            ) {
              return {
                kind: "return",
                result: repositoryFailure("corrupted_save"),
              };
            }
            const mutation = advancePeriod({
              save: loaded.save,
              registry,
              expectedRevision: request.data.expectedRevision,
              idempotencyKey: request.data.idempotencyKey,
              targetPeriod: request.data.targetPeriod,
              advancedAt: request.data.advancedAt,
            });
            if (mutation.status === "failure") {
              return {
                kind: "return",
                result: mutationFailureProjection(mutation.code),
              };
            }
            if (mutation.status !== "applied") {
              return {
                kind: "return",
                result: repositoryFailure("corrupted_save"),
              };
            }
            return {
              kind: "commit",
              save: serializeAuthoritativeSave(mutation.save),
              receipt: mutationRow(request.data.saveId, mutation.receipt),
              result: safeMutationResult(
                "applied",
                request.data.saveId,
                mutation.receipt,
              ),
            };
          },
        );
      } catch (error) {
        return databaseErrorCode(error) === "40001"
          ? repositoryFailure("revision_conflict")
          : repositoryFailure("persistence_error");
      }
    },
  };
}

export async function createServerSaveRepository(
  registry: ContentRegistryBundle,
): Promise<SaveRepository> {
  const authClient = await createSupabaseServerClient();
  return createSaveRepository({
    authClient,
    persistence: createPostgresPersistenceGateway(),
    registry,
  });
}
