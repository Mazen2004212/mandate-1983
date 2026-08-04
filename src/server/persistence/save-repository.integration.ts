import { Pool } from "pg";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { authoritativeSaveSchema } from "@/domain";
import { createValidSaveFixture } from "@/domain/test/fixtures";
import {
  MUTATION_CHOICE_ID,
  MUTATION_SCENARIO_ID,
  mutationRegistry,
  regionBasisPointEffect,
} from "@/content/runtime/mutation/test/fixtures";

import {
  createPostgresPersistenceGateway,
  normalizeSaveRow,
  type SaveRow,
} from "./postgres-gateway";
import {
  createSaveRepository,
  type RequestScopedAuthClient,
  type SaveRepository,
} from "./save-repository";
import { deserializeAuthoritativeSave } from "./serialization";

const USER_A = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const USER_B = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const INPUT_OWNER = "cccccccc-cccc-4ccc-8ccc-cccccccccccc";
const SAVE_A = "11111111-1111-4111-8111-111111111111";
const SAVE_B = "22222222-2222-4222-8222-222222222222";

function authClient(userId: string | null): RequestScopedAuthClient {
  return {
    auth: {
      async getUser() {
        return {
          data: { user: userId === null ? null : { id: userId } },
          error: null,
        };
      },
    },
  };
}

function saveFixture(saveId: string, ownerId = INPUT_OWNER) {
  return authoritativeSaveSchema.parse({
    ...createValidSaveFixture(),
    saveId,
    ownerId,
  });
}

function choiceRequest(
  saveId: string,
  overrides: Readonly<Record<string, unknown>> = {},
) {
  return {
    saveId,
    scenarioId: MUTATION_SCENARIO_ID,
    choiceId: MUTATION_CHOICE_ID,
    expectedRevision: 0,
    idempotencyKey: "repository_choice_001",
    resolvedAt: "1983-01-02T00:00:00.000Z",
    ...overrides,
  };
}

function periodRequest(saveId: string) {
  return {
    saveId,
    expectedRevision: 0,
    idempotencyKey: "repository_period_001",
    targetPeriod: 1,
    advancedAt: "1983-02-01T00:00:00.000Z",
  };
}

