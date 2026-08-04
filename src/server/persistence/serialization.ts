import "server-only";

import { z } from "zod";

import {
  authoritativeSaveSchema,
  familyIdentitySchema,
  parseMoneyMinor,
  publicSaveSummarySchema,
  serializeMoneyMinor,
  type AuthoritativeSave,
  type MutationHistoryEntry,
  type PublicSaveSummary,
  type RootGameState,
} from "@/domain";
import type { Database, Json } from "@/lib/supabase/database.types";

import {
  compatibilityFailureSchema,
  repositoryFailure,
  type CompatibilityFailure,
} from "./contracts";

export const SUPPORTED_SAVE_VERSION = "save-1.0.0" as const;
export const SUPPORTED_SCHEMA_VERSION = "schema-1.0.0" as const;
export const SUPPORTED_CONTENT_VERSION = "mvp-0.1.0" as const;

type SaveRow = Database["public"]["Tables"]["saves"]["Row"];
type MutationHistoryRow =
  Database["public"]["Tables"]["mutation_history"]["Row"];

export interface SerializedSavePayload {
  readonly save_id: string;
  readonly save_version: typeof SUPPORTED_SAVE_VERSION;
  readonly content_version: typeof SUPPORTED_CONTENT_VERSION;
  readonly schema_version: typeof SUPPORTED_SCHEMA_VERSION;
  readonly revision: number;
  readonly game_seed: string;
  readonly political_period: number;
  readonly selected_background: SaveRow["selected_background"];
  readonly family_identity: Json;
  readonly authoritative_state: Json;
  readonly created_at: string;
  readonly updated_at: string;
}

const MONEY_FIELDS = [
  "treasuryMinor",
  "monthlyRevenueMinor",
  "monthlyExpenditureMinor",
  "monthlyDebtServiceMinor",
  "arrearsMinor",
  "plannedArrearsPaymentMinor",
  "periodFinancingInflowsMinor",
  "periodProjectOutflowsMinor",
] as const;

const jsonSchema: z.ZodType<Json> = z.lazy(() =>
  z.union([
    z.string(),
    z.number().finite(),
    z.boolean(),
    z.null(),
    z.array(jsonSchema),
    z.record(z.string(), jsonSchema),
  ]),
);

function canonicalTimestamp(value: string): string {
  const milliseconds = Date.parse(value);
  if (!Number.isFinite(milliseconds)) throw new Error("Invalid timestamp.");
  return new Date(milliseconds).toISOString();
}

function asRecord(value: unknown): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error("Expected a JSON object.");
  }
  return { ...value };
}

function serializeState(state: RootGameState): Json {
  const parsed = authoritativeSaveSchema.shape.authoritativeState.parse(state);
  const economy: Record<string, unknown> = { ...parsed.economy };
  for (const field of MONEY_FIELDS) {
    economy[field] = serializeMoneyMinor(parsed.economy[field]);
  }
  return jsonSchema.parse({
    ...parsed,
    economy,
  });
}

function deserializeState(value: Json): RootGameState {
  const root = asRecord(value);
  const economy = asRecord(root.economy);
  for (const field of MONEY_FIELDS) {
    const encoded = economy[field];
    if (typeof encoded !== "string") {
      throw new Error(`Malformed MoneyMinor encoding at economy.${field}.`);
    }
    economy[field] = parseMoneyMinor(encoded);
  }
  root.economy = economy;
  return authoritativeSaveSchema.shape.authoritativeState.parse(root);
}

function checkSupportedVersions(row: SaveRow): CompatibilityFailure | null {
  if (row.save_version !== SUPPORTED_SAVE_VERSION) {
    return compatibilityFailureSchema.parse(
      repositoryFailure("unsupported_save_version"),
    );
  }
  if (row.schema_version !== SUPPORTED_SCHEMA_VERSION) {
    return compatibilityFailureSchema.parse(
      repositoryFailure("unsupported_schema_version"),
    );
  }
  if (row.content_version !== SUPPORTED_CONTENT_VERSION) {
    return compatibilityFailureSchema.parse(
      repositoryFailure("unsupported_content_version"),
    );
  }
  return null;
}

