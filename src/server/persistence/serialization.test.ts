import { beforeAll, describe, expect, it, vi } from "vitest";

import {
  MAX_MONEY_MINOR,
  MIN_MONEY_MINOR,
  authoritativeSaveSchema,
} from "@/domain";
import { createValidSaveFixture } from "@/domain/test/fixtures";
import type { Database } from "@/lib/supabase/database.types";

vi.mock("server-only", () => ({}));

type SaveRow = Database["public"]["Tables"]["saves"]["Row"];
type SerializationModule = typeof import("./serialization");

let serialization: SerializationModule;

beforeAll(async () => {
  serialization = await import("./serialization");
});

function rowFromSave(saveInput: unknown): SaveRow {
  const save = authoritativeSaveSchema.parse(saveInput);
  const payload = serialization.serializeAuthoritativeSave(save);
  return {
    ...payload,
    owner_id: save.ownerId,
  };
}

describe("authoritative save database serialization", () => {
  it("round-trips every MoneyMinor field exactly without bigint JSON values", () => {
    const fixture = createValidSaveFixture();
    fixture.authoritativeState.economy.treasuryMinor = MAX_MONEY_MINOR;
    fixture.authoritativeState.economy.arrearsMinor = MIN_MONEY_MINOR;
    const save = authoritativeSaveSchema.parse(fixture);
    const payload = serialization.serializeAuthoritativeSave(save);

    expect(() => JSON.stringify(payload.authoritative_state)).not.toThrow();
    expect(JSON.stringify(payload.authoritative_state)).toContain(
      MAX_MONEY_MINOR.toString(),
    );
    expect(JSON.stringify(payload.authoritative_state)).toContain(
      MIN_MONEY_MINOR.toString(),
    );

    const decoded = serialization.deserializeAuthoritativeSave({
      ...payload,
      owner_id: save.ownerId,
    });
    expect(decoded).toEqual({ success: true, save });
  });

  it.each(["01", "-0", "1.0", "1e3", "9223372036854775808"])(
    "rejects malformed or out-of-range MoneyMinor encoding %s",
    (encoded) => {
      const row = rowFromSave(createValidSaveFixture());
      const state = structuredClone(row.authoritative_state);
      if (
        typeof state === "object" &&
        state !== null &&
        !Array.isArray(state) &&
        typeof state.economy === "object" &&
        state.economy !== null &&
        !Array.isArray(state.economy)
      ) {
        state.economy.treasuryMinor = encoded;
      }
      const decoded = serialization.deserializeAuthoritativeSave({
        ...row,
        authoritative_state: state,
      });
      expect(decoded).toMatchObject({
        success: false,
        failure: { code: "corrupted_save" },
      });
    },
  );

  it.each([
    ["save_version", "save-2.0.0", "unsupported_save_version"],
    ["schema_version", "schema-2.0.0", "unsupported_schema_version"],
    ["content_version", "mvp-0.2.0", "unsupported_content_version"],
  ] as const)(
    "returns a typed compatibility failure for %s",
    (field, value, code) => {
      const row = rowFromSave(createValidSaveFixture());
      Reflect.set(row, field, value);
      const decoded = serialization.deserializeAuthoritativeSave(row);
      expect(decoded).toMatchObject({ success: false, failure: { code } });
    },
  );

  it("rejects indexed metadata mismatch rather than repairing it", () => {
    const row = rowFromSave(createValidSaveFixture());
    const decoded = serialization.deserializeAuthoritativeSave({
      ...row,
      political_period: 1,
    });
    expect(decoded).toMatchObject({
      success: false,
      failure: { code: "corrupted_save" },
    });
  });

  it("rejects an invalid persisted event-history receipt", () => {
    const row = rowFromSave(createValidSaveFixture());
    const state = structuredClone(row.authoritative_state);
    if (typeof state === "object" && state !== null && !Array.isArray(state)) {
      Reflect.set(state, "eventHistory", [{ type: "choice_resolution" }]);
    }
    const decoded = serialization.deserializeAuthoritativeSave({
      ...row,
      authoritative_state: state,
    });
    expect(decoded).toMatchObject({
      success: false,
      failure: { code: "corrupted_save" },
    });
  });

  it("projects a long valid public name without hidden save data", () => {
    const fixture = createValidSaveFixture();
    fixture.familyIdentity.president.firstName = "A".repeat(64);
    fixture.familyIdentity.president.lastName = "B".repeat(64);
    Reflect.set(
      fixture.familyIdentity.president,
      "publicNamePreference",
      "full_name",
    );
    fixture.authoritativeState.identity.familyIdentity = structuredClone(
      fixture.familyIdentity,
    );
    const summary = serialization.projectPublicSaveSummary(
      authoritativeSaveSchema.parse(fixture),
    );
    expect(summary.presidentDisplayName).toHaveLength(129);
    expect(summary).not.toHaveProperty("authoritativeState");
    expect(summary).not.toHaveProperty("gameSeed");
  });
});