describe.sequential("TASK-11 save repository against local PostgreSQL", () => {
  let pool: Pool;
  let repositoryA: SaveRepository;
  let repositoryB: SaveRepository;
  let anonymousRepository: SaveRepository;

  beforeAll(() => {
    const connectionString = process.env.SUPABASE_DATABASE_URL;
    if (connectionString === undefined) {
      throw new Error(
        "SUPABASE_DATABASE_URL is required for repository tests.",
      );
    }
    pool = new Pool({ connectionString, max: 8 });
    const persistence = createPostgresPersistenceGateway(pool);
    const registry = mutationRegistry();
    repositoryA = createSaveRepository({
      authClient: authClient(USER_A),
      persistence,
      registry,
    });
    repositoryB = createSaveRepository({
      authClient: authClient(USER_B),
      persistence,
      registry,
    });
    anonymousRepository = createSaveRepository({
      authClient: authClient(null),
      persistence,
      registry,
    });
  });

  beforeEach(async () => {
    await pool.query("delete from auth.users where id = any($1::uuid[])", [
      [USER_A, USER_B],
    ]);
    await pool.query(
      `insert into auth.users (id, aud, role, email)
       values ($1, 'authenticated', 'authenticated', 'user-a@example.test'),
              ($2, 'authenticated', 'authenticated', 'user-b@example.test')`,
      [USER_A, USER_B],
    );
  });

  afterAll(async () => {
    await pool.query("delete from auth.users where id = any($1::uuid[])", [
      [USER_A, USER_B],
    ]);
    await pool.end();
  });

  it("creates, round-trips, loads, and safely projects an owned save", async () => {
    const created = await repositoryA.createSave(saveFixture(SAVE_A));
    expect(created).toMatchObject({
      status: "created",
      summary: { saveId: SAVE_A },
    });
    expect(created).not.toHaveProperty("authoritativeState");
    expect(created).not.toHaveProperty("gameSeed");

    const stored = await pool.query<SaveRow>(
      "select * from public.saves where save_id = $1",
      [SAVE_A],
    );
    expect(stored.rows[0]?.owner_id).toBe(USER_A);
    expect(JSON.stringify(stored.rows[0]?.authoritative_state)).toContain(
      '"treasuryMinor":"4800000000"',
    );
    const rawStored = stored.rows[0];
    expect(rawStored).toBeDefined();
    if (rawStored === undefined) return;
    const decoded = deserializeAuthoritativeSave(normalizeSaveRow(rawStored));
    expect(decoded.success).toBe(true);
    if (decoded.success) {
      expect(decoded.save.authoritativeState.economy.treasuryMinor).toBe(
        4_800_000_000n,
      );
      expect(decoded.save.ownerId).toBe(USER_A);
    }

    const loaded = await repositoryA.getSaveById(SAVE_A);
    expect(loaded).toMatchObject({
      status: "loaded",
      summary: { saveId: SAVE_A },
    });
  });

  it("denies unauthenticated create and returns a safe duplicate error", async () => {
    await expect(
      anonymousRepository.createSave(saveFixture(SAVE_A)),
    ).resolves.toMatchObject({ code: "unauthenticated" });
    await repositoryA.createSave(saveFixture(SAVE_A));
    const duplicate = await repositoryA.createSave(saveFixture(SAVE_A));
    expect(duplicate).toMatchObject({ code: "duplicate_save_id" });
    expect(JSON.stringify(duplicate)).not.toMatch(
      /duplicate key|public\.saves|row-level|policy|sqlstate/i,
    );
  });

  it("rejects unsupported create versions before persistence", async () => {
    const save = saveFixture(SAVE_A);
    Reflect.set(save, "saveVersion", "save-2.0.0");
    await expect(repositoryA.createSave(save)).resolves.toMatchObject({
      code: "unsupported_save_version",
    });
    const count = await pool.query(
      "select count(*)::integer as count from public.saves",
    );
    expect(count.rows[0]?.count).toBe(0);
  });

  it("does not reveal another user's save through load or delete", async () => {
    await repositoryA.createSave(saveFixture(SAVE_A));
    await expect(repositoryB.getSaveById(SAVE_A)).resolves.toMatchObject({
      code: "not_found",
    });
    await expect(repositoryB.deleteSave(SAVE_A)).resolves.toMatchObject({
      code: "not_found",
    });
    expect(
      await pool.query("select count(*)::integer as count from public.saves"),
    ).toMatchObject({ rows: [{ count: 1 }] });
  });

  it("lists only owned safe summaries in deterministic order", async () => {
    await repositoryA.createSave(saveFixture(SAVE_A));
    const later = saveFixture(SAVE_B);
    const laterTimestamp = "1983-01-03T00:00:00.000Z";
    await repositoryA.createSave({
      ...later,
      createdAt: laterTimestamp,
      updatedAt: laterTimestamp,
    });
    await repositoryB.createSave(
      saveFixture("33333333-3333-4333-8333-333333333333"),
    );

    const listed = await repositoryA.listSaveSummaries();
    expect(listed.status).toBe("listed");
    if (listed.status !== "listed") return;
    expect(listed.saves.map(({ saveId }) => saveId)).toEqual([SAVE_B, SAVE_A]);
    expect(JSON.stringify(listed)).not.toContain("authoritativeState");
    expect(JSON.stringify(listed)).not.toContain("gameSeed");
  });

  it("returns an empty list and explicit missing-save behavior", async () => {
    await expect(repositoryA.listSaveSummaries()).resolves.toEqual({
      status: "listed",
      saves: [],
    });
    await expect(repositoryA.getSaveById(SAVE_A)).resolves.toMatchObject({
      code: "not_found",
    });
    await expect(repositoryA.deleteSave(SAVE_A)).resolves.toMatchObject({
      code: "not_found",
    });
  });

  it("rejects corrupted stored money without silently repairing it", async () => {
    await repositoryA.createSave(saveFixture(SAVE_A));
    await pool.query(
      `update public.saves
       set authoritative_state = jsonb_set(
         authoritative_state,
         '{economy,treasuryMinor}',
         '"01"'::jsonb
       )
       where save_id = $1`,
      [SAVE_A],
    );
    await expect(repositoryA.getSaveById(SAVE_A)).resolves.toMatchObject({
      code: "corrupted_save",
    });
  });

  it("persists a valid choice and its receipt in one revision", async () => {
    await repositoryA.createSave(saveFixture(SAVE_A));
    const result = await repositoryA.resolveChoiceForSave(
      choiceRequest(SAVE_A),
    );
    expect(result).toMatchObject({
      status: "applied",
      receipt: {
        type: "choice_resolution",
        expectedRevision: 0,
        resultingRevision: 1,
      },
    });
    expect(result).not.toHaveProperty("save");
    expect(result).not.toHaveProperty("evidence");

    const stored = await pool.query<
      SaveRow & { readonly receipt_count: number }
    >(
      `select saves.*, (
         select count(*)::integer from public.mutation_history
         where mutation_history.save_id = saves.save_id
       ) as receipt_count
       from public.saves where save_id = $1`,
      [SAVE_A],
    );
    expect(stored.rows[0]).toMatchObject({ revision: "1", receipt_count: 1 });
    const rawStored = stored.rows[0];
    expect(rawStored).toBeDefined();
    if (rawStored === undefined) return;
    const decoded = deserializeAuthoritativeSave(normalizeSaveRow(rawStored));
    expect(decoded.success).toBe(true);
    if (decoded.success) {
      expect(decoded.save.revision).toBe(1);
      expect(decoded.save.authoritativeState.eventHistory).toHaveLength(1);
      expect(authoritativeSaveSchema.safeParse(decoded.save).success).toBe(
        true,
      );
    }
  });

  it("returns an exact persisted replay without another write", async () => {
    await repositoryA.createSave(saveFixture(SAVE_A));
    const request = choiceRequest(SAVE_A);
    const first = await repositoryA.resolveChoiceForSave(request);
    const before = await pool.query(
      "select revision, updated_at from public.saves where save_id = $1",
      [SAVE_A],
    );
    const retry = await repositoryA.resolveChoiceForSave(request);
    const after = await pool.query(
      `select saves.revision, saves.updated_at,
        (select count(*)::integer from public.mutation_history
         where save_id = $1) as receipt_count
       from public.saves as saves where saves.save_id = $1`,
      [SAVE_A],
    );
    expect(first.status).toBe("applied");
    expect(retry).toMatchObject({ status: "already_applied" });
    expect(
      retry.status === "already_applied" && first.status === "applied"
        ? retry.receipt
        : null,
    ).toEqual(first.status === "applied" ? first.receipt : null);
    expect(after.rows[0]).toMatchObject({ revision: "1", receipt_count: 1 });
    expect(after.rows[0]?.updated_at).toEqual(before.rows[0]?.updated_at);
  });

  it("rejects conflicting key reuse before stale revision handling", async () => {
    await repositoryA.createSave(saveFixture(SAVE_A));
    await repositoryA.resolveChoiceForSave(choiceRequest(SAVE_A));
    const conflict = await repositoryA.resolveChoiceForSave(
      choiceRequest(SAVE_A, {
        expectedRevision: 99,
        resolvedAt: "1983-01-03T00:00:00.000Z",
      }),
    );
    expect(conflict).toMatchObject({ code: "idempotency_conflict" });
  });

  it("rejects a stale revision without changing save or history", async () => {
    await repositoryA.createSave(saveFixture(SAVE_A));
    const stale = await repositoryA.resolveChoiceForSave(
      choiceRequest(SAVE_A, {
        expectedRevision: 1,
        idempotencyKey: "repository_stale_001",
      }),
    );
    expect(stale).toMatchObject({ code: "revision_conflict" });
    const evidence = await pool.query(
      `select saves.revision,
        (select count(*)::integer from public.mutation_history
         where save_id = $1) as receipt_count
       from public.saves as saves where saves.save_id = $1`,
      [SAVE_A],
    );
    expect(evidence.rows[0]).toMatchObject({ revision: "0", receipt_count: 0 });
  });

  it("allows only one of two different same-revision requests to commit", async () => {
    await repositoryA.createSave(saveFixture(SAVE_A));
    const [left, right] = await Promise.all([
      repositoryA.resolveChoiceForSave(
        choiceRequest(SAVE_A, { idempotencyKey: "concurrent_left" }),
      ),
      repositoryA.resolveChoiceForSave(
        choiceRequest(SAVE_A, {
          idempotencyKey: "concurrent_right",
          resolvedAt: "1983-01-03T00:00:00.000Z",
        }),
      ),
    ]);
    expect([left.status, right.status].sort()).toEqual(["applied", "failure"]);
    expect(
      [left, right].find((result) => result.status === "failure"),
    ).toMatchObject({
      code: "revision_conflict",
    });
    const evidence = await pool.query(
      `select saves.revision,
        (select count(*)::integer from public.mutation_history
         where save_id = $1) as receipt_count
       from public.saves as saves where saves.save_id = $1`,
      [SAVE_A],
    );
    expect(evidence.rows[0]).toMatchObject({ revision: "1", receipt_count: 1 });
  });

  it("serializes two concurrent exact retries to one apply and one replay", async () => {
    await repositoryA.createSave(saveFixture(SAVE_A));
    const request = choiceRequest(SAVE_A);
    const results = await Promise.all([
      repositoryA.resolveChoiceForSave(request),
      repositoryA.resolveChoiceForSave(request),
    ]);
    expect(results.map(({ status }) => status).sort()).toEqual([
      "already_applied",
      "applied",
    ]);
    const history = await pool.query(
      "select count(*)::integer as count from public.mutation_history where save_id = $1",
      [SAVE_A],
    );
    expect(history.rows[0]?.count).toBe(1);
  });

  it("persists one-period advancement atomically", async () => {
    await repositoryA.createSave(saveFixture(SAVE_A));
    const result = await repositoryA.advanceSavePeriod(periodRequest(SAVE_A));
    expect(result).toMatchObject({
      status: "applied",
      receipt: { type: "period_advance", fromPeriod: 0, toPeriod: 1 },
    });
    const stored = await pool.query(
      "select revision, political_period from public.saves where save_id = $1",
      [SAVE_A],
    );
    expect(stored.rows[0]).toMatchObject({
      revision: "1",
      political_period: 1,
    });
  });

  it("rolls back an engine failure with no save or history write", async () => {
    const invalidEffect = regionBasisPointEffect("effect_repository_invalid", {
      value: 4_000,
    });
    const failingRepository = createSaveRepository({
      authClient: authClient(USER_A),
      persistence: createPostgresPersistenceGateway(pool),
      registry: mutationRegistry({
        choiceOverrides: { baseEffects: [invalidEffect.id] },
        effects: [invalidEffect],
      }),
    });
    await failingRepository.createSave(saveFixture(SAVE_A));
    await expect(
      failingRepository.resolveChoiceForSave(choiceRequest(SAVE_A)),
    ).resolves.toMatchObject({ code: "mutation_rejected" });
    const stored = await pool.query(
      `select saves.revision,
        (select count(*)::integer from public.mutation_history
         where save_id = $1) as receipt_count
       from public.saves as saves where saves.save_id = $1`,
      [SAVE_A],
    );
    expect(stored.rows[0]).toMatchObject({ revision: "0", receipt_count: 0 });
  });

  it("denies cross-user, anonymous, owner, and calculated-effect mutation input", async () => {
    await repositoryA.createSave(saveFixture(SAVE_A));
    await expect(
      repositoryB.resolveChoiceForSave(choiceRequest(SAVE_A)),
    ).resolves.toMatchObject({ code: "not_found" });
    await expect(
      anonymousRepository.resolveChoiceForSave(choiceRequest(SAVE_A)),
    ).resolves.toMatchObject({ code: "unauthenticated" });
    await expect(
      repositoryA.resolveChoiceForSave({
        ...choiceRequest(SAVE_A),
        ownerId: USER_B,
      }),
    ).resolves.toMatchObject({ code: "mutation_rejected" });
    await expect(
      repositoryA.resolveChoiceForSave({
        ...choiceRequest(SAVE_A),
        effects: [{ field: "government.publicApproval", value: 100 }],
      }),
    ).resolves.toMatchObject({ code: "mutation_rejected" });
  });

  it("deletes an owned save and cascades its normalized receipt", async () => {
    await repositoryA.createSave(saveFixture(SAVE_A));
    await repositoryA.resolveChoiceForSave(choiceRequest(SAVE_A));
    await expect(repositoryA.deleteSave(SAVE_A)).resolves.toEqual({
      status: "deleted",
      saveId: SAVE_A,
    });
    const counts = await pool.query(
      `select
        (select count(*)::integer from public.saves where save_id = $1) as saves,
        (select count(*)::integer from public.mutation_history where save_id = $1) as receipts`,
      [SAVE_A],
    );
    expect(counts.rows[0]).toEqual({ saves: 0, receipts: 0 });
  });
});
