import "server-only";

import { Pool, type PoolClient } from "pg";

import { userIdSchema } from "@/domain";
import type { Database } from "@/lib/supabase/database.types";
import { getDatabaseEnvironment } from "@/server/env";

import type { SerializedSavePayload } from "./serialization";

export type SaveRow = Database["public"]["Tables"]["saves"]["Row"];
export type MutationHistoryRow =
  Database["public"]["Tables"]["mutation_history"]["Row"];

type RawSaveRow = Omit<SaveRow, "revision" | "created_at" | "updated_at"> & {
  readonly revision: number | string;
  readonly created_at: Date | string;
  readonly updated_at: Date | string;
};

type RawMutationHistoryRow = Omit<
  MutationHistoryRow,
  "expected_revision" | "resulting_revision" | "occurred_at" | "created_at"
> & {
  readonly expected_revision: number | string;
  readonly resulting_revision: number | string;
  readonly occurred_at: Date | string;
  readonly created_at: Date | string;
};

export type MutationPersistenceDecision<TResult> =
  | { readonly kind: "return"; readonly result: TResult }
  | {
      readonly kind: "commit";
      readonly save: SerializedSavePayload;
      readonly receipt: MutationHistoryRow;
      readonly result: TResult;
    };

export interface PersistenceGateway {
  createOwnedSave(
    actorId: string,
    payload: SerializedSavePayload,
  ): Promise<SaveRow>;
  readOwnedSave(actorId: string, saveId: string): Promise<SaveRow | null>;
  listOwnedSaves(actorId: string): Promise<readonly SaveRow[]>;
  deleteOwnedSave(actorId: string, saveId: string): Promise<boolean>;
  withLockedOwnedSave<TResult>(
    actorId: string,
    saveId: string,
    idempotencyKey: string,
    decide: (
      save: SaveRow | null,
      receipt: MutationHistoryRow | null,
    ) => Promise<MutationPersistenceDecision<TResult>>,
  ): Promise<TResult>;
}

let sharedPool: Pool | undefined;

function safeInteger(value: number | string): number {
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isSafeInteger(parsed)) {
    throw new RangeError("Database integer exceeds the safe range.");
  }
  return parsed;
}

function timestamp(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : value;
}

export function normalizeSaveRow(row: RawSaveRow): SaveRow {
  return {
    ...row,
    revision: safeInteger(row.revision),
    created_at: timestamp(row.created_at),
    updated_at: timestamp(row.updated_at),
  };
}

function normalizeMutationHistoryRow(
  row: RawMutationHistoryRow,
): MutationHistoryRow {
  return {
    ...row,
    expected_revision: safeInteger(row.expected_revision),
    resulting_revision: safeInteger(row.resulting_revision),
    occurred_at: timestamp(row.occurred_at),
    created_at: timestamp(row.created_at),
  };
}

export function getPersistencePool(): Pool {
  if (sharedPool === undefined) {
    const { SUPABASE_DATABASE_URL } = getDatabaseEnvironment();
    sharedPool = new Pool({
      connectionString: SUPABASE_DATABASE_URL,
      max: 5,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 10_000,
    });
  }
  return sharedPool;
}

async function setAuthenticatedActor(
  client: PoolClient,
  actorId: string,
): Promise<void> {
  const userId = userIdSchema.parse(actorId);
  await client.query("select set_config('request.jwt.claims', $1, true)", [
    JSON.stringify({ sub: userId, role: "authenticated" }),
  ]);
  await client.query("set local role authenticated");
}

async function withActorTransaction<TResult>(
  pool: Pool,
  actorId: string,
  operation: (client: PoolClient) => Promise<TResult>,
): Promise<TResult> {
  const client = await pool.connect();
  try {
    await client.query("begin");
    await setAuthenticatedActor(client, actorId);
    const result = await operation(client);
    await client.query("commit");
    return result;
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release();
  }
}

export function createPostgresPersistenceGateway(
  pool: Pool = getPersistencePool(),
): PersistenceGateway {
  return {
    async createOwnedSave(actorId, payload) {
      return withActorTransaction(pool, actorId, async (client) => {
        const result = await client.query<RawSaveRow>(
          `select * from mandate_private.create_owned_save(
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12
          )`,
          [
            payload.save_id,
            payload.save_version,
            payload.content_version,
            payload.schema_version,
            payload.revision,
            payload.game_seed,
            payload.political_period,
            payload.selected_background,
            payload.family_identity,
            payload.authoritative_state,
            payload.created_at,
            payload.updated_at,
          ],
        );
        const row = result.rows[0];
        if (row === undefined) throw new Error("Save insert returned no row.");
        return normalizeSaveRow(row);
      });
    },

    async readOwnedSave(actorId, saveId) {
      return withActorTransaction(pool, actorId, async (client) => {
        const result = await client.query<RawSaveRow>(
          "select * from mandate_private.read_owned_save($1)",
          [saveId],
        );
        const row = result.rows[0];
        return row === undefined ? null : normalizeSaveRow(row);
      });
    },

    async listOwnedSaves(actorId) {
      return withActorTransaction(pool, actorId, async (client) => {
        const result = await client.query<RawSaveRow>(
          "select * from mandate_private.list_owned_saves()",
        );
        return result.rows.map(normalizeSaveRow);
      });
    },

    async deleteOwnedSave(actorId, saveId) {
      return withActorTransaction(pool, actorId, async (client) => {
        const result = await client.query<{ readonly deleted: boolean }>(
          "select mandate_private.delete_owned_save($1) as deleted",
          [saveId],
        );
        return result.rows[0]?.deleted === true;
      });
    },

    async withLockedOwnedSave(actorId, saveId, idempotencyKey, decide) {
      return withActorTransaction(pool, actorId, async (client) => {
        const saveResult = await client.query<RawSaveRow>(
          "select * from mandate_private.lock_owned_save_for_mutation($1)",
          [saveId],
        );
        const rawSave = saveResult.rows[0];
        const save = rawSave === undefined ? null : normalizeSaveRow(rawSave);
        let receipt: MutationHistoryRow | null = null;
        if (save !== null) {
          const receiptResult = await client.query<RawMutationHistoryRow>(
            "select * from mandate_private.read_owned_mutation_receipt($1, $2)",
            [saveId, idempotencyKey],
          );
          const rawReceipt = receiptResult.rows[0];
          receipt =
            rawReceipt === undefined
              ? null
              : normalizeMutationHistoryRow(rawReceipt);
        }
        const decision = await decide(save, receipt);
        if (decision.kind === "return") return decision.result;

        await client.query(
          `select mandate_private.commit_owned_mutation(
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12
          )`,
          [
            saveId,
            decision.receipt.expected_revision,
            decision.receipt.resulting_revision,
            decision.save.political_period,
            decision.save.selected_background,
            decision.save.family_identity,
            decision.save.authoritative_state,
            decision.save.updated_at,
            decision.receipt.idempotency_key,
            decision.receipt.mutation_type,
            decision.receipt.occurred_at,
            decision.receipt.receipt_body,
          ],
        );
        return decision.result;
      });
    },
  };
}