export function serializeAuthoritativeSave(
  input: unknown,
): SerializedSavePayload {
  const save = authoritativeSaveSchema.parse(input);
  if (
    save.saveVersion !== SUPPORTED_SAVE_VERSION ||
    save.schemaVersion !== SUPPORTED_SCHEMA_VERSION ||
    save.contentVersion !== SUPPORTED_CONTENT_VERSION
  ) {
    throw new Error("Unsupported save compatibility versions.");
  }
  return {
    save_id: save.saveId,
    save_version: SUPPORTED_SAVE_VERSION,
    content_version: SUPPORTED_CONTENT_VERSION,
    schema_version: SUPPORTED_SCHEMA_VERSION,
    revision: save.revision,
    game_seed: save.gameSeed,
    political_period: save.politicalPeriod,
    selected_background: save.selectedBackground,
    family_identity: jsonSchema.parse(save.familyIdentity),
    authoritative_state: serializeState(save.authoritativeState),
    created_at: save.createdAt,
    updated_at: save.updatedAt,
  };
}

export type DeserializeSaveResult =
  | { readonly success: true; readonly save: AuthoritativeSave }
  | { readonly success: false; readonly failure: CompatibilityFailure };

export function deserializeAuthoritativeSave(
  row: SaveRow,
): DeserializeSaveResult {
  const versionFailure = checkSupportedVersions(row);
  if (versionFailure !== null)
    return { success: false, failure: versionFailure };
  try {
    const save = authoritativeSaveSchema.parse({
      saveId: row.save_id,
      ownerId: row.owner_id,
      saveVersion: row.save_version,
      contentVersion: row.content_version,
      schemaVersion: row.schema_version,
      revision: row.revision,
      gameSeed: row.game_seed,
      politicalPeriod: row.political_period,
      selectedBackground: row.selected_background,
      familyIdentity: familyIdentitySchema.parse(row.family_identity),
      authoritativeState: deserializeState(row.authoritative_state),
      createdAt: canonicalTimestamp(row.created_at),
      updatedAt: canonicalTimestamp(row.updated_at),
    });
    return { success: true, save };
  } catch {
    return {
      success: false,
      failure: compatibilityFailureSchema.parse(
        repositoryFailure("corrupted_save"),
      ),
    };
  }
}

function presidentDisplayName(save: AuthoritativeSave): string {
  const president = save.familyIdentity.president;
  switch (president.publicNamePreference) {
    case "first_name":
      return president.firstName;
    case "title_and_last_name":
      return `President ${president.lastName}`;
    case "full_name":
    case undefined:
      return `${president.firstName} ${president.lastName}`;
  }
}

export function projectPublicSaveSummary(
  save: AuthoritativeSave,
): PublicSaveSummary {
  return publicSaveSummarySchema.parse({
    saveId: save.saveId,
    saveVersion: save.saveVersion,
    contentVersion: save.contentVersion,
    schemaVersion: save.schemaVersion,
    revision: save.revision,
    politicalPeriod: save.politicalPeriod,
    selectedBackground: save.selectedBackground,
    presidentDisplayName: presidentDisplayName(save),
    createdAt: save.createdAt,
    updatedAt: save.updatedAt,
  });
}

export function deserializeMutationReceipt(
  row: MutationHistoryRow,
): MutationHistoryEntry {
  const eventHistory =
    authoritativeSaveSchema.shape.authoritativeState.shape.eventHistory;
  const parsed = eventHistory.element.parse(row.receipt_body);
  if (
    parsed.idempotencyKey !== row.idempotency_key ||
    parsed.type !== row.mutation_type ||
    parsed.expectedRevision !== row.expected_revision ||
    parsed.resultingRevision !== row.resulting_revision
  ) {
    throw new Error("Mutation receipt metadata mismatch.");
  }
  return parsed;
}

export function serializeMutationReceipt(receipt: MutationHistoryEntry): Json {
  return jsonSchema.parse(receipt);
}
